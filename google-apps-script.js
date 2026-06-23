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
        'Görevleri Yerine Getirebilir mi?',
        'Toplantılara Katılabilir mi?',
        'Ad Soyad',
        'Sınıf',
        'Telefon',
        'Hedef',
        'Ortalama TYT Net',
        'Ortalama AYT Net',
        'Günlük Çalışma Saati',
        'Mevcut Seviye',
        'Katılma Sebepleri',
        'Beklentiler',
        'Heyecanlandıran Seçenekler',
        'İzinler'
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
    
    const expectations = data.expectations || {};
    const personalInfo = data.personalInfo || {};
    const yksInfo = data.yksInfo || {};
    const motivation = data.motivation || {};
    const permissions = Array.isArray(data.permissions)
      ? data.permissions.join(' | ')
      : '';
    const excitement = Array.isArray(motivation.excitement)
      ? motivation.excitement.join(', ')
      : '';
    
    const row = [
      new Date(),
      expectations.tasks || '',
      expectations.meetings || '',
      personalInfo.fullname || '',
      personalInfo.class || '',
      personalInfo.phone || '',
      yksInfo.goal || '',
      yksInfo.tytNet || '',
      yksInfo.aytNet || '',
      yksInfo.dailyHours || '',
      yksInfo.level || '',
      motivation.reasons || '',
      motivation.expectations || '',
      excitement,
      permissions
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
 * Test function - you can run this manually to test if the script works
 * Run this from the Apps Script editor: Run → testFunction
 */
function testFunction() {
  const testData = {
    expectations: {
      tasks: 'Evet',
      meetings: 'Evet'
    },
    personalInfo: {
      fullname: 'Test Kullanıcı',
      class: '12. Sınıf',
      phone: '0532 123 45 67'
    },
    yksInfo: {
      goal: 'İlk 1000',
      tytNet: '80 net',
      aytNet: '60 net',
      dailyHours: '4-5 saat',
      level: 'Orta'
    },
    motivation: {
      reasons: 'Mustafa Ocak ile çalışmak istiyorum',
      expectations: 'Disiplinli bir program',
      excitement: ['Mustafa Ocak ile birlikte çalışmak', 'İçeriklerde yer almak']
    },
    permissions: [
      'Çalışmalar boyunca verdiğim bilgilerin içeriklerde kullanılmasına izin veriyorum.',
      'Yazılı mesajlarımın içeriklerde kullanılmasına izin veriyorum.',
      'Sesli veya görüntülü kayıtlarımın yapılmasına ve içeriklerde kullanılmasına izin veriyorum.'
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}
