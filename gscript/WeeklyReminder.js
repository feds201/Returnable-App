/**
 * Weekly Reminder System
 * Processes submissions from Sheet2, filters by current week, and sends reminder emails
 * Uses the Mailer.js library for email functionality
 * 
 * IMPORTANT: Make sure to include the Mailer.js library in your Google Apps Script project
 * or copy the sendPickupReminders and sendCustomMessage functions to this file.
 */

// If Mailer.js is not included as a library, uncomment and use these wrapper functions:

/**
 * Wrapper function for sendPickupReminders - uses the local function with individual date handling
 */
function callSendPickupReminders(recipients, locations, daysLeft) {
  // Use the local sendPickupReminders function with individual date support
  try {
    return sendPickupReminders(recipients, locations, daysLeft);
  } catch (error) {
    Logger.log("❌ Error calling sendPickupReminders: " + error.toString());
    throw error;
  }
}

/**
 * Alternative: If library import doesn't work, copy this function from Mailer.js
 * Updated to handle individual pickup dates for each location
 */
function sendPickupReminders(recipients, locations, daysLeft = 3) {
  // Ensure recipients is an array
  const recipientList = Array.isArray(recipients) ? recipients : [recipients];
  
  // Create location rows with individual urgency calculation
  const locationRows = locations.map((location, index) => {
    // Use individual days if available, otherwise fall back to global daysLeft
    const locationDays = location.daysUntil !== undefined ? location.daysUntil : daysLeft;
    
    const urgencyText = locationDays <= 1 ? 'URGENT' : locationDays <= 3 ? 'DUE SOON' : 'SCHEDULED';
    const urgencyColor = locationDays <= 1 ? '#dc2626' : locationDays <= 3 ? '#d97706' : '#0369a1';
    const urgencyBg = locationDays <= 1 ? '#fee2e2' : locationDays <= 3 ? '#fef3c7' : '#f0f9ff';
    const rowBg = locationDays <= 1 ? '#fef2f2' : locationDays <= 3 ? '#fffbeb' : 'white';

    return `
      <tr style="background: ${rowBg};">
        <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #1a1a1a;">
          ${location.name || `Location ${index + 1}`}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; color: #4a4a4a;">
          ${location.address}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e5e5; color: #4a4a4a;">
          ${location.time || 'TBD'}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e5e5;">
          <span style="
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${urgencyBg};
            color: ${urgencyColor};
          ">
            ${urgencyText}
          </span>
          <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
            ${locationDays} day${locationDays !== 1 ? "s" : ""} left
          </div>
        </td>
      </tr>
    `;
  }).join("");

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FEDS Pickup Schedule</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #fafafa; 
          color: #1a1a1a;
          line-height: 1.5;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          border: 1px solid #e5e5e5; 
          border-radius: 8px;
        }
        .header { 
          padding: 24px; 
          border-bottom: 1px solid #e5e5e5; 
          background: #f8f9fa;
        }
        .content { 
          padding: 24px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 16px 0;
        }
        th { 
          background: #f8f9fa; 
          padding: 12px 16px; 
          text-align: left; 
          font-weight: 600; 
          color: #374151; 
          border-bottom: 2px solid #e5e5e5;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer { 
          padding: 16px 24px; 
          background: #f8f9fa; 
          border-top: 1px solid #e5e5e5; 
          font-size: 12px; 
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
            FEDS Pickup Schedule
          </h1>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            ${locations.length} location${locations.length !== 1 ? 's' : ''} scheduled for pickup
          </p>
        </div>

        <div class="content">
          <p style="margin: 0 0 20px 0; color: #374151;">
            Team pickup assignments with individual deadlines:
          </p>

          <table>
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Address</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${locationRows}
            </tbody>
          </table>

          <div style="
            margin-top: 24px; 
            padding: 16px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            border-left: 4px solid #374151;
          ">
            <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">
              <strong>Instructions:</strong> Each location has its own deadline. Prioritize URGENT and DUE SOON pickups.
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">
            FEDS Pickup Scheduler • 
            <span style="font-family: monospace;">${new Date().toLocaleString()}</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to all recipients
  recipientList.forEach(recipient => {
    MailApp.sendEmail({
      to: recipient,
      subject: `FEDS Pickup Schedule - Multiple Deadlines`,
      body: `Pickup schedule with ${locations.length} locations. View in HTML for details.`,
      htmlBody: htmlBody
    });
  });

  Logger.log(`Pickup schedule sent to ${recipientList.length} recipient(s) for ${locations.length} locations`);
  return {
    success: true,
    message: `Pickup schedule sent to ${recipientList.length} recipient(s)`,
    recipients: recipientList,
    locations: locations.length,
    daysLeft: daysLeft
  };
}

