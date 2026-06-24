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
    const welcomeText = document.querySelector('.welcome-text');
    const ctaButton = document.querySelector('.cta-button');

    if (welcomeTitle) {
        setTimeout(() => welcomeTitle.classList.add('animate'), 100);
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
    } else if (step.type === 'inputs-with-radio') {
        const data = { fields: {}, radio: '' };
        step.fields.forEach(field => {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (input) data.fields[field.name] = input.value;
        });
        const selected = document.querySelector(`input[name="radio-${currentStep}"]:checked`);
        if (selected) data.radio = selected.value;
        formData[`step-${currentStep}`] = data;
    } else if (step.type === 'motivation') {
        const data = { textareas: {}, checkboxes: [] };
        step.textareas.forEach(field => {
            const textarea = document.querySelector(`textarea[name="${field.name}"]`);
            if (textarea) data.textareas[field.name] = textarea.value;
        });
        const checked = Array.from(document.querySelectorAll(`input[name="checkboxes-${currentStep}"]:checked`))
            .map(el => el.value);
        data.checkboxes = checked;
        formData[`step-${currentStep}`] = data;
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
    } else if (step.type === 'inputs-with-radio') {
        answersHTML = step.fields.map(field => `
            <div class="form-field-group">
                <label class="form-field-label">${field.label}</label>
                <input type="text" class="text-input" name="${field.name}" placeholder="${field.placeholder || ''}">
            </div>
        `).join('');
        answersHTML += `
            <div class="form-field-group">
                <label class="form-field-label">${step.radio.label}</label>
                <div class="form-answers">
                    ${step.radio.options.map((option, index) => `
                        <div class="option">
                            <input type="radio" id="level-${index}" name="radio-${currentStep}" value="${option}">
                            <label for="level-${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;
    } else if (step.type === 'motivation') {
        answersHTML = step.textareas.map(field => `
            <div class="form-field-group">
                <label class="form-field-label">${field.label}</label>
                <textarea class="textarea-input" name="${field.name}" placeholder="${field.placeholder || ''}"></textarea>
            </div>
        `).join('');
        answersHTML += `
            <div class="form-field-group">
                <label class="form-field-label">${step.checkboxLabel}</label>
                <div class="form-answers">
                    ${step.checkboxes.map((option, index) => `
                        <div class="option">
                            <input type="checkbox" id="excitement-${index}" name="checkboxes-${currentStep}" value="${option}">
                            <label for="excitement-${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        answersHTML += `<button class="next-button" onclick="handleNext()">Devam Et</button>`;

        setTimeout(() => {
            const checkboxes = document.querySelectorAll(`input[name="checkboxes-${currentStep}"]`);
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const checked = document.querySelectorAll(`input[name="checkboxes-${currentStep}"]:checked`);
                    if (checked.length > step.maxCheckboxes) {
                        cb.checked = false;
                    }
                });
            });
        }, 0);
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
    } else if (step.type === 'inputs-with-radio') {
        for (const field of step.fields) {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (!input || !input.value.trim()) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }
        }
        const selected = document.querySelector(`input[name="radio-${currentStep}"]:checked`);
        if (!selected) {
            alert('Lütfen seviyenizi seçin.');
            return;
        }
    } else if (step.type === 'motivation') {
        for (const field of step.textareas) {
            const textarea = document.querySelector(`textarea[name="${field.name}"]`);
            if (!textarea || !textarea.value.trim()) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }
        }
        const checked = document.querySelectorAll(`input[name="checkboxes-${currentStep}"]:checked`);
        if (checked.length === 0) {
            alert('Lütfen en az bir seçenek seçin.');
            return;
        }
        if (checked.length > step.maxCheckboxes) {
            alert(`En fazla ${step.maxCheckboxes} seçenek seçebilirsiniz.`);
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
                Eğer başvurun kabul edilirse seni daha yakından tanımak için bir video görüşme ayarlayacağız. <br><br>
                İnşallah 24 saat içerisinde sana geri dönüş yapacağız. <br><br>
                Selametle kal.
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
            question: 'Başlamadan Önce…',
            type: 'info',
            text: `Bu bir koçluk değil – koçluktan daha fazlası. <br><br> Katılım ise ücretsiz. <br><br> Bu ekibe katılarak X Akademi'nin bir parçası olacak, ekiple birlikte çalışacak, hazırladığımız programlardan faydalanacak ve içeriklerde yer alacaksın.`,
            buttonText: 'Anladım'
        },
        {
            question: 'Süreç Nasıl İşleyecek?',
            type: 'info',
            text: `YKS2027 çalışmalarında koçluğa benzer şekilde sana yardımcı olacağız. Buna ek olarak süreç boyunca sana fayda sağlayacak kamplar ve etkinlikler düzenleyeceğiz. <br><br> Örneğin Temmuz ayında "10 Günlük Disiplin Kampı" isimli bir kamp yapacağız. <br><br> Bu kampta <ul>
                <li>10 gün boyunca görevlerimizi yerine getireceğiz</li>
                <li>Katılımcılar gelişimlerini paylaşacak</li>
                <li>Ve bütün süreci bir videoya dönüştüreceğiz</li>
            </ul> Buna benzer kampları ve projeleri yıl boyunca düzenleyeceğiz.`,
            buttonText: 'Anladım'
        },
        {
            question: 'Beklentiler ve Uygunluk',
            type: 'multiple-radio',
            intro: 'Bu süreç boyunca senden çalışmalarımıza aktif katılım göstermeni bekliyoruz.',
            questions: [
                {
                    label: 'Vereceğimiz görevleri ve veri girişlerini düzenli yerine getirebilir misin?',
                    name: 'tasks',
                    options: ['Evet', 'Hayır']
                },
                {
                    label: 'Online toplantılara ve etkinliklerimize düzenli katılabilir misin?',
                    name: 'meetings',
                    options: ['Evet', 'Hayır']
                }
            ]
        },
        {
            question: 'Kişisel Bilgiler',
            type: 'multiple-inputs',
            fields: [
                {
                    label: 'İsim - Soyisim',
                    name: 'fullname',
                    placeholder: 'Adınız ve soyadınız'
                },
                {
                    label: 'Sınıfın',
                    name: 'class',
                    placeholder: 'Sınıfınız'
                },
                {
                    label: 'Telefon',
                    name: 'phone',
                    placeholder: 'Örn: 0532 123 45 67'
                }
            ]
        },
        {
            question: 'YKS Bilgileri',
            type: 'inputs-with-radio',
            fields: [
                {
                    label: 'Hedefin nedir?',
                    name: 'goal',
                    placeholder: 'Hedefinizi yazın'
                },
                {
                    label: 'Ortalama TYT netin',
                    name: 'tytNet',
                    placeholder: 'Örn: 80 net'
                },
                {
                    label: 'Ortalama AYT netin',
                    name: 'aytNet',
                    placeholder: 'Örn: 60 net'
                },
                {
                    label: 'Günde kaç saat çalışırsın?',
                    name: 'dailyHours',
                    placeholder: 'Örn: 4-5 saat'
                }
            ],
            radio: {
                label: 'Mevcut seviyeni nasıl değerlendiriyorsun?',
                options: ['Sıfır', 'Temel', 'Orta', 'İleri']
            }
        },
        {
            question: 'Motivasyon',
            type: 'motivation',
            textareas: [
                {
                    label: 'Bu ekibe katılmak isteme sebeplerin neler?',
                    name: 'reasons',
                    placeholder: 'Sebeplerinizi yazın...'
                },
                {
                    label: 'Bu süreçten ne bekliyorsun?',
                    name: 'expectations',
                    placeholder: 'Beklentilerinizi yazın...'
                }
            ],
            checkboxLabel: 'Seni en çok heyecanlandıran hangisi? (en fazla 2 seçebilirsin)',
            checkboxes: [
                'Mustafa Ocak ile birlikte çalışmak',
                'Bir ekiple birlikte çalışmak',
                'Koçluk desteği',
                'Materyal desteği',
                'İçeriklerde yer almak'
            ],
            maxCheckboxes: 2
        },
        {
            question: 'Süreç Onayı',
            type: 'radio',
            text: 'Bu ekibe dahil olursan Mustafa Ocak ile birlikte içeriklerde yer alacaksın.',
            label: 'Böyle bir çalışmanın parçası olmaya sıcak bakıyor musun?',
            options: ['Evet', 'Kararsızım', 'Hayır'],
            submit: true
        }
    ];
}

