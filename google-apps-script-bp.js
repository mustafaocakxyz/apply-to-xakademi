/**
 * Google Apps Script Code for BP Form Submission
 * 
 * INSTRUCTIONS:
 * 1. Create a NEW Google Sheet (separate from the main application form)
 * 2. Open your NEW Google Sheet
 * 3. Go to Extensions → Apps Script
 * 4. Delete any existing code
 * 5. Paste this entire code
 * 6. Click Save (Ctrl+S or Cmd+S)
 * 7. Click Deploy → New deployment
 * 8. Select type: Web app
 * 9. Set:
 *    - Description: "BP Form Submission Handler"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 10. Click Deploy
 * 11. Copy the Web App URL and use it in bp.html
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Ad Soyad',
        'Sınıf',
        'Okul / Dershane',
        'Alan',
        'Hedef Sıralama',
        'Günlük Çalışma Saati',
        'TYT Türkçe Net',
        'TYT Matematik Net',
        'AYT Matematik Net / Konular'
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
    
    // Extract form data
    const name = data.name || ''; // Ad Soyad
    const question1 = data.question1 || ''; // Sınıf
    const question2 = data.question2 || ''; // Okul / Dershane
    const question3 = data.question3 || ''; // Alan
    const question4 = data.question4 || ''; // Hedef Sıralama
    const question5 = data.question5 || ''; // Günlük Çalışma Saati
    const question6 = data.question6 || ''; // TYT Türkçe Net
    const question7 = data.question7 || ''; // TYT Matematik Net
    const question8 = data.question8 || ''; // AYT Matematik Net / Konular
    
    // Create row data
    const row = [
      new Date(), // Timestamp
      name,
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8
    ];
    
    // Append row to sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'BP Form data saved successfully' 
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
 * Run this from the Apps Script editor: Run → testBPFunction
 */
function testBPFunction() {
  const testData = {
    name: 'Test Kullanıcı',
    question1: '12. Sınıf',
    question2: 'Evet, Pazartesi-Çarşamba 14:00-18:00',
    question3: 'Sayısal',
    question4: 'İlk 1000',
    question5: '4-5 saat',
    question6: '35 net',
    question7: '30 net',
    question8: '25 net'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}