/**
 * Main function to process weekly reminders
 * Call this function to send out weekly reminder emails
 */
function sendWeeklyReminders() {
  try {
    Logger.log("🗓️ Starting Weekly Reminder Process...");
    
    // Get all submissions from Sheet2
    const submissions = getAllSubmissions();
    Logger.log(`📋 Found ${submissions.length} total submissions`);
    
    if (submissions.length === 0) {
      Logger.log("ℹ️ No submissions found in Sheet2");
      return { success: false, message: "No submissions found" };
    }
    
    // Filter submissions for current week
    const currentWeekSubmissions = filterCurrentWeekSubmissions(submissions);
    Logger.log(`📅 Found ${currentWeekSubmissions.length} submissions for current week`);
    
    if (currentWeekSubmissions.length === 0) {
      Logger.log("ℹ️ No submissions for current week");
      return { success: false, message: "No submissions for current week" };
    }
    
    // Convert submissions to pickup reminder format
    const pickupLocations = convertToPickupFormat(currentWeekSubmissions);
    
    // Calculate days until next Monday (typical pickup day)
    const daysUntilPickup = getDaysUntilNextMonday();
    
    // Send reminder email using Mailer.js
    const emailResult = callSendPickupReminders(
      "feds201business@gmail.com", // Default recipient
      pickupLocations,
      daysUntilPickup
    );
    
    Logger.log("✅ Weekly reminder process completed successfully");
    return {
      success: true,
      message: `Sent reminder for ${currentWeekSubmissions.length} pickup locations`,
      submissions: currentWeekSubmissions.length,
      daysUntilPickup: daysUntilPickup,
      emailResult: emailResult
    };
    
  } catch (error) {
    Logger.log("❌ Error in sendWeeklyReminders: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Retrieves all submissions from Sheet2
 * @returns {Array<Object>} Array of submission objects with pickupDate and address
 */
function getAllSubmissions() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Sheet2");
  
  if (!sheet) {
    throw new Error("Sheet2 not found in the spreadsheet");
  }
  
  const lastRow = sheet.getLastRow();
  
  // If no data beyond header row
  if (lastRow < 2) {
    Logger.log("No submission data found in Sheet2");
    return [];
  }
  
  // Get all data from columns A (pickupDate) and B (address)
  const data = sheet.getRange("A2:B" + lastRow).getValues();
  
  const submissions = [];
  
  for (let i = 0; i < data.length; i++) {
    const pickupDate = data[i][0];
    const address = data[i][1];
    
    // Skip empty rows
    if (!pickupDate || !address) {
      continue;
    }
    
    // Convert string dates to Date objects if needed
    let parsedDate;
    if (pickupDate instanceof Date) {
      parsedDate = pickupDate;
    } else {
      parsedDate = new Date(pickupDate);
    }
    
    // Skip invalid dates
    if (isNaN(parsedDate.getTime())) {
      Logger.log(`⚠️ Invalid date found in row ${i + 2}: ${pickupDate}`);
      continue;
    }
    
    submissions.push({
      pickupDate: parsedDate,
      address: address.toString().trim(),
      rowNumber: i + 2
    });
  }
  
  return submissions;
}

/**
 * Filters submissions to only include those in the current week
 * @param {Array<Object>} submissions - Array of submission objects
 * @returns {Array<Object>} Filtered submissions for current week
 */
function filterCurrentWeekSubmissions(submissions) {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const currentWeekEnd = getWeekEnd(now);
  
  Logger.log(`📅 Current week: ${currentWeekStart.toDateString()} to ${currentWeekEnd.toDateString()}`);
  
  return submissions.filter(submission => {
    const submissionDate = submission.pickupDate;
    const isInCurrentWeek = submissionDate >= currentWeekStart && submissionDate <= currentWeekEnd;
    
    if (isInCurrentWeek) {
      Logger.log(`✅ Including: ${submission.address} on ${submissionDate.toDateString()}`);
    }
    
    return isInCurrentWeek;
  });
}

/**
 * Gets the start of the week (Monday) for a given date
 * @param {Date} date - The date to get week start for
 * @returns {Date} Start of the week (Monday at 00:00:00)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Gets the end of the week (Sunday) for a given date
 * @param {Date} date - The date to get week end for
 * @returns {Date} End of the week (Sunday at 23:59:59)
 */
function getWeekEnd(date) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Converts submissions to the format expected by the Mailer.js pickup reminder function
 * @param {Array<Object>} submissions - Array of submission objects
 * @returns {Array<Object>} Array formatted for pickup reminders
 */
function convertToPickupFormat(submissions) {
  return submissions.map((submission, index) => {
    // Extract location name from address (first part before comma, or full address if no comma)
    const addressParts = submission.address.split(',');
    const locationName = addressParts[0].trim() || `Pickup Location ${index + 1}`;
    
    // Format time based on pickup date
    const timeString = formatPickupTime(submission.pickupDate);
    
    // Calculate individual days until this specific pickup date
    const daysUntilThisPickup = calculateDaysUntilDate(submission.pickupDate);
    
    return {
      name: locationName,
      address: submission.address,
      time: timeString,
      originalDate: submission.pickupDate,
      daysUntil: daysUntilThisPickup // Add individual days calculation
    };
  });
}

/**
 * Generates a pickup time string based on the date
 * @param {Date} pickupDate - The pickup date
 * @returns {string} Formatted time string
 */
function formatPickupTime(pickupDate) {
  const day = pickupDate.getDay();
  
  // Different default times based on day of week
  const timeMap = {
    1: "9:00 AM",  // Monday
    2: "10:00 AM", // Tuesday
    3: "11:00 AM", // Wednesday
    4: "2:00 PM",  // Thursday
    5: "3:00 PM",  // Friday
    6: "1:00 PM",  // Saturday
    0: "12:00 PM"  // Sunday
  };
  
  return timeMap[day] || "TBD";
}

/**
 * Calculates days until next Monday (typical pickup coordination day)
 * @returns {number} Number of days until next Monday
 */
function getDaysUntilNextMonday() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // If today is Monday, return 7 days until next Monday
  if (currentDay === 1) {
    return 7;
  }
  
  // Calculate days until next Monday
  const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay);
  return daysUntilMonday;
}

