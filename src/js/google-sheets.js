/**
 * Dantewada ITI Student Tracking System - Google Sheets Integration Service
 * Connects directly to Google Spreadsheet ID: 1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0
 */

const GoogleSheetsService = {
  sheetId: APP_CONFIG.GOOGLE_SHEET.ID,
  tabs: APP_CONFIG.GOOGLE_SHEET.TABS,

  /**
   * Fetch rows from a specific sheet tab using JSONP
   * @param {string} gid - The Google Sheet tab GID
   * @returns {Promise<{cols: string[], rows: object[]}>}
   */
  fetchTab(gid) {
    return new Promise((resolve, reject) => {
      const callbackName = 'gSheetCb_' + Math.floor(Math.random() * 1000000);
      const timeoutTimer = setTimeout(() => {
        cleanup();
        reject(new Error('Google Sheets request timed out'));
      }, 10000);

      function cleanup() {
        clearTimeout(timeoutTimer);
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      window[callbackName] = function(response) {
        cleanup();
        if (!response || response.status !== 'ok' || !response.table) {
          return reject(new Error('Invalid response from Google Sheets'));
        }

        const table = response.table;
        const cols = table.cols.map((c, i) => (c && c.label ? c.label.trim() : `Col_${i}`));
        
        const rows = table.rows.map(r => {
          const rowObj = {};
          r.c.forEach((cell, idx) => {
            const colHeader = cols[idx] || `Col_${idx}`;
            rowObj[colHeader] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
          });
          return rowObj;
        });

        resolve({ cols, rows, total: rows.length });
      };

      const script = document.createElement('script');
      script.src = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?gid=${gid}&tqx=responseHandler:${callbackName}`;
      script.onerror = () => {
        cleanup();
        reject(new Error('Failed to load Google Sheets script'));
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Fetch Students from "Student Registration" tab (gid: 96239547)
   */
  async fetchStudents() {
    try {
      const res = await this.fetchTab(this.tabs.STUDENT_REGISTRATION.gid);
      // If rows found in Google Sheet, map them
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r['Student ID '] || r['Student ID'] || '',
          name: r['Student Name'] || '',
          fatherName: r['Father Name'] || '',
          motherName: r['Mother Name'] || '',
          gender: r['Gender'] || '',
          dob: r['Date of Birth'] || '',
          mobile: r['Mobile Number'] || '',
          altMobile: r['Alternate Mobile Number'] || '',
          email: r['Email ID'] || '',
          address: r['Address'] || '',
          block: r['Block'] || '',
          district: r['District'] || 'Dantewada',
          state: r['State'] || 'Chhattisgarh',
          pin: r['PIN Code'] || '494449',
          year: r['Academin Year'] || r['Academic Year'] || '2024-25',
          iti: r['ITI Name'] || '',
          trade: r['Trade Name '] || r['Trade Name'] || '',
          admissionDate: r['Adminission Date'] || r['Admission Date'] || '',
          duration: r['Course Duration'] || '',
          expectedDate: r['Expected Completion Date'] || '',
          trainingStatus: r['Current Training Status'] || 'Under Training',
          regNumber: r['Registration Number'] || '',
          rollNumber: r['ITI Roll Number'] || '',
          govId: r['Government ID Reference Number'] || ''
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchStudents fallback:', err.message);
      return [];
    }
  },

  /**
   * Fetch ITIs from "ITI Management" tab (gid: 0)
   */
  async fetchItis() {
    try {
      const res = await this.fetchTab(this.tabs.ITI_MANAGEMENT.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r['ITI ID'] || r['\tITI ID'] || '',
          name: r['ITI Name'] || '',
          type: r['ITI Type'] || 'Government',
          block: r['Block'] || '',
          district: r['District'] || 'Dantewada',
          address: r['Address'] || '',
          contactPerson: r['Contact Person'] || '',
          contactNumber: r['Contact Number'] || '',
          email: r['Email'] || '',
          status: r['Status'] || 'Active'
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchItis fallback:', err.message);
      return [];
    }
  },

  /**
   * Fetch Trades from "Trade Management" tab (gid: 1179972132)
   */
  async fetchTrades() {
    try {
      const res = await this.fetchTab(this.tabs.TRADE_MANAGEMENT.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r['Trade ID'] || '',
          name: r['Trade Name'] || '',
          code: r['Trade Code'] || '',
          duration: r['Duration'] || '',
          iti: r['ITI Name'] || r['\tITI Name'] || '',
          status: r['Active Status'] || 'Active'
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchTrades fallback:', err.message);
      return [];
    }
  },

  /**
   * Fetch Employment from "Employment Tracking Module" tab (gid: 473534489)
   */
  async fetchEmployment() {
    try {
      const res = await this.fetchTab(this.tabs.EMPLOYMENT_TRACKING.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          status: r['Employment Status'] || '',
          type: r['Employment Type'] || '',
          company: r['Company/Organization Name'] || '',
          role: r['Job Role'] || '',
          location: r['Job Location'] || '',
          joiningDate: r['Joining Date'] || '',
          salaryRange: r['Monthly Salary Range'] || '',
          verificationStatus: r['Employment Verification Status'] || '',
          lastFollowup: r['Last Follow-up Date'] || '',
          remark: r['Remark'] || ''
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchEmployment fallback:', err.message);
      return [];
    }
  },

  /**
   * Submit new row to Google Sheet
   * If Google Apps Script URL is set in config, it sends HTTP POST.
   * Otherwise, it stores locally in sync queue and offers download.
   */
  async submitRow(sheetTabName, dataObj) {
    const webAppUrl = APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL;
    if (webAppUrl) {
      try {
        const response = await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: sheetTabName,
            data: dataObj,
            timestamp: new Date().toISOString()
          })
        });
        return { success: true, message: 'Row sent to Google Sheet' };
      } catch (e) {
        console.error('Error writing to Google Sheet:', e);
      }
    }

    // Save to pending sync queue in localStorage
    const queue = JSON.parse(localStorage.getItem('iti_sheet_sync_queue') || '[]');
    queue.push({ sheet: sheetTabName, data: dataObj, date: new Date().toISOString() });
    localStorage.setItem('iti_sheet_sync_queue', JSON.stringify(queue));
    return { success: true, queued: true, message: 'Record saved locally and queued for Google Sheet sync' };
  },

  /**
   * Render Topbar "Connected to Google Sheet" badge and sync button
   */
  initUI() {
    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight || document.getElementById('sheetConnectionBadge')) return;

    const badge = document.createElement('a');
    badge.id = 'sheetConnectionBadge';
    badge.href = APP_CONFIG.GOOGLE_SHEET.URL;
    badge.target = '_blank';
    badge.title = 'Click to open connected Google Sheet (ITI_System_Traking)';
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    `;
    badge.innerHTML = `
      <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
      <span>Google Sheet Connected</span>
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    `;
    badge.addEventListener('mouseenter', () => {
      badge.style.background = '#d1fae5';
    });
    badge.addEventListener('mouseleave', () => {
      badge.style.background = '#ecfdf5';
    });

    topbarRight.insertBefore(badge, topbarRight.firstChild);
  }
};

window.GoogleSheetsService = GoogleSheetsService;

document.addEventListener('DOMContentLoaded', () => {
  GoogleSheetsService.initUI();
});
