/**
 * Handles GET requests to the web app.
 * Returns a JSON string containing dates, start times, and end times from 'Sheet1'.
 * @returns {GoogleAppsScript.Content.TextOutput} A JSON text output.
 */
function doGet() {
  const data = getEventData();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Retrieves event data (date, start time, end time) from 'Sheet1' in the active spreadsheet.
 * Assumes data starts from row 2 (header in row 1).
 * Column A: Date
 * Column B: Start Time
 * Column C: End Time
 * @returns {Array<Object>} An array of objects, where each object has 'date', 'startTime', and 'endTime' properties.
 */
function getEventData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Sheet1");

  // If the sheet doesn't exist, return an empty array.
  if (!sheet) {
    console.warn("Sheet 'Sheet1' not found.");
    return [];
  }

  const lastRow = sheet.getLastRow();

  // If there's no data beyond the header row, return an empty array.
  if (lastRow < 2) {
    console.log("No data found in Sheet1 beyond header row.");
    return [];
  }

  // Get values from columns A, B, and C, starting from row 2 to the last row.
  // Column A: Date
  // Column B: Start Time
  // Column C: End Time
  const dates = sheet.getRange("A2:A" + lastRow).getValues();
  const startTimes = sheet.getRange("B2:B" + lastRow).getValues();
  const endTimes = sheet.getRange("C2:C" + lastRow).getValues();

  const eventData = [];

  // Iterate through the rows and combine the data into objects.
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i][0];
    const startTime = startTimes[i][0];
    const endTime = endTimes[i][0];

    // Ensure date is a valid Date object before converting to ISO string.
    const formattedDate = (date && date.getTime && !isNaN(date.getTime())) ? date.toISOString() : null;
    // Ensure start time is a valid Date object before converting to ISO string.
    const formattedStartTime = (startTime && startTime.getTime && !isNaN(startTime.getTime())) ? startTime.toISOString() : null;
    // Ensure end time is a valid Date object before converting to ISO string.
    const formattedEndTime = (endTime && endTime.getTime && !isNaN(endTime.getTime())) ? endTime.toISOString() : null;

    eventData.push({
      date: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime
    });
  }

  console.log("Retrieved event data:", eventData);
  return eventData;
}

/**
 * A simple test function to log the active sheet name.
 * Useful for debugging in the Google Apps Script editor.
 */
function test() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  console.log("Active Spreadsheet Name:", spreadsheet.getName());
  console.log("Active Sheet Name:", spreadsheet.getSheetName());
}

/**
 * Handles POST requests to the web app.
 * Saves pickupDate and address to 'Sheet2'.
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);

  try {
    const data = JSON.parse(e.postData.contents);
    const mode = data.mode;

    if (mode === "submit") {
      const pickupDate = data.pickupDate;
      const address = data.address;

      if (!pickupDate || !address) {
        throw new Error("Missing required fields: pickupDate or address");
      }

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName("Sheet2");
      if (!sheet) {
        throw new Error("Sheet2 not found in the spreadsheet.");
      }

      sheet.appendRow([pickupDate, address]);

      response.setContent(JSON.stringify({ success: true }));
      return response;
    } else {
      response.setContent(JSON.stringify({ success: false, message: "Invalid mode" }));
      return response;
    }
  } catch (error) {
    console.error("doPost error:", error);
    response.setContent(JSON.stringify({ success: false, message: error.message }));
    return response;
  }
}
/**
 * Handles OPTIONS requests for CORS preflight.
 * Google Apps Script automatically handles CORS for web apps deployed with proper permissions.
 * @param {GoogleAppsScript.Events.DoGet} e
 * @returns {GoogleAppsScript.Content.TextOutput} CORS response
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

