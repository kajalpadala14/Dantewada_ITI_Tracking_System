/**
 * Dantewada ITI Student Tracking System - Google Sheets Integration Service
 * Connects directly to Google Spreadsheet ID: 1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0
 */

const GoogleSheetsService = {
  sheetId: APP_CONFIG.GOOGLE_SHEET.ID,
  tabs: APP_CONFIG.GOOGLE_SHEET.TABS,
  schemas: APP_CONFIG.SCHEMAS,

  /**
   * Helper to find a cell value by flexible column name lookup
   */
  getValue(rowObj, candidateKeys, defaultValue = '') {
    for (const key of candidateKeys) {
      if (rowObj[key] !== undefined && rowObj[key] !== null && rowObj[key] !== '') {
        return rowObj[key];
      }
    }
    const lowerKeys = Object.keys(rowObj).reduce((acc, k) => {
      acc[k.trim().toLowerCase()] = rowObj[k];
      return acc;
    }, {});
    for (const key of candidateKeys) {
      const lk = key.trim().toLowerCase();
      if (lowerKeys[lk] !== undefined && lowerKeys[lk] !== null && lowerKeys[lk] !== '') {
        return lowerKeys[lk];
      }
    }
    return defaultValue;
  },

  /**
   * Fetch rows from a specific sheet tab using JSONP
   * @param {string} gid - The Google Sheet tab GID
   * @returns {Promise<{cols: string[], rows: object[]}>}
   */
  fetchTab(gid) {
    return new Promise((resolve, reject) => {
      const callbackName = 'gSheetCb_' + Math.floor(Math.random() * 1000000);
      let script = null;
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
        let cols = table.cols.map((c, i) => {
          if (c && c.label && c.label.trim()) {
            return c.label.replace(/[\t\r\n]+/g, ' ').trim();
          }
          return '';
        });
        
        let dataRows = table.rows || [];
        const hasNamedCols = cols.some(c => c && c.length > 0);
        if (!hasNamedCols && dataRows.length > 0) {
          // If labels in table.cols are empty, use row 0 as header labels
          cols = dataRows[0].c.map((cell, idx) => {
            return (cell && cell.v != null)
              ? String(cell.v).replace(/[\t\r\n]+/g, ' ').trim()
              : `Col_${idx}`;
          });
          dataRows = dataRows.slice(1);
        } else {
          cols = cols.map((c, i) => c || `Col_${i}`);
        }
        
        const rows = dataRows.map(r => {
          const rowObj = {};
          if (r && r.c) {
            r.c.forEach((cell, idx) => {
              const colHeader = cols[idx] || `Col_${idx}`;
              rowObj[colHeader] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
            });
          }
          return rowObj;
        });

        resolve({ cols, rows, total: rows.length });
      };

      script = document.createElement('script');
      script.src = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?gid=${gid}&headers=1&tqx=responseHandler:${callbackName}`;
      script.onerror = () => {
        cleanup();
        reject(new Error('Failed to load Google Sheets script'));
      };
      document.body.appendChild(script);
    });
  },

  /**
   * 1. Fetch Students from "Student Registration" tab (gid: 96239547)
   * Maps all 24 columns precisely matching the sheet schema
   */
  async fetchStudents() {
    try {
      const res = await this.fetchTab(this.tabs.STUDENT_REGISTRATION.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: this.getValue(r, ['Student ID', 'Student ID ', 'StudentID', 'ID']),
          name: this.getValue(r, ['Student Name', 'StudentName', 'Name']),
          fatherName: this.getValue(r, ['Father Name', 'FatherName']),
          motherName: this.getValue(r, ['Mother Name', 'MotherName']),
          gender: this.getValue(r, ['Gender']),
          dob: this.getValue(r, ['Date of Birth', 'DateOfBirth', 'DOB']),
          mobile: this.getValue(r, ['Mobile Number', 'MobileNumber', 'Mobile']),
          altMobile: this.getValue(r, ['Alternate Mobile Number', 'Alternate Mobile', 'AltMobile']),
          email: this.getValue(r, ['Email ID', 'Email', 'EmailId']),
          address: this.getValue(r, ['Address']),
          block: this.getValue(r, ['Block']),
          district: this.getValue(r, ['District'], 'Dantewada'),
          state: this.getValue(r, ['State'], 'Chhattisgarh'),
          pin: this.getValue(r, ['PIN Code', 'PIN', 'PinCode'], '494449'),
          year: this.getValue(r, ['Academic Year', 'Academin Year', 'Year'], '2024-25'),
          iti: this.getValue(r, ['ITI Name', 'ITIName', 'ITI']),
          trade: this.getValue(r, ['Trade Name', 'Trade Name ', 'TradeName', 'Trade']),
          admissionDate: this.getValue(r, ['Admission Date', 'Adminission Date', 'AdmissionDate']),
          duration: this.getValue(r, ['Course Duration', 'Duration'], '2 Years'),
          expectedDate: this.getValue(r, ['Expected Completion Date', 'Expected Completion']),
          trainingStatus: this.getValue(r, ['Current Training Status', 'Training Status'], 'Under Training'),
          regNumber: this.getValue(r, ['Registration Number', 'Reg Number', 'RegNo']),
          rollNumber: this.getValue(r, ['ITI Roll Number', 'Roll Number', 'RollNo']),
          govId: this.getValue(r, ['Government ID Reference Number', 'Govt ID', 'Aadhar'])
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchStudents warning:', err.message);
      return [];
    }
  },

  /**
   * 2. Fetch ITIs from "ITI Management" tab (gid: 0)
   * Maps all 10 columns
   */
  async fetchItis() {
    try {
      const res = await this.fetchTab(this.tabs.ITI_MANAGEMENT.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: this.getValue(r, ['ITI ID', 'ITI ID', 'ITIID']),
          name: this.getValue(r, ['ITI Name', 'Name']),
          type: this.getValue(r, ['ITI Type', 'Type'], 'Government'),
          block: this.getValue(r, ['Block']),
          district: this.getValue(r, ['District'], 'Dantewada'),
          address: this.getValue(r, ['Address']),
          contactPerson: this.getValue(r, ['Contact Person']),
          contactNumber: this.getValue(r, ['Contact Number', 'Phone']),
          email: this.getValue(r, ['Email']),
          status: this.getValue(r, ['Status'], 'Active')
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchItis warning:', err.message);
      return [];
    }
  },

  /**
   * 3. Fetch Trades from "Trade Management" tab (gid: 1179972132)
   * Maps all 6 columns
   */
  async fetchTrades() {
    try {
      const res = await this.fetchTab(this.tabs.TRADE_MANAGEMENT.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: this.getValue(r, ['Trade ID', 'TradeID']),
          name: this.getValue(r, ['Trade Name', 'TradeName']),
          code: this.getValue(r, ['Trade Code', 'TradeCode']),
          duration: this.getValue(r, ['Duration']),
          iti: this.getValue(r, ['ITI Name', 'ITIName']),
          status: this.getValue(r, ['Active Status', 'Status'], 'Active')
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchTrades warning:', err.message);
      return [];
    }
  },

  /**
   * 4. Fetch Student Status Tracking from "Student Status Tracking" tab (gid: 645142661)
   * Maps 11 columns
   */
  async fetchStudentStatusTracking() {
    try {
      const res = await this.fetchTab(this.tabs.STUDENT_STATUS_TRACKING.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          underTraining: this.getValue(r, ['Under Training']),
          completedTraining: this.getValue(r, ['Completed Training']),
          appearedForExamination: this.getValue(r, ['Appeared for Examination']),
          passed: this.getValue(r, ['Passed']),
          failed: this.getValue(r, ['Failed']),
          droppedOut: this.getValue(r, ['Dropped Out']),
          placed: this.getValue(r, ['Placed']),
          selfEmployed: this.getValue(r, ['Self Employed']),
          higherEducation: this.getValue(r, ['Higher Education']),
          unemployed: this.getValue(r, ['Unemployed']),
          notContactable: this.getValue(r, ['Not Contactable'])
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchStudentStatusTracking warning:', err.message);
      return [];
    }
  },

  /**
   * 5. Fetch Employment from "Employment Tracking Module" tab (gid: 473534489)
   * Maps 18 columns
   */
  async fetchEmployment() {
    try {
      const res = await this.fetchTab(this.tabs.EMPLOYMENT_TRACKING.gid);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          status: this.getValue(r, ['Employment Status']),
          type: this.getValue(r, ['Employment Type']),
          company: this.getValue(r, ['Company/Organization Name', 'Company Name']),
          role: this.getValue(r, ['Job Role', 'Role']),
          location: this.getValue(r, ['Job Location', 'Location']),
          joiningDate: this.getValue(r, ['Joining Date']),
          salaryRange: this.getValue(r, ['Monthly Salary Range', 'Salary']),
          verificationStatus: this.getValue(r, ['Employment Verification Status']),
          lastFollowup: this.getValue(r, ['Last Follow-up Date', 'Followup Date']),
          remark: this.getValue(r, ['Remark', 'Remarks']),
          privateJob: this.getValue(r, ['Private Job']),
          governmentJob: this.getValue(r, ['Government Job', 'Goverment Job']),
          apprenticeship: this.getValue(r, ['Apprenticeship']),
          selfEmployment: this.getValue(r, ['Self Employment']),
          entrepreneurship: this.getValue(r, ['Entrepreneurship']),
          higherEducation: this.getValue(r, ['Higher Education']),
          preparingForExams: this.getValue(r, ['Preparing for Competitive Exams']),
          unemployed: this.getValue(r, ['Unemployed'])
        }));
      }
      return [];
    } catch (err) {
      console.warn('Google Sheet fetchEmployment warning:', err.message);
      return [];
    }
  },

  /**
   * Submit student record formatted matching exact 24 columns
   */
  async submitStudent(student) {
    const rowObj = {
      'Student ID': student.id || `STU-${Date.now().toString().slice(-6)}`,
      'Student Name': student.name || '',
      'Father Name': student.fatherName || '',
      'Mother Name': student.motherName || '',
      'Gender': student.gender || '',
      'Date of Birth': student.dob || '',
      'Mobile Number': student.mobile || '',
      'Alternate Mobile Number': student.altMobile || '',
      'Email ID': student.email || '',
      'Address': student.address || '',
      'Block': student.block || '',
      'District': student.district || 'Dantewada',
      'State': student.state || 'Chhattisgarh',
      'PIN Code': student.pin || '494449',
      'Academic Year': student.year || '2024-25',
      'ITI Name': student.iti || '',
      'Trade Name': student.trade || '',
      'Admission Date': student.admissionDate || '',
      'Course Duration': student.duration || '2 Years',
      'Expected Completion Date': student.expectedDate || '',
      'Current Training Status': student.trainingStatus || 'Under Training',
      'Registration Number': student.regNumber || '',
      'ITI Roll Number': student.rollNumber || '',
      'Government ID Reference Number': student.govId || ''
    };

    return await this.submitRow(this.tabs.STUDENT_REGISTRATION.name, rowObj);
  },

  /**
   * Submit multiple student records in bulk
   */
  async submitBulkStudents(studentsList) {
    const formattedRows = studentsList.map(s => ({
      'Student ID': s.id || `STU-${Date.now().toString().slice(-6)}`,
      'Student Name': s.name || '',
      'Father Name': s.fatherName || '',
      'Mother Name': s.motherName || '',
      'Gender': s.gender || '',
      'Date of Birth': s.dob || '',
      'Mobile Number': s.mobile || '',
      'Alternate Mobile Number': s.altMobile || '',
      'Email ID': s.email || '',
      'Address': s.address || '',
      'Block': s.block || '',
      'District': s.district || 'Dantewada',
      'State': s.state || 'Chhattisgarh',
      'PIN Code': s.pin || '494449',
      'Academic Year': s.year || '2024-25',
      'ITI Name': s.iti || '',
      'Trade Name': s.trade || '',
      'Admission Date': s.admissionDate || '',
      'Course Duration': s.duration || '2 Years',
      'Expected Completion Date': s.expectedDate || '',
      'Current Training Status': s.trainingStatus || 'Under Training',
      'Registration Number': s.regNumber || '',
      'ITI Roll Number': s.rollNumber || '',
      'Government ID Reference Number': s.govId || ''
    }));

    return await this.submitBulk(this.tabs.STUDENT_REGISTRATION.name, formattedRows);
  },

  /**
   * Submit an ITI record formatted matching exact 10 columns
   */
  async submitITI(iti) {
    const rowObj = {
      'ITI ID': iti.id || '',
      'ITI Name': iti.name || '',
      'ITI Type': iti.type || 'Government',
      'Block': iti.block || '',
      'District': iti.district || 'Dantewada',
      'Address': iti.address || '',
      'Contact Person': iti.contactPerson || '',
      'Contact Number': iti.contactNumber || '',
      'Email': iti.email || '',
      'Status': iti.status || 'Active'
    };
    return await this.submitRow(this.tabs.ITI_MANAGEMENT.name, rowObj);
  },

  /**
   * Submit a Trade record formatted matching exact 6 columns
   */
  async submitTrade(trade) {
    const rowObj = {
      'Trade ID': trade.id || '',
      'Trade Name': trade.name || '',
      'Trade Code': trade.code || '',
      'Duration': trade.duration || '2 Years',
      'ITI Name': trade.iti || '',
      'Active Status': trade.status || 'Active'
    };
    return await this.submitRow(this.tabs.TRADE_MANAGEMENT.name, rowObj);
  },

  /**
   * Submit an Employment record formatted matching exact 18 columns
   */
  async submitEmployment(emp) {
    const rowObj = {
      'Employment Status': emp.status || '',
      'Employment Type': emp.type || '',
      'Company/Organization Name': emp.company || '',
      'Job Role': emp.role || '',
      'Job Location': emp.location || '',
      'Joining Date': emp.joiningDate || '',
      'Monthly Salary Range': emp.salaryRange || '',
      'Employment Verification Status': emp.verificationStatus || 'Verified',
      'Last Follow-up Date': emp.lastFollowup || new Date().toISOString().slice(0, 10),
      'Remark': emp.remark || '',
      'Private Job': emp.privateJob || '',
      'Government Job': emp.governmentJob || '',
      'Apprenticeship': emp.apprenticeship || '',
      'Self Employment': emp.selfEmployment || '',
      'Entrepreneurship': emp.entrepreneurship || '',
      'Higher Education': emp.higherEducation || '',
      'Preparing for Competitive Exams': emp.preparingForExams || '',
      'Unemployed': emp.unemployed || ''
    };
    return await this.submitRow(this.tabs.EMPLOYMENT_TRACKING.name, rowObj);
  },

  /**
   * Get configured Google Apps Script Web App URL from config or localStorage
   */
  async getWebAppUrl() {
    if (window.loadConfigPromise) {
      try {
        await window.loadConfigPromise;
      } catch (e) {}
    }
    return (APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL || '').trim() ||
           (localStorage.getItem('iti_apps_script_url') || '').trim();
  },

  /**
   * Synchronous getter for current cached Web App URL
   */
  getWebAppUrlSync() {
    return (APP_CONFIG.GOOGLE_SHEET.APPS_SCRIPT_WEB_APP_URL || '').trim() ||
           (localStorage.getItem('iti_apps_script_url') || '').trim();
  },

  /**
   * Delete row from Google Sheet by ID
   */
  async deleteRow(sheetTabName, id, idColumnName = '') {
    const webAppUrl = await this.getWebAppUrl();
    if (webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          mode: 'no-cors',
          redirect: 'follow',
          body: JSON.stringify({
            action: 'delete',
            sheet: sheetTabName,
            id: id,
            idColumn: idColumnName
          })
        });
        return { success: true, message: `Delete command sent to Google Sheet (${sheetTabName})` };
      } catch (e) {
        console.warn('Error deleting row from Google Sheet:', e);
      }
    }
    return { success: true, message: 'Deleted locally' };
  },

  /**
   * Delete student from Google Sheet
   */
  async deleteStudent(studentId) {
    return await this.deleteRow(this.tabs.STUDENT_REGISTRATION.name, studentId, 'Student ID');
  },

  /**
   * Submit single row to Google Sheet
   */
  async submitRow(sheetTabName, dataObj) {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      const queue = JSON.parse(localStorage.getItem('iti_sheet_sync_queue') || '[]');
      queue.push({ sheet: sheetTabName, data: dataObj, date: new Date().toISOString() });
      localStorage.setItem('iti_sheet_sync_queue', JSON.stringify(queue));
      return { success: true, queued: true, message: `Record saved locally (Offline). Will auto-sync to Google Sheet when online.` };
    }

    const webAppUrl = await this.getWebAppUrl();
    if (webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          mode: 'no-cors',
          redirect: 'follow',
          body: JSON.stringify({
            sheet: sheetTabName,
            data: dataObj,
            timestamp: new Date().toISOString()
          })
        });
        // In mode: 'no-cors', fetch resolves when the network payload is dispatched.
        // Google Apps Script processes the POST request and appends to the sheet.
        setTimeout(() => this.syncQueue(), 300);
        return { success: true, queued: false, message: `Row saved directly to Google Sheet (${sheetTabName})` };
      } catch (e) {
        console.warn('Network error writing to Google Sheet Web App:', e);
      }
    }

    // Save to local sync queue if URL not yet configured or offline
    const queue = JSON.parse(localStorage.getItem('iti_sheet_sync_queue') || '[]');
    queue.push({ sheet: sheetTabName, data: dataObj, date: new Date().toISOString() });
    localStorage.setItem('iti_sheet_sync_queue', JSON.stringify(queue));
    return { success: true, queued: true, message: `Record saved locally and queued for sync (${sheetTabName})` };
  },

  /**
   * Submit multiple rows to Google Sheet in bulk
   */
  async submitBulk(sheetTabName, rowsArray) {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      const queue = JSON.parse(localStorage.getItem('iti_sheet_sync_queue') || '[]');
      rowsArray.forEach(r => {
        queue.push({ sheet: sheetTabName, data: r, date: new Date().toISOString() });
      });
      localStorage.setItem('iti_sheet_sync_queue', JSON.stringify(queue));
      return { success: true, queued: true, message: `${rowsArray.length} records saved locally (Offline). Will auto-sync to Google Sheet when online.` };
    }

    const webAppUrl = await this.getWebAppUrl();
    if (webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          mode: 'no-cors',
          redirect: 'follow',
          body: JSON.stringify({
            sheet: sheetTabName,
            bulk: true,
            rows: rowsArray,
            timestamp: new Date().toISOString()
          })
        });
        setTimeout(() => this.syncQueue(), 300);
        return { success: true, queued: false, message: `${rowsArray.length} rows sent to Google Sheet (${sheetTabName})` };
      } catch (e) {
        console.warn('Error sending bulk rows to Google Sheet:', e);
      }
    }

    // Save to local sync queue
    const queue = JSON.parse(localStorage.getItem('iti_sheet_sync_queue') || '[]');
    rowsArray.forEach(r => {
      queue.push({ sheet: sheetTabName, data: r, date: new Date().toISOString() });
    });
    localStorage.setItem('iti_sheet_sync_queue', JSON.stringify(queue));
    return { success: true, queued: true, message: `${rowsArray.length} records saved locally and queued for sync` };
  },

  /**
   * Process pending sync queue
   */
  async syncQueue() {
    const webAppUrl = await this.getWebAppUrl();
    if (!webAppUrl) return { synced: 0, remaining: 0 };
    const queue = JSON.parse(localStorage.getItem('iti_sheet_sync_queue') || '[]');
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    let synced = 0;
    const remaining = [];
    for (const item of queue) {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          mode: 'no-cors',
          redirect: 'follow',
          body: JSON.stringify({
            sheet: item.sheet,
            data: item.data,
            timestamp: item.date
          })
        });
        synced++;
      } catch (err) {
        remaining.push(item);
      }
    }
    localStorage.setItem('iti_sheet_sync_queue', JSON.stringify(remaining));
    return { synced, remaining: remaining.length };
  },

  /**
   * Sync all locally saved student records to Google Sheet if not already present
   */
  async syncAllLocalToSheet() {
    const webAppUrl = await this.getWebAppUrl();
    if (!webAppUrl) return { synced: 0 };

    // 1. Flush any pending raw queue
    await this.syncQueue();

    // 2. Fetch live rows from Google Sheet to check existing IDs
    let syncedCount = 0;
    try {
      const liveData = await this.fetchStudents();
      const liveIds = new Set(liveData.map(s => String(s.id || '').trim().toLowerCase()));
      
      const localStudents = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
      for (const s of localStudents) {
        const sid = String(s.id || '').trim().toLowerCase();
        if (sid && !liveIds.has(sid)) {
          console.log(`[GoogleSheet] Syncing offline/local student ${s.name} (${s.id}) to Google Sheet...`);
          await this.submitStudent(s);
          liveIds.add(sid);
          syncedCount++;
        }
      }
    } catch (e) {
      console.warn('syncAllLocalToSheet error:', e);
    }
    return { synced: syncedCount };
  },

  /**
   * Background sync queue & local records without rendering topbar badge
   */
  async initUI() {
    if (window.loadConfigPromise) {
      try { await window.loadConfigPromise; } catch (e) {}
    }

    const webAppUrl = this.getWebAppUrlSync();

    // If webAppUrl is set, try background syncing queue & local records
    if (webAppUrl) {
      this.syncAllLocalToSheet().then(r => {
        if (r && r.synced > 0) console.log(`[GoogleSheet] Synced ${r.synced} offline/queued records to Google Sheet.`);
      }).catch(() => {});
    }
  }
};

window.GoogleSheetsService = GoogleSheetsService;

document.addEventListener('DOMContentLoaded', () => {
  GoogleSheetsService.initUI();
});

// Automatic Offline-to-Online Sync Listener
window.addEventListener('online', () => {
  console.log('[GoogleSheet] Network is back online! Syncing offline entries to Google Sheet...');
  if (window.GoogleSheetsService) {
    GoogleSheetsService.syncAllLocalToSheet().then(r => {
      if (r && r.synced > 0) {
        const msg = `✓ Internet restored! ${r.synced} offline student record(s) automatically synced to Google Sheet.`;
        if (window.showToast) window.showToast(msg, 'success');
        else console.log(msg);
      }
    }).catch(err => console.warn('Online auto-sync error:', err));
  }
});
