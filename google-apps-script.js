/**
 * GOOGLE APPS SCRIPT FOR DANTEWADA ITI STUDENT TRACKING SYSTEM
 * 
 * SPREADSHEET URL:
 * https://docs.google.com/spreadsheets/d/1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0/edit
 * 
 * 5 CONNECTED TABS & SCHEMAS:
 * 1. "ITI Management" (10 columns)
 * 2. "Trade Management" (6 columns)
 * 3. "Student Registration" (24 columns)
 * 4. "Student Status Tracking" (11 columns)
 * 5. "Employment Tracking Module" (18 columns)
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. In Google Sheets, click "Extensions" > "Apps Script".
 * 2. Replace any existing code with this file and click "Save" (Ctrl+S).
 * 3. Click "Deploy" > "New deployment".
 * 4. Select Type: "Web app".
 *    - Description: "Dantewada ITI Live Sync API v2"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 6. Paste the URL into `src/js/config.js` under `APPS_SCRIPT_WEB_APP_URL`.
 */

var SCHEMAS = {
  "ITI Management": [
    "ITI ID", "ITI Name", "ITI Type", "Block", "District", "Address",
    "Contact Person", "Contact Number", "Email", "Status"
  ],
  "Trade Management": [
    "Trade ID", "Trade Name", "Trade Code", "Duration", "ITI Name", "Active Status"
  ],
  "Student Registration": [
    "Student ID", "Student Name", "Father Name", "Mother Name", "Gender", "Date of Birth",
    "Mobile Number", "Alternate Mobile Number", "Email ID", "Address", "Block", "District",
    "State", "PIN Code", "Academic Year", "ITI Name", "Trade Name", "Admission Date",
    "Course Duration", "Expected Completion Date", "Current Training Status",
    "Registration Number", "ITI Roll Number", "Government ID Reference Number"
  ],
  "Student Status Tracking": [
    "Under Training", "Completed Training", "Appeared for Examination", "Passed",
    "Failed", "Dropped Out", "Placed", "Self Employed", "Higher Education",
    "Unemployed", "Not Contactable"
  ],
  "Employment Tracking Module": [
    "Employment Status", "Employment Type", "Company/Organization Name", "Job Role",
    "Job Location", "Joining Date", "Monthly Salary Range", "Employment Verification Status",
    "Last Follow-up Date", "Remark", "Private Job", "Government Job", "Apprenticeship",
    "Self Employment", "Entrepreneurship", "Higher Education", "Preparing for Competitive Exams",
    "Unemployed"
  ]
};

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
    
    // Action to fetch all 5 sheets in a single call
    if (action === "getAll") {
      var allData = {};
      for (var sName in SCHEMAS) {
        allData[sName] = getSheetRows(ss, sName);
      }
      return jsonOutput({
        status: "success",
        allData: allData
      });
    }

    var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "Student Registration";
    var rows = getSheetRows(ss, sheetName);
    
    return jsonOutput({
      status: "success",
      sheet: sheetName,
      total: rows.length,
      data: rows
    });
  } catch (err) {
    return jsonOutput({
      status: "error",
      message: err.toString()
    });
  }
}

