// Simple lightweight HTTP server for Dantewada ITI Tracking System
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Zero-dependency .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          envVars[key] = val;
          process.env[key] = val;
        }
      }
    });
  }
  return envVars;
}

const envVars = loadEnv();
const PORT = process.env.PORT || envVars.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Standard Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // CORS: Restrict to local development origins (e.g. Live Server on 5500, Vite, localhost)
  const origin = req.headers.origin;
  if (origin && (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Return runtime configuration loaded securely from .env
  if (reqUrl === '/api/config') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    });
    const scriptUrl = envVars.APPS_SCRIPT_WEB_APP_URL || envVars.VITE_APPS_SCRIPT_URL || process.env.APPS_SCRIPT_WEB_APP_URL || process.env.VITE_APPS_SCRIPT_URL || '';
    res.end(JSON.stringify({
      APPS_SCRIPT_WEB_APP_URL: scriptUrl
    }));
    return;
  }

  // API: Optional proxy to relay submission to Google Apps Script
  if (reqUrl === '/api/sheets/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const scriptUrl = envVars.APPS_SCRIPT_WEB_APP_URL || envVars.VITE_APPS_SCRIPT_URL || process.env.APPS_SCRIPT_WEB_APP_URL || process.env.VITE_APPS_SCRIPT_URL;
      if (!scriptUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'APPS_SCRIPT_WEB_APP_URL is not configured in .env' }));
        return;
      }
      try {
        let forwardBody = body;
        const secretToken = process.env.API_SECRET_TOKEN || envVars.API_SECRET_TOKEN;
        if (secretToken) {
          try {
            const parsedObj = JSON.parse(body);
            parsedObj.token = secretToken;
            forwardBody = JSON.stringify(parsedObj);
          } catch(e) {}
        }

        const parsedUrl = new URL(scriptUrl);
        const postReq = https.request(parsedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        }, proxyRes => {
          let proxyData = '';
          proxyRes.on('data', d => { proxyData += d; });
          proxyRes.on('end', () => {
            res.writeHead(proxyRes.statusCode || 200, { 'Content-Type': 'application/json' });
            res.end(proxyData || JSON.stringify({ status: 'success' }));
          });
        });
        postReq.on('error', err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: err.message }));
        });
        postReq.write(forwardBody);
        postReq.end();
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
    return;
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  // Path Traversal & Dot-file Access Guard
  const normalizedPath = path.normalize(reqUrl).replace(/^([a-zA-Z]:)?(\.\.[\/\\])+/, '');
  const filePath = path.resolve(__dirname, '.' + (normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath));

  // Verify file path is within project root
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Block sensitive, hidden files, and backend scripts
  const baseName = path.basename(filePath).toLowerCase();
  const relPath = path.relative(__dirname, filePath).toLowerCase();
  if (baseName.startsWith('.') || baseName === 'server.js' || baseName === 'package.json' || baseName === 'package-lock.json' || relPath.includes('node_modules')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext];

  // Disallow serving unlisted file extensions
  if (!contentType) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Dantewada ITI Tracking System server is running on port ${PORT}!`);
  console.log(`Open in browser: http://localhost:${PORT}`);
  if (envVars.APPS_SCRIPT_WEB_APP_URL) {
    console.log(`[ENV] Google Apps Script URL loaded from .env successfully.`);
  } else {
    console.log(`[ENV] Note: APPS_SCRIPT_WEB_APP_URL is empty in .env. Paste your URL into .env when ready.`);
  }
});
