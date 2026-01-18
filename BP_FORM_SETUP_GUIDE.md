# BP Form - Google Sheets Setup Guide

This guide will help you set up a separate Google Sheet for the BP form submissions.

## Step-by-Step Instructions

### Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it something like "X Akademi - BP Form Submissions" or "BP Başvuruları"
4. **Important**: This should be a completely separate sheet from your main application form sheet

### Step 2: Set Up Google Apps Script

1. In your new Google Sheet, click **Extensions** → **Apps Script**
2. A new tab will open with the Apps Script editor
3. Delete any existing code in the editor
4. Open the file `google-apps-script-bp.js` from your project
5. Copy **ALL** the code from that file
6. Paste it into the Apps Script editor
7. Click **Save** (Ctrl+S or Cmd+S)
8. Give your project a name like "BP Form Handler" (click the project name at the top)

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Fill in the deployment settings:
   - **Description**: "BP Form Submission Handler"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (this allows your form to submit data)
4. Click **Deploy**
5. **IMPORTANT**: Copy the **Web App URL** that appears
   - It will look like: `https://script.google.com/macros/s/AKfycbx.../exec`
   - Save this URL somewhere safe

### Step 4: Update bp.html

1. Open `bp.html` in your code editor
2. Find this line (around line 100):
   ```javascript
   const WEB_APP_URL = 'YOUR_BP_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_BP_WEB_APP_URL_HERE'` with your actual Web App URL from Step 3
4. Save the file

### Step 5: Test the Setup

1. **Test the Script**:
   - In Apps Script editor, select `testBPFunction` from the function dropdown
   - Click **Run** → `testBPFunction`
   - Check your Google Sheet - you should see headers and a test row

2. **Test the Form**:
   - Open `bp.html` in your browser (or deploy it to your website)
   - Fill out all 8 questions
   - Click "Gönder"
   - Check your Google Sheet - you should see a new row with your data

## Column Headers (Automatically Created)

The script will automatically create these columns in your sheet:

1. **Timestamp** - When the form was submitted
2. **Sınıf** - Answer to question 1
3. **Okul / Dershane** - Answer to question 2
4. **Alan** - Answer to question 3
5. **Hedef Sıralama** - Answer to question 4
6. **Günlük Çalışma Saati** - Answer to question 5
7. **TYT Türkçe Net** - Answer to question 6
8. **TYT Matematik Net** - Answer to question 7
9. **AYT Matematik Net / Konular** - Answer to question 8

## Troubleshooting

### No data appearing in sheet?

1. **Check the Web App URL** in `bp.html` is correct
2. **Check browser console** (F12 → Console) for errors
3. **Check Apps Script logs**:
   - In Apps Script editor, click **Executions** (left sidebar)
   - Look for recent executions and any error messages
4. **Verify deployment settings**:
   - Make sure "Who has access" is set to "Anyone"
   - Make sure you clicked "Deploy" after making changes

### Getting "Script function not found" error?

- This is normal when accessing the URL directly in a browser
- The script uses `doPost` (for form submissions), not `doGet`
- It will work fine when submitting the form

### Headers not appearing?

- Delete all rows in your sheet (including headers if they exist)
- The script will automatically create headers on the next submission

## Security Notes

- The Web App URL allows anyone to submit data to your sheet
- Consider adding validation or rate limiting if needed
- Keep your Web App URL private (don't share it publicly)

## Need Help?

If you encounter issues:
1. Check the Apps Script execution logs
2. Check browser console for JavaScript errors
3. Verify the Web App URL is correctly set in `bp.html`
4. Make sure you're using a separate Google Sheet (not the main form sheet)
