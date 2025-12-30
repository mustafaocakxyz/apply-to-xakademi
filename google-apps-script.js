/**
 * Google Apps Script Code for Form Submission
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire code
 * 5. Click Save (Ctrl+S or Cmd+S)
 * 6. Click Deploy → New deployment
 * 7. Select type: Web app
 * 8. Set:
 *    - Description: "Form Submission Handler"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 9. Click Deploy
 * 10. Copy the Web App URL and use it in script.js
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Ad Soyad',
        'Telefon Numarası',
        'Sınıf',
        'Haftalık Çalışma Saati',
        'Kabiliyetler',
        'Önceki İş',
        'Düşünceler',
        'Örnek Sayfa Cevapları',
        'Test Onayı'
      ];
      sheet.appendRow(headers);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#FFD700');
      headerRange.setFontColor('#000000');
    }
    
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Extract personal info
    const personalInfo = data.personalInfo || {};
    const fullname = personalInfo.fullname || '';
    const phone = personalInfo.phone || '';
    const className = personalInfo.class || '';
    const hours = personalInfo.hours || '';
    
    // Extract capabilities
    const capabilities = Array.isArray(data.capabilities) 
      ? data.capabilities.join(', ') 
      : '';
    
    // Extract other fields
    const previousWork = data.previousWork || '';
    const thoughts = data.thoughts || '';
    const testConfirmation = data.testConfirmation || '';
    
    // Format example pages data
    let examplePagesText = '';
    if (data.examplePages && Object.keys(data.examplePages).length > 0) {
      const examplePagesArray = [];
      Object.keys(data.examplePages).forEach(question => {
        const answer = data.examplePages[question];
        if (typeof answer === 'object') {
          examplePagesArray.push(`${question}: ${JSON.stringify(answer)}`);
        } else {
          examplePagesArray.push(`${question}: ${answer}`);
        }
      });
      examplePagesText = examplePagesArray.join(' | ');
    }
    
    // Create row data
    const row = [
      new Date(), // Timestamp
      fullname,
      phone,
      className,
      hours,
      capabilities,
      previousWork,
      thoughts,
      examplePagesText,
      testConfirmation
    ];
    
    // Append row to sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - you can run this manually to test if the script works
 * Run this from the Apps Script editor: Run → testFunction
 */
function testFunction() {
  const testData = {
    personalInfo: {
      fullname: 'Test User',
      phone: '0532 123 45 67',
      class: '12. Sınıf',
      hours: '10 saat'
    },
    capabilities: ['Tasarım', 'Yazılım Geliştirme'],
    previousWork: 'Test previous work',
    thoughts: 'Test thoughts',
    testConfirmation: 'Onaylıyorum',
    examplePages: {
      'Tasarım yeteneğinle ilgili...': 'Yaptım / Yapabilirim'
    }
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}

