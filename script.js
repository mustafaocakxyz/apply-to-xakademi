// Application state
let currentStep = 0;
let formData = {};
let formSteps = [];
let lastSubmittedTalents = []; // Track last submitted talents to detect changes

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const formScreen = document.getElementById('form-screen');
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');
const formContent = document.getElementById('form-content');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    initWelcomeAnimations();
    
    startBtn.addEventListener('click', startForm);
    backBtn.addEventListener('click', goToPreviousStep);
});

function initWelcomeAnimations() {
    // Trigger animations on welcome page elements
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeText = document.querySelector('.welcome-text');
    const ctaButton = document.querySelector('.cta-button');
    const listItems = document.querySelectorAll('.welcome-list li');
    
    // Animate title first
    if (welcomeTitle) {
        setTimeout(() => welcomeTitle.classList.add('animate'), 100);
    }
    
    // Animate text after title
    if (welcomeText) {
        setTimeout(() => welcomeText.classList.add('animate'), 400);
    }
    
    // Animate list items with staggered delay (all at once, CSS handles the delay)
    listItems.forEach((item) => {
        setTimeout(() => item.classList.add('animate'), 1000);
    });
    
    // Animate button last
    if (ctaButton) {
        setTimeout(() => ctaButton.classList.add('animate'), 1300);
    }
}

function startForm() {
    welcomeScreen.classList.remove('active');
    formScreen.classList.add('active');
    currentStep = 0;
    renderCurrentStep();
    updateProgress();
}

function goToPreviousStep() {
    if (currentStep > 0) {
        currentStep--;
        renderCurrentStep();
        updateProgress();
        
        // If we're going back to Page 5 (capabilities page), we might need to clean up example pages
        // But we'll let insertExamplePages handle it when they submit again
    } else {
        // Go back to welcome screen
        formScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    }
}

function goToNextStep() {
    // Save current step data
    saveCurrentStepData();
    
    // Check if we just completed Page 5 (capabilities page, index 4) and need to insert/update example pages
    if (currentStep === 4 && formSteps[currentStep] && formSteps[currentStep].type === 'mixed') {
        const oldStepCount = formSteps.length;
        insertExamplePages();
        const newStepCount = formSteps.length;
        
        // If we removed pages and were on a later step, we might need to adjust
        // But since we're on step 4, we'll go to step 5 next, which should be correct
    }
    
    if (currentStep < formSteps.length - 1) {
        currentStep++;
        renderCurrentStep();
        updateProgress();
    } else {
        // Form completed - show completion screen
        showCompletionScreen();
    }
}

