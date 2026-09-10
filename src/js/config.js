/**
 * Dantewada ITI Student Tracking System - Shared Application Configuration
 */

const APP_CONFIG = {
  APP_NAME: 'Dantewada ITI Student Tracking System',
  PORTAL_TITLE: 'Dantewada ITI - Rozgar Vibhag Portal',
  DISTRICT: 'Dantewada',
  STATE: 'Chhattisgarh',
  CURRENT_ACADEMIC_YEAR: '2024-25',

  // Google Sheets Integration (Connected to Live Sheet)
  GOOGLE_SHEET: {
    ID: '1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0',
    URL: 'https://docs.google.com/spreadsheets/d/1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0/edit?usp=sharing',
    TABS: {
      ITI_MANAGEMENT: { name: 'ITI Management', gid: '0' },
      TRADE_MANAGEMENT: { name: 'Trade Management', gid: '1179972132' },
      STUDENT_REGISTRATION: { name: 'Student Registration', gid: '96239547' },
      STUDENT_STATUS_TRACKING: { name: 'Student Status Tracking', gid: '645142661' },
      EMPLOYMENT_TRACKING: { name: 'Employment Tracking Module', gid: '473534489' }
    },
    // Loaded dynamically from .env via /api/config (No hardcoded URLs)
    APPS_SCRIPT_WEB_APP_URL: ''
  },

  // Exact Google Sheet Column Schemas (Parity with Live Spreadsheet)
  SCHEMAS: {
    ITI_MANAGEMENT: [
      'ITI ID', 'ITI Name', 'ITI Type', 'Block', 'District', 'Address', 
      'Contact Person', 'Contact Number', 'Email', 'Status'
    ],
    TRADE_MANAGEMENT: [
      'Trade ID', 'Trade Name', 'Trade Code', 'Duration', 'ITI Name', 'Active Status'
    ],
    STUDENT_REGISTRATION: [
      'Student ID', 'Student Name', 'Father Name', 'Mother Name', 'Gender', 'Date of Birth',
      'Mobile Number', 'Alternate Mobile Number', 'Email ID', 'Address', 'Block', 'District',
      'State', 'PIN Code', 'Academic Year', 'ITI Name', 'Trade Name', 'Admission Date',
      'Course Duration', 'Expected Completion Date', 'Current Training Status',
      'Registration Number', 'ITI Roll Number', 'Government ID Reference Number'
    ],
    STUDENT_STATUS_TRACKING: [
      'Under Training', 'Completed Training', 'Appeared for Examination', 'Passed',
      'Failed', 'Dropped Out', 'Placed', 'Self Employed', 'Higher Education',
      'Unemployed', 'Not Contactable'
    ],
    EMPLOYMENT_TRACKING: [
      'Employment Status', 'Employment Type', 'Company/Organization Name', 'Job Role',
      'Job Location', 'Joining Date', 'Monthly Salary Range', 'Employment Verification Status',
      'Last Follow-up Date', 'Remark', 'Private Job', 'Government Job', 'Apprenticeship',
      'Self Employment', 'Entrepreneurship', 'Higher Education', 'Preparing for Competitive Exams',
      'Unemployed'
    ]
  },
  
  // Available Government ITIs in District
  ITIS: [
    { id: 'ITI-01', name: 'Govt. ITI Dantewada', block: 'Dantewada' },
    { id: 'ITI-02', name: 'Govt. ITI Geedam', block: 'Geedam' },
    { id: 'ITI-03', name: 'Govt. ITI Katekalyan', block: 'Katekalyan' },
    { id: 'ITI-04', name: 'Govt. ITI Kuakonda', block: 'Kuakonda' }
  ],

  // Academic Sessions
  ACADEMIC_YEARS: ['2024-25', '2023-24', '2022-23', '2021-22'],

  // Approved Core Trades
  TRADES: ['Electrician', 'Fitter', 'COPA', 'Welder', 'Mechanic Diesel', 'Sewing Technology', 'Wireman']
};

// Make accessible globally
window.APP_CONFIG = APP_CONFIG;

// Dynamically resolve APPS_SCRIPT_WEB_APP_URL across Node.js, VS Code Live Server (port 5500), and static environments
window.loadConfigPromise = (async function initEnvConfig() {
  if (typeof window === 'undefined') return '';

  // 1. Check window.__ENV__ (loaded via env.js)
  if (window.__ENV__ && window.__ENV__.APPS_SCRIPT_WEB_APP_URL) {
    const u = window.__ENV__.APPS_SCRIPT_WEB_APP_URL.trim();
    APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL = u;
    localStorage.setItem('iti_apps_script_url', u);
    return u;
  }

  // 2. Check cached URL in localStorage (fast)
  const cachedUrl = localStorage.getItem('iti_apps_script_url');
  if (cachedUrl && cachedUrl.trim()) {
    APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL = cachedUrl.trim();
  }

  // 3. Try reading env.json (Supported by VS Code Live Server without 404)
  const jsonCandidates = ['/env.json', '../env.json', '../../env.json', 'env.json'];
  for (const jsonPath of jsonCandidates) {
    try {
      const res = await fetch(jsonPath);
      if (res.ok) {
        const data = await res.json();
        if (data && data.APPS_SCRIPT_WEB_APP_URL) {
          const u = data.APPS_SCRIPT_WEB_APP_URL.trim();
          APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL = u;
          localStorage.setItem('iti_apps_script_url', u);
          return u;
        }
      }
    } catch (e) {}
  }

  // 4. Try same-origin /api/config (when running via node server.js on port 3000)
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const cfg = await res.json();
      if (cfg && cfg.APPS_SCRIPT_WEB_APP_URL) {
        const u = cfg.APPS_SCRIPT_WEB_APP_URL.trim();
        APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL = u;
        localStorage.setItem('iti_apps_script_url', u);
        return u;
      }
    }
  } catch (e) {}

  // 5. Try http://localhost:3000/api/config (when running frontend on Live Server 5500 alongside node server.js)
  try {
    const res = await fetch('http://localhost:3000/api/config');
    if (res.ok) {
      const cfg = await res.json();
      if (cfg && cfg.APPS_SCRIPT_WEB_APP_URL) {
        const u = cfg.APPS_SCRIPT_WEB_APP_URL.trim();
        APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL = u;
        localStorage.setItem('iti_apps_script_url', u);
        return u;
      }
    }
  } catch (e) {}

  // 6. Try reading .env directly via static server
  const envCandidates = ['/.env', '../.env', '../../.env', '.env'];
  for (const envPath of envCandidates) {
    try {
      const res = await fetch(envPath);
      if (res.ok) {
        const text = await res.text();
        const match = text.match(/APPS_SCRIPT_WEB_APP_URL\s*=\s*([^\r\n]+)/);
        if (match && match[1]) {
          const u = match[1].trim().replace(/^["']|["']$/g, '');
          if (u && u.startsWith('http')) {
            APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL = u;
            localStorage.setItem('iti_apps_script_url', u);
            return u;
          }
        }
      }
    } catch (e) {}
  }

  return APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL || '';
})();
