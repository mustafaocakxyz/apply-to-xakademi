# Form Data Collection Guide

This guide explains how to collect form data from your application form and send it to Google Sheets or alternative services.

## Option 1: Google Sheets with Google Apps Script (Recommended - Free)

### Step 1: Create a Google Sheet
1. Create a new Google Sheet
2. Add column headers in Row 1 (e.g., Timestamp, Name, Class, Hours, Capabilities, etc.)
3. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

### Step 2: Create Google Apps Script
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default code and paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them automatically
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Ad Soyad',
        'Sınıf',
        'Haftalık Çalışma Saati',
        'Kabiliyetler',
        'Önceki İş',
        'Düşünceler',
        'Örnek Sayfa Cevapları',
        'Test Onayı'
      ];
      sheet.appendRow(headers);
      
      // Format header row (optional - makes it look nice)
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
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Deploy** → **New deployment**
4. Select type: **Web app**
5. Set:
   - Description: "Form Submission Handler"
   - Execute as: **Me**
   - Who has access: **Anyone** (or "Anyone with Google account" for more security)
6. Click **Deploy** and copy the **Web App URL**

### Step 3: Update Your JavaScript
Add this function to `script.js` and call it from `showCompletionScreen()`:

```javascript
function formatFormDataForSubmission() {
    // Organize form data into a structured format
    const submission = {
        personalInfo: formData['step-3'] || {}, // Page 4: Personal Info
        capabilities: formData['step-4']?.checkboxes || [], // Page 5: Capabilities
        previousWork: formData['step-4']?.textarea || '', // Page 5: Previous work
        thoughts: formData['step-6'] || '', // Page 6: Thoughts (adjust index based on example pages)
        testConfirmation: formData['step-7'] || '', // Page 7: Test confirmation (adjust index)
        examplePages: {}
    };
    
    // Collect example page responses
    Object.keys(formData).forEach(key => {
        const stepIndex = parseInt(key.replace('step-', ''));
        const step = formSteps[stepIndex];
        if (step && (step.type === 'example-design' || step.type === 'example-software' || 
                     step.type === 'example-ai' || step.type === 'example-content')) {
            submission.examplePages[step.question] = formData[key];
        }
    });
    
    return submission;
}

async function submitToGoogleSheets() {
    const data = formatFormDataForSubmission();
    const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE'; // Replace with your Apps Script URL
    
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // With no-cors, we can't read the response, but the data should be sent
        console.log('Form data submitted successfully');
        return true;
    } catch (error) {
        console.error('Error submitting form:', error);
        return false;
    }
}
```

## Option 2: Formspree (Easiest - Free tier available)

### Setup:
1. Go to [formspree.io](https://formspree.io) and create an account
2. Create a new form and get your form endpoint URL
3. Update your `showCompletionScreen()` function:

```javascript
async function submitToFormspree() {
    const data = formatFormDataForSubmission();
    const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';
    
    try {
        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Form submitted successfully');
            return true;
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        return false;
    }
}
```

## Option 3: Email via EmailJS (Free tier available)

### Setup:
1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create an email service and template
3. Add EmailJS SDK to your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

4. Add submission function:

```javascript
function submitViaEmail() {
    emailjs.init('YOUR_PUBLIC_KEY');
    
    const data = formatFormDataForSubmission();
    const emailData = {
        to_email: 'your-email@example.com',
        subject: 'New Application Form Submission',
        message: JSON.stringify(data, null, 2)
    };
    
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailData)
        .then(() => console.log('Email sent successfully'))
        .catch(error => console.error('Error sending email:', error));
}
```

## Option 4: Custom Backend API

If you have your own backend (Node.js, Python, etc.), you can create an API endpoint:

### Example Node.js/Express endpoint:

```javascript
app.post('/api/submit-form', (req, res) => {
    const formData = req.body;
    
    // Save to database or process as needed
    console.log('Received form data:', formData);
    
    // Optionally save to Google Sheets using googleapis library
    // Or save to your database
    
    res.json({ success: true });
});
```

Then in your frontend:

```javascript
async function submitToBackend() {
    const data = formatFormDataForSubmission();
    const API_URL = 'https://your-api.com/api/submit-form';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error submitting form:', error);
        return false;
    }
}
```

## Implementation Steps

1. **Choose your preferred method** (Google Sheets is recommended for simplicity)
2. **Add the `formatFormDataForSubmission()` function** to your `script.js`
3. **Add the submission function** for your chosen method
4. **Update `showCompletionScreen()`** to call the submission function:

```javascript
function showCompletionScreen() {
    // ... existing code ...
    
    // Submit form data
    submitToGoogleSheets(); // or your chosen method
}
```

## Security Considerations

- **Google Sheets**: Use "Anyone with Google account" for better security
- **Rate Limiting**: Consider adding rate limiting to prevent spam
- **Validation**: Always validate data on the server side
- **HTTPS**: Always use HTTPS in production

## Testing

1. Fill out the form completely
2. Check your Google Sheet (or chosen service) for the new row
3. Verify all data is captured correctly
4. Test error handling (disconnect internet, etc.)