function insertExamplePages() {
    // Get selected capabilities from Page 5
    const selectedCapabilities = formData['step-4']?.checkboxes || [];
    
    // Check if talents have changed
    const talentsChanged = JSON.stringify(selectedCapabilities.sort()) !== JSON.stringify(lastSubmittedTalents.sort());
    
    if (!talentsChanged && lastSubmittedTalents.length > 0) {
        // Talents haven't changed, no need to update pages
        return;
    }
    
    // Map of capability to example page config
    const capabilityPages = {
        'Tasarım': {
            question: 'Tasarım yeteneğinle ilgili...',
            type: 'example-design',
            text: 'Aşağıdaki resimlerde 3d mockuplar, eğitim materyali örnekleri gibi tasarımlar göreceksin. <br><br> Bu tasarımları veya benzerleini yapabilir misin?',
            images: ['assets/pord_mockup.jpg', 'assets/booklayout.jpg'],
            options: ['Yaptım / Yapabilirim', 'Nasıl yapılacağını öğrenebilirim', 'Bu seviyede değilim']
        },
        'Yazılım Geliştirme': {
            question: 'Yazılım yeteneğinle ilgili...',
            type: 'example-software',
            text: 'Aşağıdaki resimde örnek bir website tasarımı var. <br><br> Bu websiteyi ve benzerlerini yapabilir misin?',
            images: ['assets/website_example_4.jpg'],
            options: ['Yaptım / Yapabilirim', 'Nasıl yapılacağını öğrenebilirim', 'Bu seviyede değilim']
        },
        'Yapay Zeka Araçları': {
            question: 'Yapay Zeka Araçları yeteneğinle ilgili...',
            type: 'example-ai',
            text: 'Yapay zeka araçlarının şu maddeler için (biri veya birden fazlası için cevap verebilirsin) kullanımlarına örnekler ver: <br><br> <ul><li>YKS öğrencisi için</li><li>YKS içeriği üretenler için</li><li>YKS ders materyali hazırlayanlar için</li></ul>'
        },
        'İçerik Yazma / Üretme': {
            question: 'İçerik Yazma / Üretme yeteneğinle ilgili...',
            type: 'example-content',
            text: 'YouTube kanalımızda yayınlanacak bir YKS videosu hazırladığını düşünelim.',
            fields: [
                { label: 'Videoya bir başlık ver:', name: 'video-title' },
                { label: 'Videonun küçük resmini tarif et:', name: 'video-thumbnail' },
                { label: 'Videonun giriş cümlesi:', name: 'video-intro' },
                { label: 'Videonun aktardığı fikirler (1 - 4 adet):', name: 'video-ideas' }
            ]
        }
    };
    
    // Find the index where we need to insert (after Page 5, before Page 6)
    // Page 5 is at index 4, so we insert at index 5
    const insertIndex = 5;
    
    // Remove old example pages if they exist
    const examplePageTypes = ['example-design', 'example-software', 'example-ai', 'example-content'];
    
    // First, collect indices of example pages to remove and clean up their form data
    const indicesToRemove = [];
    for (let i = insertIndex; i < formSteps.length; i++) {
        if (examplePageTypes.includes(formSteps[i].type)) {
            indicesToRemove.push(i);
            // Clean up form data for this step
            delete formData[`step-${i}`];
        }
    }
    
    // Remove example pages from the end backwards to maintain correct indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        const indexToRemove = indicesToRemove[i];
        formSteps.splice(indexToRemove, 1);
        
        // If we're currently on or after a removed page, adjust currentStep
        if (currentStep > indexToRemove) {
            currentStep--;
        }
    }
    
    // Insert new example pages in the order they were selected
    if (selectedCapabilities.length > 0) {
        selectedCapabilities.forEach((capability, index) => {
            if (capabilityPages[capability]) {
                formSteps.splice(insertIndex + index, 0, capabilityPages[capability]);
            }
        });
    }
    
    // Update last submitted talents
    lastSubmittedTalents = [...selectedCapabilities];
}

function saveCurrentStepData() {
    const step = formSteps[currentStep];
    if (!step) return;

    if (step.type === 'info') {
        formData[`step-${currentStep}`] = 'confirmed';
    } else if (step.type === 'text') {
        const input = document.querySelector(`input[name="question-${currentStep}"]`);
        if (input) formData[`step-${currentStep}`] = input.value;
    } else if (step.type === 'textarea') {
        const textarea = document.querySelector(`textarea[name="question-${currentStep}"]`);
        if (textarea) formData[`step-${currentStep}`] = textarea.value;
    } else if (step.type === 'checkbox') {
        const checked = Array.from(document.querySelectorAll(`input[name="question-${currentStep}"]:checked`))
            .map(el => el.value);
        formData[`step-${currentStep}`] = checked;
    } else if (step.type === 'multiple-inputs') {
        const inputs = {};
        step.fields.forEach(field => {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (input) inputs[field.name] = input.value;
        });
        formData[`step-${currentStep}`] = inputs;
    } else if (step.type === 'mixed') {
        const data = {};
        if (step.checkboxes) {
            const checked = Array.from(document.querySelectorAll(`input[name="checkboxes-${currentStep}"]:checked`))
                .map(el => el.value);
            data.checkboxes = checked;
        }
        if (step.textareaLabel) {
            const textarea = document.querySelector(`textarea[name="textarea-${currentStep}"]`);
            if (textarea) data.textarea = textarea.value;
        }
        formData[`step-${currentStep}`] = data;
    } else if (step.type === 'example-design' || step.type === 'example-software') {
        const selected = document.querySelector(`input[name="example-${currentStep}"]:checked`);
        if (selected) formData[`step-${currentStep}`] = selected.value;
    } else if (step.type === 'example-ai') {
        const textarea = document.querySelector(`textarea[name="example-ai-${currentStep}"]`);
        if (textarea) formData[`step-${currentStep}`] = textarea.value;
    } else if (step.type === 'example-content') {
        const data = {};
        step.fields.forEach(field => {
            const textarea = document.querySelector(`textarea[name="${field.name}-${currentStep}"]`);
            if (textarea) data[field.name] = textarea.value;
        });
        formData[`step-${currentStep}`] = data;
    }
}

