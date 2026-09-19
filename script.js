// Application state
let currentStep = 0;
let formData = {};
let formSteps = [];

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
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    const welcomeText = document.querySelector('.welcome-text');
    const ctaButton = document.querySelector('.cta-button');

    if (welcomeTitle) {
        setTimeout(() => welcomeTitle.classList.add('animate'), 100);
    }

    if (welcomeSubtitle) {
        setTimeout(() => welcomeSubtitle.classList.add('animate'), 250);
    }

    if (welcomeText) {
        setTimeout(() => welcomeText.classList.add('animate'), 400);
    }

    if (ctaButton) {
        setTimeout(() => ctaButton.classList.add('animate'), 800);
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
    } else {
        formScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    }
}

function goToNextStep() {
    saveCurrentStepData();

    if (currentStep < formSteps.length - 1) {
        currentStep++;
        renderCurrentStep();
        updateProgress();
    } else {
        showCompletionScreen();
    }
}

function saveCurrentStepData() {
    const step = formSteps[currentStep];
    if (!step) return;

    if (step.type === 'info') {
        formData[`step-${currentStep}`] = 'confirmed';
    } else if (step.type === 'multiple-radio') {
        const data = {};
        step.questions.forEach(q => {
            const selected = document.querySelector(`input[name="${q.name}-${currentStep}"]:checked`);
            if (selected) data[q.name] = selected.value;
        });
        formData[`step-${currentStep}`] = data;
    } else if (step.type === 'multiple-inputs') {
        const inputs = {};
        step.fields.forEach(field => {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (input) inputs[field.name] = input.value;
        });
        formData[`step-${currentStep}`] = inputs;
    } else if (step.type === 'textarea') {
        const textarea = document.querySelector(`textarea[name="question-${currentStep}"]`);
        if (textarea) formData[`step-${currentStep}`] = textarea.value;
    } else if (step.type === 'radio') {
        const selected = document.querySelector(`input[name="radio-${currentStep}"]:checked`);
        if (selected) formData[`step-${currentStep}`] = selected.value;
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

    if (currentStep === 0) {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }

    let answersHTML = '';

    if (step.type === 'info') {
        answersHTML = `
            <div class="form-text">${step.text}</div>
            <button class="form-info-button" onclick="handleNext()">${step.buttonText}</button>
        `;
    } else if (step.type === 'multiple-radio') {
        if (step.intro) {
            answersHTML += `<div class="form-text">${step.intro}</div>`;
        }
        answersHTML += step.questions.map((q, qIndex) => `
            <div class="form-field-group">
                <label class="form-field-label">${q.label}</label>
                <div class="form-answers">
                    ${q.options.map((option, index) => `
                        <div class="option">
                            <input type="radio" id="radio-${qIndex}-${index}" name="${q.name}-${currentStep}" value="${option}">
                            <label for="radio-${qIndex}-${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'multiple-inputs') {
        answersHTML = step.fields.map(field => `
            <div class="form-field-group">
                <label class="form-field-label">${field.label}</label>
                <input type="text" class="text-input" name="${field.name}" placeholder="${field.placeholder || ''}">
            </div>
        `).join('');
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'textarea') {
        const className = step.long ? 'textarea-input long' : 'textarea-input';
        answersHTML = `
            <div class="form-field-group">
                <label class="form-field-label">${step.label}</label>
                <textarea class="${className}" name="question-${currentStep}" placeholder="${step.placeholder || ''}"></textarea>
            </div>
        `;
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'radio') {
        if (step.text) {
            answersHTML += `<div class="form-text">${step.text}</div>`;
        }
        answersHTML += `
            <div class="form-field-group">
                <label class="form-field-label">${step.label}</label>
                <div class="form-answers">
                    ${step.options.map((option, index) => `
                        <div class="option">
                            <input type="radio" id="radio-${index}" name="radio-${currentStep}" value="${option}">
                            <label for="radio-${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        answersHTML += `<button class="next-button" onclick="handleNext()">${step.submit ? 'Gönder' : 'Devam Et'}</button>`;
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
    const step = formSteps[currentStep];
    if (!step) return;

    if (step.type === 'multiple-radio') {
        for (const q of step.questions) {
            const selected = document.querySelector(`input[name="${q.name}-${currentStep}"]:checked`);
            if (!selected) {
                alert('Lütfen tüm soruları cevaplayın.');
                return;
            }
        }
    } else if (step.type === 'multiple-inputs') {
        for (const field of step.fields) {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (!input || !input.value.trim()) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }
        }
    } else if (step.type === 'textarea') {
        const textarea = document.querySelector(`textarea[name="question-${currentStep}"]`);
        if (!textarea || !textarea.value.trim()) {
            alert('Lütfen bu alanı doldurun.');
            return;
        }
    } else if (step.type === 'radio') {
        const selected = document.querySelector(`input[name="radio-${currentStep}"]:checked`);
        if (!selected) {
            alert('Lütfen bir seçenek seçin.');
            return;
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
                İnşallah en geç 24 saat içerisinde sana dönüş yapacağız.
            </div>
        </div>
    `;
    backBtn.classList.add('hidden');
    progressFill.style.width = '100%';
    progressText.textContent = `${formSteps.length} / ${formSteps.length}`;

    submitToGoogleSheets();
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
            question: 'Aradığımız Özellikler',
            type: 'info',
            text: `<ul>
                <li>YKS sıralaması SAY 30.000 ve üzeri VEYA EA ilk 1000,</li>
                <li>Bilgisayar kullanımına hakim,</li>
                <li>Claude, Cursor ve benzeri AI araçlarını kullanabilen,</li>
                <li>Sorumluluk alabilen ve detayları takip edebilen,</li>
                <li>Öğrencilerle iletişimi güçlü,</li>
                <li>YKS öğrencilerinin çalışma sürecini iyi anlayan</li>
            </ul>`,
            buttonText: 'Anladım'
        },
        {
            question: 'Çalışma Modeli',
            type: 'info',
            text: `Çalışma Şartları: <ul>
                <li>Uzaktan</li>
                <li>Ortalama günde 4–5 saat</li>
                <li>Gün içine dağılabilen esnek çalışma</li>
                <li>Haftanın her günü operasyon olduğu için hafta sonu uygunluğu gerekli</li>
                <li>X Akademi'nin mevcut yazılım paneli ve AI araçları üzerinden çalışma</li>
            </ul> Ücret: 40.000₺ / ay`,
            buttonText: 'Anladım'
        },
        {
            question: 'Temel Bilgiler',
            type: 'multiple-inputs',
            fields: [
                {
                    label: 'Ad - Soyad',
                    name: 'fullname',
                    placeholder: 'Adınız ve soyadınız'
                },
                {
                    label: 'Telefon',
                    name: 'phone',
                    placeholder: 'Örn: 0532 123 45 67'
                },
                {
                    label: 'YKS Derece(leri)niz (SAY 249 veya EA 605 şeklinde yazınız)',
                    name: 'yksRank',
                    placeholder: 'Örn: SAY 249 veya EA 605'
                },
                {
                    label: 'Üniversite',
                    name: 'university',
                    placeholder: 'Üniversiteniz'
                },
                {
                    label: 'Bölüm',
                    name: 'department',
                    placeholder: 'Bölümünüz'
                },
                {
                    label: 'Sınıf',
                    name: 'class',
                    placeholder: 'Sınıfınız'
                }
            ]
        },
        {
            question: 'Müsaitlik',
            type: 'multiple-radio',
            questions: [
                {
                    label: 'Güne yayılmış şekilde (sabah 1 - 2 saat, gün içinde 1 - 2 saat ve akşam 1 - 2 saat) toplam 4 - 5 saat çalışmaya uygun musunuz?',
                    name: 'dailyAvailability',
                    options: ['Evet', 'Hayır']
                },
                {
                    label: 'Hafta sonları (yine aynı düzende, belki daha hafif) çalışmak için uygun musunuz?',
                    name: 'weekendAvailability',
                    options: ['Evet', 'Hayır']
                }
            ]
        },
        {
            question: 'Yapay Zeka Kullanımı',
            type: 'textarea',
            label: 'Daha önce hangi yapay zeka araçlarını kullandınız? Ne için ve nasıl?',
            placeholder: 'Cevabınızı buraya yazın...',
            long: true
        },
        {
            question: 'Tercih',
            type: 'textarea',
            label: 'Bu işi neden istiyorsun?',
            placeholder: 'Cevabınızı buraya yazın...'
        },
        {
            question: 'Uygunluk',
            type: 'radio',
            label: 'İlk görüşmemizi yapmak, ödemeli test sürecini tamamlamak ve işe başlamak için ne zaman uygunsunuz?',
            options: ['Bugün / yarın', '5 - 7 gün içinde', 'Daha Sonra'],
            submit: true
        }
    ];
}

window.handleNext = handleNext;

// ============================================
// FORM SUBMISSION FUNCTIONS
// ============================================

function formatFormDataForSubmission() {
    const basicInfo = formData['step-2'] || {};
    const availability = formData['step-3'] || {};
    const aiUsage = formData['step-4'] || '';
    const preference = formData['step-5'] || '';
    const suitability = formData['step-6'] || '';

    return {
        timestamp: new Date().toISOString(),
        basicInfo: {
            fullname: basicInfo.fullname || '',
            phone: basicInfo.phone || '',
            yksRank: basicInfo.yksRank || '',
            university: basicInfo.university || '',
            department: basicInfo.department || '',
            class: basicInfo.class || ''
        },
        availability: {
            daily: availability.dailyAvailability || '',
            weekend: availability.weekendAvailability || ''
        },
        aiUsage,
        preference,
        suitability
    };
}

async function submitToGoogleSheets() {
    const data = formatFormDataForSubmission();

    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwJvdIKfcGUlvLVsQqKSzWfeQz0a16ycQhj4CK9YAjhNg504-t_B2o1llX7G_Eprc5g/exec';

    if (!WEB_APP_URL || WEB_APP_URL.includes('YOUR_WEB_APP_URL')) {
        console.warn('Please set your Google Apps Script URL in submitToGoogleSheets()');
        console.log('Form data (for testing):', data);
        return false;
    }

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Form data submitted to Google Sheets');
        return true;
    } catch (error) {
        console.error('Error submitting form to Google Sheets:', error);
        console.log('Form data (for manual entry):', data);
        return false;
    }
}