/**
 * Manual trigger function with custom recipient
 * @param {string|Array<string>} recipients - Email recipient(s)
 */
function sendWeeklyRemindersTo(recipients) {
  try {
    Logger.log("🗓️ Starting Custom Weekly Reminder Process...");
    
    const submissions = getAllSubmissions();
    const currentWeekSubmissions = filterCurrentWeekSubmissions(submissions);
    
    if (currentWeekSubmissions.length === 0) {
      Logger.log("ℹ️ No submissions for current week");
      return { success: false, message: "No submissions for current week" };
    }
    
    const pickupLocations = convertToPickupFormat(currentWeekSubmissions);
    const daysUntilPickup = getDaysUntilNextMonday();
    
    // Send to custom recipients
    const emailResult = callSendPickupReminders(
      recipients,
      pickupLocations,
      daysUntilPickup
    );
    
    Logger.log("✅ Custom weekly reminder sent successfully");
    return {
      success: true,
      message: `Sent reminder to custom recipients for ${currentWeekSubmissions.length} pickup locations`,
      emailResult: emailResult
    };
    
  } catch (error) {
    Logger.log("❌ Error in sendWeeklyRemindersTo: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test function to check current week submissions without sending emails
 */
function testWeeklyFilter() {
  try {
    Logger.log("🧪 Testing Weekly Filter...");
    
    const submissions = getAllSubmissions();
    const currentWeekSubmissions = filterCurrentWeekSubmissions(submissions);
    const pickupLocations = convertToPickupFormat(currentWeekSubmissions);
    
    Logger.log("📊 Test Results:");
    Logger.log(`Total submissions: ${submissions.length}`);
    Logger.log(`Current week submissions: ${currentWeekSubmissions.length}`);
    Logger.log(`Days until next Monday: ${getDaysUntilNextMonday()}`);
    
    if (currentWeekSubmissions.length > 0) {
      Logger.log("📋 Current week pickup locations:");
      pickupLocations.forEach((location, index) => {
        Logger.log(`${index + 1}. ${location.name} at ${location.address} (${location.time})`);
      });
    }
    
    return {
      totalSubmissions: submissions.length,
      currentWeekSubmissions: currentWeekSubmissions.length,
      pickupLocations: pickupLocations,
      daysUntilPickup: getDaysUntilNextMonday()
    };
    
  } catch (error) {
    Logger.log("❌ Error in testWeeklyFilter: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Sends reminder for ALL pickup dates
 * Bypasses all week restrictions and includes every submission
 * @param {string|Array<string>} recipients - Email recipient(s), defaults to business email
 */
function sendLatestPickupReminder(recipients = "feds201business@gmail.com") {
  try {
    Logger.log("📅 Starting All Pickup Dates Reminder Process...");
    
    // Get all submissions from Sheet2
    const submissions = getAllSubmissions();
    Logger.log(`📋 Found ${submissions.length} total submissions`);
    
    if (submissions.length === 0) {
      Logger.log("ℹ️ No submissions found in Sheet2");
      return { success: false, message: "No submissions found" };
    }
    
    // Use ALL submissions (no filtering by date)
    Logger.log(`🎯 Including ALL ${submissions.length} submissions regardless of date`);
    
    // Convert submissions to pickup reminder format
    const pickupLocations = convertToPickupFormat(submissions);
    
    // Calculate days based on the earliest upcoming date, or default to 1
    const daysUntilPickup = calculateDaysForAllPickups(submissions);
    
    // Send reminder email using Mailer.js
    const emailResult = callSendPickupReminders(
      recipients,
      pickupLocations,
      Math.max(1, daysUntilPickup) // Ensure at least 1 day for urgency calculation
    );
    
    Logger.log("✅ All pickup dates reminder process completed successfully");
    return {
      success: true,
      message: `Sent reminder for ALL ${submissions.length} pickup locations`,
      submissions: submissions.length,
      allDates: submissions.map(s => s.pickupDate.toDateString()),
      daysUntilPickup: daysUntilPickup,
      emailResult: emailResult
    };
    
  } catch (error) {
    Logger.log("❌ Error in sendLatestPickupReminder: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Calculates days between today and a target date
 * @param {Date} targetDate - The target date
 * @returns {number} Number of days (can be negative if date is in the past)
 */
function calculateDaysUntilDate(targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0); // Reset to start of day
  
  const timeDiff = target.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  Logger.log(`📅 Days until ${target.toDateString()}: ${daysDiff}`);
  return daysDiff;
}

/**
 * Calculates days for all pickups - uses the earliest upcoming date, or 3 days as default
 * @param {Array<Object>} submissions - Array of submission objects
 * @returns {number} Number of days for urgency calculation
 */
function calculateDaysForAllPickups(submissions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find the earliest upcoming date (future dates only)
  const upcomingDates = submissions
    .map(s => s.pickupDate)
    .filter(date => {
      const pickupDate = new Date(date);
      pickupDate.setHours(0, 0, 0, 0);
      return pickupDate >= today; // Only future or today's dates
    })
    .sort((a, b) => a - b); // Sort earliest first
  
  if (upcomingDates.length > 0) {
    const earliestDate = upcomingDates[0];
    const daysUntil = calculateDaysUntilDate(earliestDate);
    Logger.log(`📅 Using earliest upcoming date for urgency: ${earliestDate.toDateString()} (${daysUntil} days)`);
    return daysUntil;
  } else {
    // If no upcoming dates, use 3 as default
    Logger.log(`📅 No upcoming dates found, using default urgency (3 days)`);
    return 3;
  }
}

/**
 * Test function for all pickup dates reminder (no emails sent)
 */
function testLatestPickupFilter() {
  try {
    Logger.log("🧪 Testing All Pickup Dates Filter...");
    
    const submissions = getAllSubmissions();
    const pickupLocations = convertToPickupFormat(submissions);
    
    Logger.log("📊 Test Results:");
    Logger.log(`Total submissions: ${submissions.length}`);
    Logger.log(`All pickup locations included: ${submissions.length}`);
    
    if (submissions.length > 0) {
      const daysUntil = calculateDaysForAllPickups(submissions);
      const allDates = submissions.map(s => s.pickupDate.toDateString());
      
      Logger.log(`Days calculation for urgency: ${daysUntil}`);
      Logger.log(`All pickup dates: ${allDates.join(', ')}`);
      Logger.log("📋 All pickup locations:");
      pickupLocations.forEach((location, index) => {
        Logger.log(`${index + 1}. ${location.name} at ${location.address} (${location.time}) - ${submissions[index].pickupDate.toDateString()}`);
      });
    }
    
    return {
      totalSubmissions: submissions.length,
      allSubmissions: submissions.length,
      allDates: submissions.length > 0 ? submissions.map(s => s.pickupDate.toDateString()) : [],
      pickupLocations: pickupLocations,
      daysUntilPickup: submissions.length > 0 ? calculateDaysForAllPickups(submissions) : null
    };
    
  } catch (error) {
    Logger.log("❌ Error in testLatestPickupFilter: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// =============================================================================
// CRON JOB CONFIGURATION - Easy to modify
// =============================================================================

/**
 * Configuration for the daily cron job
 * Easily changeable settings for when emails should be sent
 */
const CRON_CONFIG = {
  // Days of the week to send emails (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
  emailDays: [1, 4], // Monday and Thursday by default
  
  // Email recipients for automated emails
  recipients: "feds201business@gmail.com",
  
  // Email type: "week" for current week only, "all" for all pickup dates
  emailType: "week", // Change to "all" if you want all pickup dates instead
  
  // Enable/disable the cron job
  enabled: true
};

/**
 * MAIN CRON FUNCTION - Run this daily at 6 AM
 * This is the single function to call from your cron job
 * It will automatically check the day and send emails only when configured
 */
function dailyCronJob() {
  try {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    Logger.log(`🕕 Daily Cron Job triggered at 6 AM on ${dayNames[currentDay]} (${today.toDateString()})`);
    
    // Check if cron job is enabled
    if (!CRON_CONFIG.enabled) {
      Logger.log("⏸️ Cron job is disabled in configuration");
      return { success: false, message: "Cron job disabled" };
    }
    
    // Check if today is a configured email day
    if (!CRON_CONFIG.emailDays.includes(currentDay)) {
      Logger.log(`📅 Today is ${dayNames[currentDay]}, not in configured email days: ${CRON_CONFIG.emailDays.map(d => dayNames[d]).join(', ')}`);
      return { success: false, message: `Not an email day (${dayNames[currentDay]})` };
    }
    
    Logger.log(`✅ Today is ${dayNames[currentDay]} - proceeding with email send`);
    
    // Send emails based on configured type
    let result;
    if (CRON_CONFIG.emailType === "all") {
      Logger.log("📧 Sending ALL pickup dates email...");
      result = sendLatestPickupReminder(CRON_CONFIG.recipients);
    } else {
      Logger.log("📧 Sending CURRENT WEEK pickup dates email...");
      result = sendCurrentWeekPickupReminder(CRON_CONFIG.recipients);
    }
    
    // Log the result
    if (result.success) {
      Logger.log(`✅ Cron job completed successfully: ${result.message}`);
    } else {
      Logger.log(`⚠️ Cron job completed with issues: ${result.message}`);
    }
    
    return result;
    
  } catch (error) {
    Logger.log(`❌ Error in dailyCronJob: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Send pickup reminders for CURRENT WEEK ONLY
 * This function filters to only include submissions in the current week
 * @param {string|Array<string>} recipients - Email recipient(s)
 */
function sendCurrentWeekPickupReminder(recipients = "feds201business@gmail.com") {
  try {
    Logger.log("📅 Starting Current Week Pickup Reminder Process...");
    
    // Get all submissions from Sheet2
    const submissions = getAllSubmissions();
    Logger.log(`📋 Found ${submissions.length} total submissions`);
    
    if (submissions.length === 0) {
      Logger.log("ℹ️ No submissions found in Sheet2");
      return { success: false, message: "No submissions found" };
    }
    
    // Filter to CURRENT WEEK ONLY
    const currentWeekSubmissions = filterCurrentWeekSubmissions(submissions);
    Logger.log(`📅 Found ${currentWeekSubmissions.length} submissions for current week`);
    
    if (currentWeekSubmissions.length === 0) {
      Logger.log("ℹ️ No submissions for current week");
      return { success: false, message: "No submissions for current week" };
    }
    
    // Convert submissions to pickup reminder format
    const pickupLocations = convertToPickupFormat(currentWeekSubmissions);
    
    // Calculate days based on earliest pickup in current week
    const daysUntilPickup = calculateDaysForAllPickups(currentWeekSubmissions);
    
    // Send reminder email
    const emailResult = callSendPickupReminders(
      recipients,
      pickupLocations,
      Math.max(1, daysUntilPickup)
    );
    
    Logger.log("✅ Current week pickup reminder process completed successfully");
    return {
      success: true,
      message: `Sent reminder for ${currentWeekSubmissions.length} pickup locations in current week`,
      submissions: currentWeekSubmissions.length,
      weekDates: currentWeekSubmissions.map(s => s.pickupDate.toDateString()),
      daysUntilPickup: daysUntilPickup,
      emailResult: emailResult
    };
    
  } catch (error) {
    Logger.log("❌ Error in sendCurrentWeekPickupReminder: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test the cron job functionality without actually running it
 * Use this to see what would happen on different days
 */
function testCronJob() {
  try {
    Logger.log("🧪 Testing Cron Job Configuration...");
    
    const today = new Date();
    const currentDay = today.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    Logger.log("📊 Cron Job Test Results:");
    Logger.log(`Current day: ${dayNames[currentDay]} (${currentDay})`);
    Logger.log(`Configured email days: ${CRON_CONFIG.emailDays.map(d => dayNames[d]).join(', ')}`);
    Logger.log(`Email type: ${CRON_CONFIG.emailType}`);
    Logger.log(`Recipients: ${CRON_CONFIG.recipients}`);
    Logger.log(`Enabled: ${CRON_CONFIG.enabled}`);
    
    const wouldSendToday = CRON_CONFIG.enabled && CRON_CONFIG.emailDays.includes(currentDay);
    Logger.log(`Would send email today: ${wouldSendToday ? 'YES' : 'NO'}`);
    
    if (wouldSendToday) {
      // Test what would be sent
      const submissions = getAllSubmissions();
      if (CRON_CONFIG.emailType === "week") {
        const weekSubmissions = filterCurrentWeekSubmissions(submissions);
        Logger.log(`📋 Would send ${weekSubmissions.length} current week submissions`);
      } else {
        Logger.log(`📋 Would send all ${submissions.length} submissions`);
      }
    }
    
    return {
      currentDay: dayNames[currentDay],
      wouldSendToday: wouldSendToday,
      configuration: CRON_CONFIG
    };
    
  } catch (error) {
    Logger.log("❌ Error in testCronJob: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Manually change the cron configuration
 * @param {Array<number>} emailDays - Array of day numbers (0-6) when emails should be sent
 * @param {string} emailType - "week" or "all"
 * @param {string|Array<string>} recipients - Email recipients
 */
function updateCronConfig(emailDays, emailType = "week", recipients = "feds201business@gmail.com") {
  CRON_CONFIG.emailDays = emailDays;
  CRON_CONFIG.emailType = emailType;
  CRON_CONFIG.recipients = recipients;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  Logger.log(`✅ Cron configuration updated:`);
  Logger.log(`Email days: ${emailDays.map(d => dayNames[d]).join(', ')}`);
  Logger.log(`Email type: ${emailType}`);
  Logger.log(`Recipients: ${recipients}`);
  
  return CRON_CONFIG;
}

/**
 * Automated trigger function (can be set up with Google Apps Script triggers)
 * Runs every Monday morning to send weekly reminders
 */
function automatedWeeklyReminder() {
  try {
    Logger.log("🤖 Automated Weekly Reminder Triggered");
    
    // Only run on Mondays
    const today = new Date();
    if (today.getDay() !== 1) {
      Logger.log("ℹ️ Not Monday, skipping automated reminder");
      return { success: false, message: "Not Monday" };
    }
    
    return sendWeeklyReminders();
    
  } catch (error) {
    Logger.log("❌ Error in automatedWeeklyReminder: " + error.toString());
    return { success: false, error: error.toString() };
  }
}