function renderCurrentStep() {
    if (formSteps.length === 0) {
        formContent.innerHTML = '<div class="form-step active"><p style="color: #FFD700; font-size: 1.25rem;">Form soruları yakında eklenecek...</p></div>';
        backBtn.classList.remove('hidden');
        return;
    }

    const step = formSteps[currentStep];
    if (!step) return;

    // Hide back button on first step
    if (currentStep === 0) {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }

    // Create form step HTML
    let answersHTML = '';
    
    if (step.type === 'info') {
        // Info page with button
        answersHTML = `
            <div class="form-text">${step.text}</div>
            <button class="form-info-button" onclick="handleNext()">${step.buttonText}</button>
        `;
    } else if (step.type === 'radio') {
        answersHTML = step.options.map((option, index) => `
            <div class="option">
                <input type="radio" id="option-${index}" name="question-${currentStep}" value="${option}">
                <label for="option-${index}">${option}</label>
            </div>
        `).join('');
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'checkbox') {
        answersHTML = step.options.map((option, index) => `
            <div class="option">
                <input type="checkbox" id="option-${index}" name="question-${currentStep}" value="${option}">
                <label for="option-${index}">${option}</label>
            </div>
        `).join('');
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'text') {
        answersHTML = `<input type="text" class="text-input" name="question-${currentStep}" placeholder="${step.placeholder || ''}">`;
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'textarea') {
        const className = step.long ? 'textarea-input long' : 'textarea-input';
        if (step.label) {
            answersHTML = `<div class="form-field-group">
                <label class="form-field-label">${step.label}</label>
                <textarea class="${className}" name="question-${currentStep}" placeholder="${step.placeholder || ''}"></textarea>
            </div>`;
        } else {
            answersHTML = `<textarea class="${className}" name="question-${currentStep}" placeholder="${step.placeholder || ''}"></textarea>`;
        }
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'multiple-inputs') {
        answersHTML = step.fields.map(field => `
            <div class="form-field-group">
                <label class="form-field-label">${field.label}</label>
                <input type="text" class="text-input" name="${field.name}" placeholder="${field.placeholder || ''}">
            </div>
        `).join('');
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'mixed') {
        if (step.checkboxes) {
            answersHTML += `<div class="form-field-group">
                <label class="form-field-label">${step.checkboxLabel}</label>
                <div class="form-answers">
                    ${step.checkboxes.map((option, index) => `
                        <div class="option">
                            <input type="checkbox" id="checkbox-${index}" name="checkboxes-${currentStep}" value="${option}">
                            <label for="checkbox-${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }
        if (step.textareaLabel) {
            answersHTML += `<div class="form-field-group">
                <label class="form-field-label">${step.textareaLabel}</label>
                <textarea class="textarea-input" name="textarea-${currentStep}" placeholder="${step.textareaPlaceholder || ''}"></textarea>
            </div>`;
        }
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'example-design' || step.type === 'example-software') {
        // Example pages with images and radio buttons
        answersHTML = `<div class="form-text">${step.text}</div>`;
        if (step.images && step.images.length > 0) {
            answersHTML += `<div class="example-images">`;
            step.images.forEach((imagePath, index) => {
                answersHTML += `<img src="${imagePath}" alt="Example ${index + 1}" class="example-image">`;
            });
            answersHTML += `</div>`;
        }
        if (step.options) {
            answersHTML += `<div class="form-answers">`;
            answersHTML += step.options.map((option, index) => `
                <div class="option">
                    <input type="radio" id="example-option-${index}" name="example-${currentStep}" value="${option}">
                    <label for="example-option-${index}">${option}</label>
                </div>
            `).join('');
            answersHTML += `</div>`;
        }
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'example-ai') {
        // AI tools page with textarea
        answersHTML = `<div class="form-text">${step.text}</div>`;
        answersHTML += `<div class="form-field-group">
            <textarea class="textarea-input long" name="example-ai-${currentStep}" placeholder="Örneklerinizi buraya yazın..."></textarea>
        </div>`;
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'example-content') {
        // Content writing page with multiple textareas
        answersHTML = `<div class="form-text">${step.text}</div>`;
        if (step.fields) {
            step.fields.forEach(field => {
                answersHTML += `<div class="form-field-group">
                    <label class="form-field-label">${field.label}</label>
                    <textarea class="textarea-input" name="${field.name}-${currentStep}" placeholder=""></textarea>
                </div>`;
            });
        }
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    }

    formContent.innerHTML = `
        <div class="form-step active">
            <h2 class="form-question">${step.question}</h2>
            <div class="form-answers">
                ${answersHTML}
            </div>
        </div>
    `;
}

function handleNext() {
    // Validate current step if needed
    const step = formSteps[currentStep];
    if (!step) return;

    // Basic validation
    if (step.type === 'radio' || step.type === 'example-design' || step.type === 'example-software') {
        const name = step.type === 'radio' ? `question-${currentStep}` : `example-${currentStep}`;
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (!selected) {
            alert('Lütfen bir seçenek seçin.');
            return;
        }
    } else if (step.type === 'text' || step.type === 'textarea') {
        const input = document.querySelector(`input[name="question-${currentStep}"], textarea[name="question-${currentStep}"]`);
        if (input && !input.value.trim()) {
            alert('Lütfen bu alanı doldurun.');
            return;
        }
    } else if (step.type === 'example-ai') {
        const textarea = document.querySelector(`textarea[name="example-ai-${currentStep}"]`);
        if (!textarea || !textarea.value.trim()) {
            alert('Lütfen bu alanı doldurun.');
            return;
        }
    } else if (step.type === 'example-content') {
        let allFilled = true;
        step.fields.forEach(field => {
            const textarea = document.querySelector(`textarea[name="${field.name}-${currentStep}"]`);
            if (!textarea || !textarea.value.trim()) {
                allFilled = false;
            }
        });
        if (!allFilled) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
    } else if (step.type === 'multiple-inputs') {
        let allFilled = true;
        step.fields.forEach(field => {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (!input || !input.value.trim()) {
                allFilled = false;
            }
        });
        if (!allFilled) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
    } else if (step.type === 'mixed') {
        if (step.checkboxes) {
            const checked = document.querySelectorAll(`input[name="checkboxes-${currentStep}"]:checked`);
            if (checked.length === 0) {
                alert('Lütfen en az bir seçenek seçin.');
                return;
            }
        }
        if (step.textareaLabel) {
            const textarea = document.querySelector(`textarea[name="textarea-${currentStep}"]`);
            if (!textarea || !textarea.value.trim()) {
                alert('Lütfen bu alanı doldurun.');
                return;
            }
        }
    }

    goToNextStep();
}

function showCompletionScreen() {
    formContent.innerHTML = `
        <div class="form-step active">
            <h2 class="form-question">Başvurun Alındı</h2>
            <div class="form-text">
                İlgilendiğin için teşekkürler. <br><br>
                Başvurularımız aktif olarak inceleniyor ve 24 saat içerisinde dönüş yapıyoruz. <br><br>
                Olumlu dönüş olduğu takdirde test çalışması ile sürece devam edeceğiz.
            </div>
        </div>
    `;
    backBtn.classList.add('hidden');
    progressFill.style.width = '100%';
    progressText.textContent = `${formSteps.length} / ${formSteps.length}`;
    
    // Submit form data
    // Uncomment the method you want to use:
    submitToGoogleSheets();
    // submitToFormspree();
    // submitToBackend();
    
    // For now, log to console (remove this in production)
    console.log('Form submitted:', formatFormDataForSubmission());
}

function updateProgress() {
    if (formSteps.length === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = '0 / 0';
        return;
    }

    const progress = ((currentStep + 1) / formSteps.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentStep + 1} / ${formSteps.length}`;
}

function initializeForm() {
    formSteps = [
        {
            question: "X Akademi ve Amacı",
            type: "info",
            text: `X Akademi bir YKS markasıdır. <br><br> X Akademi'de koçluk ve ders materyali gibi klasikleşmiş içeriklerden farklı olarak program, sistem ve net odaklı yaklaşımlar sergilemeye çalışıyoruz. <br><br> 2026 YKS için de dijital ürünler, yoğunlaştırılmış ders kampları ve web / mobil uygulamalar geliştirme hedeflerimiz var.`,
            buttonText: "Anladım"
        },
        {
            question: "Başlamadan Önce...",
            type: "info",
            text: `Bu bir atölye, staj, freelance veya kısa süreli / part-time kazanç süreci değil. <br><br> Erken aşamada olan bir girişimin parçası olacak kişiler arıyoruz. <br><br> Gerçek ürünler geliştirecek, gerçek sorumluluklar alacak ve girişimin ilgili alanında söz sahibi olmak isteyen kişiler. <br><br> Sabit maaşlı değil, ortaya koyduğunuz değere bağlı kazançlar elde edeceğiniz bir ortama giriyorsunuz.`,
            buttonText: "Anladım"
        },
        {
            question: "Kimlerle Çalışıyoruz?",
            type: "info",
            text: `<ul>
                <li>Kendi kendine çalışabilen,</li>
                <li>Netlik ve yönlendirme olmadan ilerleyebilen,</li>
                <li>Ürettiği işin arkasında duran,</li>
            </ul>
            kişilerle çalışıyoruz. <br><br>
            Eğer; <br><br>
            <ul>
                <li>Sadece görev verildiğinde çalışıyorsan,</li>
                <li>İşi geliştirmek için daima yönlendirme arıyorsan,</li>
                <li>Sorumluluğu üstüne almıyorsan,</li>
            </ul>
            burası sana uygun değil.`,
            buttonText: "Anladım"
        },
        {
            question: "Kişisel Bilgilerin",
            type: "multiple-inputs",
            fields: [
                {
                    label: "Ad - Soyad",
                    name: "fullname",
                    placeholder: "Adınız ve soyadınız"
                },
                {
                    label: "Telefon Numarası",
                    name: "phone",
                    placeholder: "Örn: 0532 123 45 67"
                },
                {
                    label: "Sınıfın",
                    name: "class",
                    placeholder: "Sınıfınız"
                },
                {
                    label: "Haftada kaç saat çalışabilirsin?",
                    name: "hours",
                    placeholder: "Örn: 10 saat"
                }
            ]
        },
        {
            question: "Kabiliyetlerin",
            type: "mixed",
            checkboxLabel: "En güçlü olduğun alan hangisi?",
            checkboxes: ["Tasarım", "Yazılım Geliştirme", "Yapay Zeka Araçları", "İçerik Yazma / Üretme"],
            textareaLabel: "Daha önce yaptığın bir işi paylaş:",
            textareaPlaceholder: "İşinizi açıklayın veya link ekleyin..."
        },
        {
            question: "Düşüncelerin",
            type: "textarea",
            label: "Sence girişimlerin veya ekiplerin başarısız olmasının sebebi nedir?",
            placeholder: "Düşüncelerinizi paylaşın...",
            long: true
        },
        {
            question: "Test Çalışması",
            type: "info",
            text: `Eğer başvurun kabul edilirse senden bir test çalışması (3 - 6 saat) isteyebiliriz. <br><br> Test çalışması için 48 saat testlim süremiz bulunuyor. <br><br> Müsait olduğunu onaylıyor musun?`,
            buttonText: "Onaylıyorum"
        }
    ];
}

// Make handleNext available globally
window.handleNext = handleNext;

// ============================================
// FORM SUBMISSION FUNCTIONS
// ============================================

/**
 * Formats the form data into a structured object for submission
 */
function formatFormDataForSubmission() {
    // Find the index of specific pages
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
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxMKiSY1YbdOR4COcPKCNZzK6V6en9O2KHsdlBqXc9J_saq2_SW_YnhYmjtCFETk4Q7/exec';
    
    // Check if URL is set (user has already set it)
    if (!WEB_APP_URL || WEB_APP_URL.includes('YOUR_WEB_APP_URL')) {
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
