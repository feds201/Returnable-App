/**
 * FEDS Email API System
 * Three main functions for different email types
 */

// =============================================================================
// FUNCTION 1: Send Custom Message Email
// =============================================================================
function sendCustomMessage(recipients, message, subject = "FEDS Team Message") {
  // Ensure recipients is an array
  const recipientList = Array.isArray(recipients) ? recipients : [recipients];
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #fafafa; 
          color: #1a1a1a;
          line-height: 1.6;
        }
        .container { 
          max-width: 600px; 
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
            ${subject}
          </h1>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            FEDS Team Communication
          </p>
        </div>
        
        <div class="content">
          <div style="
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            border-left: 4px solid #374151;
            margin-bottom: 20px;
          ">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            Sent via FEDS Email API • 
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
      subject: subject,
      body: message,
      htmlBody: htmlBody
    });
  });

  Logger.log(`Custom message sent to ${recipientList.length} recipient(s): ${recipientList.join(', ')}`);
  return {
    success: true,
    message: `Email sent to ${recipientList.length} recipient(s)`,
    recipients: recipientList
  };
}

// =============================================================================
// FUNCTION 2: Send Pickup Schedule Reminders
// =============================================================================
function sendPickupReminders(recipients, locations, daysLeft = 3) {
  // Ensure recipients is an array
  const recipientList = Array.isArray(recipients) ? recipients : [recipients];
  
  // Create location rows
  const locationRows = locations.map((location, index) => {
    const urgencyText = daysLeft <= 1 ? 'URGENT' : daysLeft <= 3 ? 'DUE SOON' : 'SCHEDULED';
    const urgencyColor = daysLeft <= 1 ? '#dc2626' : daysLeft <= 3 ? '#d97706' : '#0369a1';
    const urgencyBg = daysLeft <= 1 ? '#fee2e2' : daysLeft <= 3 ? '#fef3c7' : '#f0f9ff';
    const rowBg = daysLeft <= 1 ? '#fef2f2' : daysLeft <= 3 ? '#fffbeb' : 'white';

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
            ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left
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
            Team pickup assignments for the next ${daysLeft} day${daysLeft !== 1 ? 's' : ''}:
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
              <strong>Instructions:</strong> Ensure all team members are assigned and equipped for their respective pickup locations.
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
      subject: `FEDS Pickup Schedule - ${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Notice`,
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

// =============================================================================
// FUNCTION 3: Test All Systems
// =============================================================================
function testAllSystems() {
  Logger.log("🧪 Starting FEDS Email API System Tests...");
  
  const testResults = {
    timestamp: new Date().toLocaleString(),
    tests: [],
    summary: { passed: 0, failed: 0 }
  };

  // Test 1: Custom Message Function
  try {
    Logger.log("📧 Test 1: Custom Message Function");
    const result1 = sendCustomMessage(
      "feds201business@gmail.com",
      "This is a test message from the FEDS Email API.\n\nSystem is working correctly!",
      "API Test - Custom Message"
    );
    testResults.tests.push({
      test: "Custom Message",
      status: "PASSED",
      details: result1
    });
    testResults.summary.passed++;
    Logger.log("✅ Custom Message test passed");
  } catch (error) {
    testResults.tests.push({
      test: "Custom Message",
      status: "FAILED",
      error: error.toString()
    });
    testResults.summary.failed++;
    Logger.log("❌ Custom Message test failed: " + error);
  }

  // Test 2: Pickup Schedule Function
  try {
    Logger.log("📅 Test 2: Pickup Schedule Function");
    const testLocations = [
      { name: "Rochester High School", address: "180 S Livernois Rd, Rochester Hills, MI", time: "9:00 AM" },
      { name: "Oakland University", address: "2200 N Squirrel Rd, Rochester, MI", time: "11:30 AM" },
      { name: "Downtown Rochester", address: "Municipal Park, Rochester, MI", time: "2:00 PM" }
    ];
    
    const result2 = sendPickupReminders(
      "feds201business@gmail.com",
      testLocations,
      2
    );
    testResults.tests.push({
      test: "Pickup Schedule",
      status: "PASSED",
      details: result2
    });
    testResults.summary.passed++;
    Logger.log("✅ Pickup Schedule test passed");
  } catch (error) {
    testResults.tests.push({
      test: "Pickup Schedule",
      status: "FAILED",
      error: error.toString()
    });
    testResults.summary.failed++;
    Logger.log("❌ Pickup Schedule test failed: " + error);
  }

  // Test 3: System Health Check
  try {
    Logger.log("🔧 Test 3: System Health Check");
    const healthCheck = {
      emailService: typeof MailApp !== 'undefined',
      logger: typeof Logger !== 'undefined',
      dateTime: new Date().getTime() > 0,
      functions: {
        sendCustomMessage: typeof sendCustomMessage === 'function',
        sendPickupReminders: typeof sendPickupReminders === 'function',
        testAllSystems: typeof testAllSystems === 'function'
      }
    };
    
    const allHealthy = Object.values(healthCheck.functions).every(f => f) && 
                     healthCheck.emailService && 
                     healthCheck.logger && 
                     healthCheck.dateTime;
    
    testResults.tests.push({
      test: "System Health",
      status: allHealthy ? "PASSED" : "FAILED",
      details: healthCheck
    });
    
    if (allHealthy) {
      testResults.summary.passed++;
      Logger.log("✅ System Health test passed");
    } else {
      testResults.summary.failed++;
      Logger.log("❌ System Health test failed");
    }
  } catch (error) {
    testResults.tests.push({
      test: "System Health",
      status: "FAILED",
      error: error.toString()
    });
    testResults.summary.failed++;
    Logger.log("❌ System Health test failed: " + error);
  }

  // Summary
  Logger.log(`\n📊 Test Summary: ${testResults.summary.passed} passed, ${testResults.summary.failed} failed`);
  
  // Send test results email
  try {
    const summaryMessage = `FEDS Email API Test Results\n\n` +
      `Timestamp: ${testResults.timestamp}\n` +
      `Tests Passed: ${testResults.summary.passed}\n` +
      `Tests Failed: ${testResults.summary.failed}\n\n` +
      `Detailed Results:\n${testResults.tests.map(t => `- ${t.test}: ${t.status}`).join('\n')}`;
    
    sendCustomMessage(
      "feds201business@gmail.com", 
      summaryMessage, 
      "FEDS Email API - Test Results"
    );
    
    Logger.log("📧 Test results email sent successfully");
  } catch (error) {
    Logger.log("❌ Failed to send test results email: " + error);
  }

  return testResults;
}

// =============================================================================
// LEGACY COMPATIBILITY (Optional)
// =============================================================================
function myFunction() {
  // For backward compatibility - runs the test system
  return testAllSystems();
}
