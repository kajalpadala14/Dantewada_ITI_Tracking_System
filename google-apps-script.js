/**
 * GOOGLE APPS SCRIPT FOR DANTEWADA ITI STUDENT TRACKING SYSTEM
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Tj4XdmVqOdAcX0KaDi6wK5KXrWRqfFBiBAx345JHPf0/edit
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any code there, paste this code, and click "Save"
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 *    - Description: "ITI Tracking Web API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize access, and copy the Web App URL.
 * 7. Paste that Web App URL into `src/js/config.js` under `APPS_SCRIPT_WEB_APP_URL`.
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "Student Registration";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Sheet not found: " + sheetName
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) {
        rowObj[headers[j]] = data[i][j];
      }
    }
    rows.push(rowObj);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    sheet: sheetName,
    total: rows.length,
    data: rows
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var body = JSON.parse(e.postData.contents);
    var sheetName = body.sheet || "Student Registration";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Sheet not found: " + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = [];
    var inputData = body.data || body;
    
    for (var i = 0; i < headers.length; i++) {
      var headerKey = headers[i].toString().trim();
      newRow.push(inputData[headerKey] !== undefined ? inputData[headerKey] : "");
    }
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Row appended successfully to " + sheetName
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
