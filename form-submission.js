// Form Submission Helper Functions
// Add these functions to your script.js file

/**
 * Formats the form data into a structured object for submission
 */
function formatFormDataForSubmission() {
    // Find the index of the "Düşüncelerin" page (thoughts page)
    // This is the page after all example pages
    let thoughtsPageIndex = -1;
    let testPageIndex = -1;
    
    for (let i = 0; i < formSteps.length; i++) {
        if (formSteps[i].question === "Düşüncelerin") {
            thoughtsPageIndex = i;
        }
        if (formSteps[i].question === "Test Çalışması") {
            testPageIndex = i;
        }
    }
    
    // Organize form data into a structured format
    const submission = {
        timestamp: new Date().toISOString(),
        personalInfo: formData['step-3'] || {}, // Page 4: Personal Info (Ad-Soyad, Sınıfın, Hours)
        capabilities: formData['step-4']?.checkboxes || [], // Page 5: Selected capabilities
        previousWork: formData['step-4']?.textarea || '', // Page 5: Previous work textarea
        thoughts: thoughtsPageIndex >= 0 ? (formData[`step-${thoughtsPageIndex}`] || '') : '',
        testConfirmation: testPageIndex >= 0 ? (formData[`step-${testPageIndex}`] || '') : '',
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

/**
 * Submits form data to Google Sheets via Google Apps Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste the Google Apps Script code (see FORM_SUBMISSION_GUIDE.md)
 * 4. Deploy as Web App and copy the URL
 * 5. Replace 'YOUR_WEB_APP_URL_HERE' below with your Apps Script URL
 */
async function submitToGoogleSheets() {
    const data = formatFormDataForSubmission();
    
    // ⚠️ REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
    const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';
    
    if (WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
        console.warn('Please set your Google Apps Script URL in submitToGoogleSheets()');
        console.log('Form data (for testing):', data);
        return false;
    }
    
    try {
        // Using no-cors mode for Google Apps Script
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // With no-cors, we can't read the response, but the data should be sent
        console.log('Form data submitted to Google Sheets');
        return true;
    } catch (error) {
        console.error('Error submitting form to Google Sheets:', error);
        // Fallback: log data for manual entry
        console.log('Form data (for manual entry):', data);
        return false;
    }
}

/**
 * Alternative: Submit to Formspree
 * Sign up at https://formspree.io and get your form endpoint
 */
async function submitToFormspree() {
    const data = formatFormDataForSubmission();
    const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with your Formspree endpoint
    
    try {
        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Form submitted to Formspree successfully');
            return true;
        } else {
            throw new Error('Formspree submission failed');
        }
    } catch (error) {
        console.error('Error submitting to Formspree:', error);
        return false;
    }
}

/**
 * Alternative: Submit to custom backend API
 */
async function submitToBackend() {
    const data = formatFormDataForSubmission();
    const API_URL = 'https://your-api.com/api/submit-form'; // Replace with your API endpoint
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('Form submitted to backend successfully');
            return true;
        } else {
            throw new Error('Backend submission failed');
        }
    } catch (error) {
        console.error('Error submitting to backend:', error);
        return false;
    }
}