window.handleNext = handleNext;

// ============================================
// FORM SUBMISSION FUNCTIONS
// ============================================

function formatFormDataForSubmission() {
    const expectations = formData['step-2'] || {};
    const personalInfo = formData['step-3'] || {};
    const yksInfo = formData['step-4'] || {};
    const motivation = formData['step-5'] || {};
    const processApproval = formData['step-6'] || '';

    return {
        timestamp: new Date().toISOString(),
        expectations: {
            tasks: expectations.tasks || '',
            meetings: expectations.meetings || ''
        },
        personalInfo: {
            fullname: personalInfo.fullname || '',
            class: personalInfo.class || '',
            phone: personalInfo.phone || ''
        },
        yksInfo: {
            goal: yksInfo.fields?.goal || '',
            tytNet: yksInfo.fields?.tytNet || '',
            aytNet: yksInfo.fields?.aytNet || '',
            dailyHours: yksInfo.fields?.dailyHours || '',
            level: yksInfo.radio || ''
        },
        motivation: {
            reasons: motivation.textareas?.reasons || '',
            expectations: motivation.textareas?.expectations || '',
            excitement: Array.isArray(motivation.checkboxes) ? motivation.checkboxes : []
        },
        processApproval
    };
}

async function submitToGoogleSheets() {
    const data = formatFormDataForSubmission();

    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxEJpfrNC9h-3WHHD5V0ymLc4c9uivLqSLDPBQR29Yl4w9JuOjnn58GkQMC_ScFeIfX/exec';

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
