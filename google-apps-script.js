/**
 * Google Apps Script Code for Operasyonel Asistan Form Submission
 * 
 * INSTRUCTIONS:
 * 1. Create a NEW Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire code
 * 5. Click Save (Ctrl+S or Cmd+S)
 * 6. Click Deploy → New deployment
 * 7. Select type: Web app
 * 8. Set:
 *    - Description: "Operasyonel Asistan Form Handler"
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
        'Telefon',
        'YKS Derecesi',
        'Üniversite',
        'Bölüm',
        'Sınıf',
        'Günlük Müsaitlik',
        'Hafta Sonu Müsaitlik',
        'Yapay Zeka Kullanımı',
        'Tercih',
        'Uygunluk'
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
    
    const basicInfo = data.basicInfo || {};
    const availability = data.availability || {};
    
    const row = [
      new Date(),
      basicInfo.fullname || '',
      basicInfo.phone || '',
      basicInfo.yksRank || '',
      basicInfo.university || '',
      basicInfo.department || '',
      basicInfo.class || '',
      availability.daily || '',
      availability.weekend || '',
      data.aiUsage || '',
      data.preference || '',
      data.suitability || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - run from Apps Script editor: Run → testFunction
 */
function testFunction() {
  const testData = {
    basicInfo: {
      fullname: 'Test Kullanıcı',
      phone: '0532 123 45 67',
      yksRank: 'SAY 249',
      university: 'Test Üniversitesi',
      department: 'Bilgisayar Mühendisliği',
      class: '3'
    },
    availability: {
      daily: 'Evet',
      weekend: 'Evet'
    },
    aiUsage: 'Claude ve Cursor kullanarak içerik ve kod üretiyorum.',
    preference: 'Operasyonel süreçlerde çalışmak istiyorum.',
    suitability: 'Bugün / yarın'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}