function getSheetRows(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var rawHeaders = data[0];
  var headers = [];
  for (var h = 0; h < rawHeaders.length; h++) {
    headers.push(rawHeaders[h].toString().replace(/[\t\r\n]+/g, ' ').trim());
  }
  
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    var hasContent = false;
    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) {
        var val = data[i][j];
        rowObj[headers[j]] = val !== null && val !== undefined ? val : "";
        if (val !== "" && val !== null && val !== undefined) hasContent = true;
      }
    }
    if (hasContent) {
      rows.push(rowObj);
    }
  }
  return rows;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var body = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (ex) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }
    
    var sheetName = body.sheet || "Student Registration";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (SCHEMAS[sheetName]) {
        sheet.appendRow(SCHEMAS[sheetName]);
      }
    }
    
    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (headers.length === 0 || headers[0] === "") {
      if (SCHEMAS[sheetName]) {
        sheet.getRange(1, 1, 1, SCHEMAS[sheetName].length).setValues([SCHEMAS[sheetName]]);
        headers = SCHEMAS[sheetName];
      }
    }

    // 1. Check if DELETE Action
    if (body.action === "delete" || body.action === "deleteRow") {
      var idToDelete = (body.id || body.studentId || "").toString().trim().toLowerCase();
      var idColIndex = 0;
      if (body.idColumn) {
        for (var c = 0; c < headers.length; c++) {
          if (headers[c].toString().toLowerCase() === body.idColumn.toString().toLowerCase()) {
            idColIndex = c;
            break;
          }
        }
      }
      var sheetData = sheet.getDataRange().getValues();
      var deletedCount = 0;
      for (var r = sheetData.length - 1; r >= 1; r--) {
        var cellVal = (sheetData[r][idColIndex] || "").toString().trim().toLowerCase();
        if (cellVal === idToDelete) {
          sheet.deleteRow(r + 1);
          deletedCount++;
        }
      }
      return jsonOutput({
        status: "success",
        message: "Deleted " + deletedCount + " row(s) matching ID: " + body.id,
        deleted: deletedCount
      });
    }

    // 2. Check if CLEANUP DUPLICATES Action
    if (body.action === "cleanup" || body.action === "cleanupDuplicates") {
      var sheetData = sheet.getDataRange().getValues();
      var seenIds = {};
      var dedupCount = 0;
      for (var r = sheetData.length - 1; r >= 1; r--) {
        var sid = (sheetData[r][0] || "").toString().trim().toLowerCase();
        if (sid) {
          if (seenIds[sid]) {
            sheet.deleteRow(r + 1);
            dedupCount++;
          } else {
            seenIds[sid] = true;
          }
        }
      }
      return jsonOutput({
        status: "success",
        message: "Cleaned up " + dedupCount + " duplicate row(s)",
        deleted: dedupCount
      });
    }
    
    // 3. Check if bulk insert
    if (body.bulk && Array.isArray(body.rows)) {
      var rowsToAppend = [];
      for (var r = 0; r < body.rows.length; r++) {
        rowsToAppend.push(buildRowFromData(headers, body.rows[r]));
      }
      if (rowsToAppend.length > 0) {
        var startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
      }
      return jsonOutput({
        status: "success",
        message: body.rows.length + " rows appended successfully to " + sheetName
      });
    }
    
    // 4. Single row insert or update existing by ID
    var inputData = body.data || body;
    var newRow = buildRowFromData(headers, inputData);
    var newId = (inputData["Student ID"] || inputData["ITI ID"] || inputData["Trade ID"] || newRow[0] || "").toString().trim().toLowerCase();

    var existingData = sheet.getDataRange().getValues();
    var existingRowIdx = -1;
    if (newId) {
      for (var rowI = 1; rowI < existingData.length; rowI++) {
        var rowCellId = (existingData[rowI][0] || "").toString().trim().toLowerCase();
        if (rowCellId === newId) {
          existingRowIdx = rowI + 1;
          break;
        }
      }
    }

    if (existingRowIdx > 0) {
      sheet.getRange(existingRowIdx, 1, 1, headers.length).setValues([newRow]);
      return jsonOutput({
        status: "success",
        message: "Row updated successfully in " + sheetName + " (ID: " + newId + ")"
      });
    } else {
      sheet.appendRow(newRow);
      return jsonOutput({
        status: "success",
        message: "Row appended successfully to " + sheetName
      });
    }
  } catch (err) {
    return jsonOutput({
      status: "error",
      message: err.toString()
    });
  }
}

function buildRowFromData(headers, inputData) {
  var row = [];
  var lowerInput = {};
  for (var k in inputData) {
    lowerInput[k.toString().replace(/[\t\r\n]+/g, ' ').trim().toLowerCase()] = inputData[k];
  }
  
  for (var i = 0; i < headers.length; i++) {
    var rawHeader = headers[i].toString();
    var cleanHeader = rawHeader.replace(/[\t\r\n]+/g, ' ').trim();
    var lowerHeader = cleanHeader.toLowerCase();
    
    if (inputData[rawHeader] !== undefined && inputData[rawHeader] !== null) {
      row.push(inputData[rawHeader]);
    } else if (inputData[cleanHeader] !== undefined && inputData[cleanHeader] !== null) {
      row.push(inputData[cleanHeader]);
    } else if (lowerInput[lowerHeader] !== undefined && lowerInput[lowerHeader] !== null) {
      row.push(lowerInput[lowerHeader]);
    } else {
      row.push("");
    }
  }
  return row;
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this function once in Apps Script Editor to guarantee all 5 sheets
 * exist with their exact columns properly set up!
 */
function initSheetHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var sheetName in SCHEMAS) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    var requiredHeaders = SCHEMAS[sheetName];
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.getRange(1, 1, 1, requiredHeaders.length).setFontWeight("bold");
  }
  Logger.log("All 5 sheet schemas initialized successfully!");
}

/**
 * Run this function in Apps Script Editor to clean up duplicate records in Google Sheets!
 */
function cleanupDuplicates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Student Registration");
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  var seenIds = {};
  var count = 0;
  for (var r = data.length - 1; r >= 1; r--) {
    var sid = (data[r][0] || "").toString().trim().toLowerCase();
    if (sid) {
      if (seenIds[sid]) {
        sheet.deleteRow(r + 1);
        count++;
      } else {
        seenIds[sid] = true;
      }
    }
  }
  Logger.log("Removed " + count + " duplicate rows from Student Registration!");
}

