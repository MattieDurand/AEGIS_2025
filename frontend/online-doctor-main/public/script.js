// Global variables
let selectedBodyArea = '';
let selectedSymptoms = [];
let symptomsData = {};
let apiKey = '';
let conversationHistory = [];
let currentPhoto = null;
let symptomPhotos = [];

// Symptom data for different body areas
const bodyAreaSymptoms = {
    head: ['Headache', 'Dizziness', 'Nausea', 'Eye pain', 'Ear pain', 'Sinus pressure', 'Migraine', 'Jaw pain', 'Tooth pain', 'Neck stiffness'],
    neck: ['Neck pain', 'Stiffness', 'Muscle spasm', 'Swollen glands', 'Difficulty swallowing', 'Throat pain'],
    chest: ['Chest pain', 'Shortness of breath', 'Cough', 'Heart palpitations', 'Wheezing', 'Tight chest', 'Burning sensation'],
    'left-arm': ['Arm pain', 'Numbness', 'Tingling', 'Weakness', 'Swelling', 'Limited mobility', 'Joint pain'],
    'right-arm': ['Arm pain', 'Numbness', 'Tingling', 'Weakness', 'Swelling', 'Limited mobility', 'Joint pain'],
    abdomen: ['Stomach pain', 'Nausea', 'Vomiting', 'Bloating', 'Cramps', 'Diarrhea', 'Constipation', 'Loss of appetite'],
    'left-leg': ['Leg pain', 'Numbness', 'Tingling', 'Swelling', 'Cramps', 'Weakness', 'Joint pain', 'Difficulty walking'],
    'right-leg': ['Leg pain', 'Numbness', 'Tingling', 'Swelling', 'Cramps', 'Weakness', 'Joint pain', 'Difficulty walking']
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check for saved API key
    apiKey = localStorage.getItem('groqApiKey') || '';
    console.log('Initialized with API key:', apiKey ? 'Present' : 'Not found');
    
    // Set up event listeners
    setupBodyAreaListeners();
    setupSeverityScale();
    
    // Initialize API status display
    updateApiStatusDisplay();
    
    // Show welcome section by default
    showSection('welcome');
    
    // Prompt for API key if not present
    if (!apiKey) {
        setTimeout(() => {
            promptForApiKey();
        }, 1000); // Short delay to let the page load
    }
}

function promptForApiKey() {
    // Expand the API status box
    const content = document.getElementById('api-status-content');
    const toggleIcon = document.getElementById('api-status-toggle-icon');
    
    content.classList.remove('collapsed');
    toggleIcon.className = 'fas fa-chevron-up';
    
    // Focus on the API key input
    const keyInput = document.getElementById('api-key-input-persistent');
    keyInput.focus();
    
    // Show welcome message
    //showTip('Welcome! Please enter your Groq API key to get started.');
    
    // Add pulsing effect to the API status box
    const apiBox = document.getElementById('api-status-box');
    apiBox.style.animation = 'boxPulse 2s infinite';
    
    // Remove animation after user interacts
    keyInput.addEventListener('focus', () => {
        apiBox.style.animation = '';
    }, { once: true });
}

// Navigation functions
function startDiagnosis() {
    if (!apiKey) {
        showTip('Please configure your API key first using the panel in the bottom left corner');
        promptForApiKey();
        return;
    }
    showSection('body-selection');
}

function showSymptoms() {
    if (!selectedBodyArea) {
        alert('Please select a body area first.');
        return;
    }
    populateSymptoms();
    showSection('symptoms-section');
}

function startAIConsultation() {
    try {
        let comorbiditiesData = [];
        // Get all elements with the class 'comorbidity-item'
        const comorbidityElements = document.querySelectorAll('.comorbidity-item');

        comorbidityElements.forEach(item => {
            // For each comorbidity item, get the values of the inputs within it
            const name = item.querySelector('[id^="comorbidity-name-"]').value;
            const years = item.querySelector('[id^="comorbidity-years-"]').value;
            const prognosis = item.querySelector('[id^="comorbidity-prognosis-"]').value;

            // Create an object for each comorbidity and push it to the array
            comorbiditiesData.push({
                name: name,
                diagnosed_years_ago: years,
                prognosis: prognosis
            });
        });
            // Collect all symptom data
        symptomsData = {
            bodyArea: selectedBodyArea,
            selectedSymptoms: selectedSymptoms,
            patientInformation: {
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                intersexCondition: document.getElementById('intersex-condition').value,
                ethnicity: document.getElementById('ethnicity').value
            },
            metrics: {
                weight: document.getElementById('weight-kg').value,
                height: document.getElementById('height-cm').value,
                bmiCategory: document.getElementById('bmi-category').value
            },
            primaryDisease: {
                name: document.getElementById('disease-name').value,
                diagnosed_years_ago: document.getElementById('diagnosed-years-ago').value,
                prognosis: document.getElementById('disease-prognosis').value
            },
            comorbidities: comorbiditiesData,
            severity: document.getElementById('severity-scale').value,
            photos: symptomPhotos
        };
        
        showSection('chat-section');
        initializeChat();
    } catch (error) {
        console.error('Error starting AI consultation:', error);
    }
}

function restartDiagnosis() {
    // Reset all data
    selectedBodyArea = '';
    selectedSymptoms = [];
    symptomsData = {};
    conversationHistory = [];
    currentPhoto = null;
    symptomPhotos = [];
    
    // Reset UI
    document.getElementById('selected-area-name').textContent = 'None';
    document.getElementById('continue-to-symptoms').disabled = true;
    document.getElementById('age').value = '';
    document.getElementById('gender').value = 'Female'; // Reset to default selected option
    document.getElementById('intersex-condition').value = '';
    document.getElementById('weight-kg').value = '';
    document.getElementById('height-cm').value = '';
    document.getElementById('bmi-category').value = 'Healthy'; // Reset to default selected option
    document.getElementById('ethnicity').value = '';
    document.getElementById('disease-name').value = '';
    document.getElementById('diagnosed-years-ago').value = '';
    document.getElementById('disease-prognosis').value = 'Stable'; // Reset to default selected option
    document.getElementById('comorbidities-list').innerHTML = ''; // Clear all comorbidity items
    document.getElementById('severity-scale').value = 5;
    document.getElementById('severity-value').textContent = '5';
    document.getElementById('chat-messages').innerHTML = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('symptom-photos-grid').innerHTML = '';
    
    // Clear body area selection
    document.querySelectorAll('.body-part').forEach(part => {
        part.classList.remove('selected');
    });
    
    showSection('welcome');
}

function showSection(sectionId) {
    // Hide all sections
    const sections = ['welcome', 'body-selection', 'symptoms-section', 'chat-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Body area selection
function setupBodyAreaListeners() {
    document.querySelectorAll('.body-part').forEach(part => {
        part.addEventListener('click', function() {
            selectBodyArea(this.dataset.area, this);
        });
    });
}

function selectBodyArea(area, element) {
    // Remove previous selection
    document.querySelectorAll('.body-part').forEach(part => {
        part.classList.remove('selected');
    });
    
    // Add selection to clicked area
    element.classList.add('selected');
    selectedBodyArea = area;
    
    // Update UI
    const areaName = area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById('selected-area-name').textContent = areaName;
    document.getElementById('continue-to-symptoms').disabled = false;
}

// Symptom management
function populateSymptoms() {
    const symptomsContainer = document.getElementById('symptom-tags');
    symptomsContainer.innerHTML = '';
    
    const symptoms = bodyAreaSymptoms[selectedBodyArea] || [];
    
    symptoms.forEach(symptom => {
        const tag = document.createElement('div');
        tag.className = 'symptom-tag';
        tag.textContent = symptom;
        tag.addEventListener('click', function() {
            toggleSymptom(symptom, this);
        });
        symptomsContainer.appendChild(tag);
    });
}

function toggleSymptom(symptom, element) {
    if (selectedSymptoms.includes(symptom)) {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        element.classList.remove('selected');
    } else {
        selectedSymptoms.push(symptom);
        element.classList.add('selected');
    }
}

function setupSeverityScale() {
    const scale = document.getElementById('severity-scale');
    const valueDisplay = document.getElementById('severity-value');
    
    scale.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
    });
}

// Chat functionality
function initializeChat() {
    showTip('Initializing chat with AI medical assistant...');
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // Add initial AI message
    const initialMessage = generateInitialDiagnosisPrompt();
    addMessage('ai', 'Hello! I\'m your AI medical assistant. I\'ve reviewed your symptoms and I\'m here to help provide guidance. Let me analyze your condition...');
    
    // Send initial diagnosis request
    setTimeout(() => {
        sendInitialDiagnosis();
    }, 1000);
}

async function getAIDIagnosis() {
    // Assuming symptomsData is already populated
    const inputText = `
    Patient is ${symptomsData.patientInformation.age} years old. 
    gender: ${symptomsData.patientInformation.gender}. 
    intersex condition: ${symptomsData.patientInformation.intersexCondition || "None"}. 
    weight: ${symptomsData.metrics.weight} kg. 
    height: ${symptomsData.metrics.height} cm. 
    BMI category: ${symptomsData.metrics.bmiCategory}. 
    ethnicity: ${symptomsData.patientInformation.ethnicity}. 
    primary disease: ${symptomsData.primaryDisease.name}. 
    diagnosed ${symptomsData.primaryDisease.diagnosed_years_ago} years ago. 
    prognosis: ${symptomsData.primaryDisease.prognosis}. 
    Comorbidities: ${symptomsData.comorbidities.length > 0 ? symptomsData.comorbidities.map(c => c.name).join(", ") : "None"}.
    Generate a treatment plan in JSON format. Use the exact format: 
    Treatment: <treatment_name>, Dosage: <float> mg/day, Percent week administered: <float>%, Indication: <[Primary, Comorbidity, Other]>.
    `.trim();
    try {
        const url = "https://073300478fa6.ngrok-free.app/generate-treatment";


        // Send POST request
        fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ patient: inputText })
        })
        .then(response => response.json())
        .then(data => {
            // Get treatment_plan
            let treatmentPlan = data.treatment_plan;

            // If "Output:" exists, extract everything after it
            if (treatmentPlan.includes("Output:")) {
            treatmentPlan = treatmentPlan.split("Output:")[1].trim();
            }

            return treatmentPlan;
        })
        .catch(err => console.error("Error:", err));

    } catch (error) {
        console.error('Error fetching treatment plan:', error);
        addMessage('ai', 'Sorry, there was an error generating your treatment plan.');
    }
}

function generateInitialDiagnosisPrompt() {
    const areaName = selectedBodyArea.replace('-', ' ');
    const symptomsText = selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'No specific symptoms selected';
    const description = symptomsData.description || 'No additional description provided';
    const severity = symptomsData.severity;
    const hasPhotos = symptomsData.photos && symptomsData.photos.length > 0;

    const patientInfo = `
    Patient Information:
    - Age: ${symptomsData.patientInformation.age}
    - Gender: ${symptomsData.patientInformation.gender}
    - Intersex Condition: ${symptomsData.patientInformation.intersexCondition || 'None'}
    - Ethnicity: ${symptomsData.patientInformation.ethnicity || 'Not specified'}
    - Weight: ${symptomsData.metrics.weight} kg
    - Height: ${symptomsData.metrics.height} cm
    - BMI Category: ${symptomsData.metrics.bmiCategory}
    `;

    // Accessing primary disease data
const primaryDiseaseInfo = `
Primary Disease:
- Name: ${symptomsData.primaryDisease.name || 'None'}
- Diagnosed: ${symptomsData.primaryDisease.diagnosed_years_ago || 'N/A'} years ago
- Prognosis: ${symptomsData.primaryDisease.prognosis}
`;

// Handling comorbidities by iterating over the array
let comorbiditiesInfo = '';
if (symptomsData.comorbidities.length > 0) {
    comorbiditiesInfo = '\nComorbidities:';
    symptomsData.comorbidities.forEach(comorbidity => {
        comorbiditiesInfo += `\n- Name: ${comorbidity.name || 'N/A'}, Diagnosed: ${comorbidity.diagnosed_years_ago || 'N/A'} years ago, Prognosis: ${comorbidity.prognosis || 'N/A'}`;
    });
}
    let aiDiagnosis = "Diagnosis unavailable";

    (async () => {
        try {
            aiDiagnosis = await getAIDIagnosis();
            console.log("AI Diagnosis:", aiDiagnosis);
        } catch (err) {
            console.error("Error getting AI diagnosis:", err);
            aiDiagnosis = "Unavailable";
        }
    })();

    
    let prompt = `I am an AI medical assistant. A patient is experiencing symptoms in their ${areaName}. 

${patientInfo}
${primaryDiseaseInfo}
${comorbiditiesInfo}
Symptoms: ${symptomsText}
Additional description: ${description}
Pain/discomfort level: ${severity}/10
${hasPhotos ? `Photos provided: ${symptomsData.photos.length} image(s) for visual analysis` : 'No photos provided'}

Please provide:
1. Possible conditions or causes
2. Immediate care recommendations
3. When to seek emergency care
4. Follow-up questions to better understand the condition

Remember to:
- Be empathetic and professional
- Emphasize that this is not a substitute for professional medical care
- Suggest consulting a healthcare provider for proper diagnosis
- Ask relevant follow-up questions
- Provide practical advice for symptom management
- Ensure all medical advice is safe and appropriate
${hasPhotos ? '- Analyze any provided photos for visual symptoms or conditions' : ''}

Please keep the response concise but comprehensive and ensure it passes content safety checks.`;
    
    return prompt;
}

async function sendInitialDiagnosis() {
    const prompt = generateInitialDiagnosisPrompt();
    
    // If there are symptom photos, send them with the initial diagnosis
    if (symptomsData.photos && symptomsData.photos.length > 0) {
        // Create a multimodal message with photos
        const multimodalMessage = {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: prompt
                },
                ...symptomsData.photos.map(photo => ({
                    type: 'image_url',
                    image_url: {
                        url: photo
                    }
                }))
            ]
        };
        
        // Send multimodal message
        await sendMultimodalToGroq(multimodalMessage);
    } else {
        // Send text-only message
        await sendToGroq(prompt);
    }
}

function addMessage(sender, content, imageUrl = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
              // Add text content (support HTML)
          const textContent = document.createElement('div');
          textContent.innerHTML = content;
          messageContent.appendChild(textContent);
    
    // Add image if provided
    if (imageUrl) {
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.alt = 'Uploaded image';
        imageElement.style.cssText = `
            max-width: 200px;
            max-height: 200px;
            border-radius: 8px;
            margin-top: 0.5rem;
            border: 1px solid var(--border-color);
        `;
        messageContent.appendChild(imageElement);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to conversation history
    conversationHistory.push({ 
        role: sender === 'ai' ? 'assistant' : 'user', 
        content: content,
        imageUrl: imageUrl 
    });
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const messageInput = document.getElementById('user-message');
    const message = messageInput.value.trim();
    
    if (!message && !currentPhoto) return;
    
    // Add user message with photo if available
    addMessage('user', message || 'Photo uploaded', currentPhoto);
    messageInput.value = '';
    
    // Send to AI
    sendToGroq(message || 'Please analyze this image and provide medical guidance.');
    
    // Clear photo after sending
    removePhoto();
}

async function sendToGroq(message) {
    if (!apiKey) {
        addMessage('ai', 'Please configure your API key in the bottom left corner to continue the conversation.');
        return;
    }
    
    // Show loading
    const sendBtn = document.getElementById('send-btn');
    const originalContent = sendBtn.innerHTML;
    sendBtn.innerHTML = '<div class="loading"></div>';
    sendBtn.disabled = true;
    
    try {
        console.log('🚀 Sending request with model: meta-llama/llama-4-scout-17b-16e-instruct');
        // Prepare conversation history for context
        const messages = [
            {
                role: 'system',
                content: 'You are a professional medical AI assistant using Llama 3.3 70B for enhanced medical guidance. Provide helpful, accurate medical guidance while emphasizing the importance of consulting with healthcare professionals. Be empathetic, clear, and ask relevant follow-up questions to better understand symptoms. Always remind users that your advice is not a substitute for professional medical care. Ensure all responses are medically appropriate and safe. If an image is provided, analyze it carefully and provide relevant medical observations while maintaining appropriate medical boundaries. Format your responses with clear sections using **bold headers** for main topics like "Possible conditions or causes:", "Immediate care recommendations:", "When to seek emergency care:", and "Follow-up questions:". Use bullet points (-) for lists and emphasize important information with **bold text**.'
            }
        ];
        
        // Add conversation history (excluding images for now as they need special handling)
        const textHistory = conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        messages.push(...textHistory);
        
        // Add current message
        const currentMessage = {
            role: 'user',
            content: message
        };
        
        // Add image if available
        if (currentPhoto) {
            currentMessage.content = [
                {
                    type: 'text',
                    text: message
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: currentPhoto
                    }
                }
            ];
        }
        
        messages.push(currentMessage);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Format the AI response with proper HTML
        const formattedResponse = formatAIResponse(aiResponse);
        
        // Add AI response
        addMessage('ai', formattedResponse);
        
    } catch (error) {
        console.error('Error calling Groq API:', error);
        let errorMessage = 'Sorry, I encountered an error while processing your request. ';
        
        if (error.message.includes('401')) {
            errorMessage += 'Please check your API key.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please try again in a moment.';
        } else {
            errorMessage += 'Please try again later.';
        }
        
        addMessage('ai', errorMessage);
    } finally {
        // Reset send button
        sendBtn.innerHTML = originalContent;
        sendBtn.disabled = false;
    }
}

async function sendMultimodalToGroq(multimodalMessage) {
    if (!apiKey) {
        addMessage('ai', 'Please configure your API key in the bottom left corner to continue the conversation.');
        return;
    }
    
    // Show loading
    const sendBtn = document.getElementById('send-btn');
    const originalContent = sendBtn.innerHTML;
    sendBtn.innerHTML = '<div class="loading"></div>';
    sendBtn.disabled = true;
    
    try {
        console.log('🚀 Sending initial diagnosis request with model: meta-llama/llama-4-scout-17b-16e-instruct');
        
        // Use multimodal message directly since this model should support images
        const messages = [
            {
                role: 'system',
                content: 'You are a professional medical AI assistant using Llama 4 Scout for enhanced medical guidance. Provide helpful, accurate medical guidance while emphasizing the importance of consulting with healthcare professionals. Be empathetic, clear, and ask relevant follow-up questions to better understand symptoms. Always remind users that your advice is not a substitute for professional medical care. Ensure all responses are medically appropriate and safe. If images are provided, analyze them carefully and provide relevant medical observations while maintaining appropriate medical boundaries. Format your responses with clear sections using **bold headers** for main topics like "Possible conditions or causes:", "Immediate care recommendations:", "When to seek emergency care:", and "Follow-up questions:". Use bullet points (-) for lists and emphasize important information with **bold text**.'
            },
            multimodalMessage
        ];
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Format the AI response with proper HTML
        const formattedResponse = formatAIResponse(aiResponse);
        
        // Add AI response
        addMessage('ai', formattedResponse);
        
    } catch (error) {
        console.error('Error calling Groq API:', error);
        let errorMessage = 'Sorry, I encountered an error while processing your request. ';
        
        if (error.message.includes('401')) {
            errorMessage += 'Please check your API key.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please try again in a moment.';
        } else {
            errorMessage += 'Please try again later.';
        }
        
        addMessage('ai', errorMessage);
    } finally {
        // Reset send button
        sendBtn.innerHTML = originalContent;
        sendBtn.disabled = false;
    }
}

// Format AI responses with proper HTML structure
function formatAIResponse(text) {
    if (!text) return '';
    
    // Convert markdown-style formatting to HTML
    let formatted = text
        // Bold text: **text** -> <strong>text</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text: *text* -> <em>text</em>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers: # Header -> <h4>Header</h4>
        .replace(/^# (.*$)/gm, '<h4 class="response-header">$1</h4>')
        .replace(/^## (.*$)/gm, '<h5 class="response-subheader">$1</h5>')
        // Lists: - item -> <li>item</li>
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Numbered lists: 1. item -> <li>item</li>
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already wrapped
    if (!formatted.startsWith('<h') && !formatted.startsWith('<p>')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    // Convert list items to proper lists
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul class="response-list">$1</ul>');
    
    // Clean up any double line breaks
    formatted = formatted.replace(/<\/p><p><\/p><p>/g, '</p><p>');
    
    return formatted;
}

// Photo upload handling
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentPhoto = e.target.result;
        
        // Show preview
        const preview = document.getElementById('photo-preview');
        const previewImage = document.getElementById('preview-image');
        previewImage.src = currentPhoto;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    currentPhoto = null;
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('photo-upload').value = '';
}

// Symptom photo handling
function handleSymptomPhotoUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select only image files.');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoData = e.target.result;
            symptomPhotos.push(photoData);
            displaySymptomPhoto(photoData, symptomPhotos.length - 1);
        };
        reader.readAsDataURL(file);
    });
}

function displaySymptomPhoto(photoData, index) {
    const grid = document.getElementById('symptom-photos-grid');
    
    const photoItem = document.createElement('div');
    photoItem.className = 'symptom-photo-item';
    photoItem.innerHTML = `
        <img src="${photoData}" alt="Symptom photo">
        <button class="symptom-photo-remove" onclick="removeSymptomPhoto(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    grid.appendChild(photoItem);
}

function removeSymptomPhoto(index) {
    symptomPhotos.splice(index, 1);
    updateSymptomPhotosDisplay();
}

function updateSymptomPhotosDisplay() {
    const grid = document.getElementById('symptom-photos-grid');
    grid.innerHTML = '';
    
    symptomPhotos.forEach((photoData, index) => {
        displaySymptomPhoto(photoData, index);
    });
}

// API Key management
function showModal() {
    document.getElementById('api-key-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('api-key-modal').classList.remove('show');
}

function saveApiKey() {
    const keyInput = document.getElementById('api-key-input');
    const key = keyInput.value.trim();
    
    if (!key) {
        alert('Please enter a valid API key.');
        return;
    }
    
    apiKey = key;
    localStorage.setItem('groqApiKey', key);
    keyInput.value = '';
    closeModal();
    
    // Update status display
    updateApiStatusDisplay();
    
    // Remove any pulsing animation
    const apiBox = document.getElementById('api-status-box');
    apiBox.style.animation = '';
    
    // Continue with consultation if we were trying to start one
    if (symptomsData.bodyArea) {
        showSection('chat-section');
        initializeChat();
    }
}

function saveApiKeyPersistent() {
    const keyInput = document.getElementById('api-key-input-persistent');
    const key = keyInput.value.trim();
    
    if (!key) {
        alert('Please enter a valid API key.');
        return;
    }
    
    // Basic validation - Groq API keys typically start with 'gsk_'
    if (!key.startsWith('gsk_')) {
        alert('Please enter a valid Groq API key (should start with "gsk_").');
        return;
    }
    
    try {
        // Save the API key
        apiKey = key;
        localStorage.setItem('groqApiKey', key);
        
        // Clear the input field
        keyInput.value = '';
        
        // Update status display
        updateApiStatusDisplay();
        
        // Show success message with option to start diagnosis
        showTip('API key saved successfully! You can now use the AI medical assistant.');
        
        // Remove any pulsing animation
        const apiBox = document.getElementById('api-status-box');
        apiBox.style.animation = '';
        
        // Collapse the API status box after successful save
        setTimeout(() => {
            const content = document.getElementById('api-status-content');
            const toggleIcon = document.getElementById('api-status-toggle-icon');
            content.classList.add('collapsed');
            toggleIcon.className = 'fas fa-chevron-down';
        }, 2000);
        
        // If this is the first time setup (no existing symptom data), offer to start diagnosis
        if (!symptomsData.bodyArea) {
            setTimeout(() => {
                if (confirm('API key configured successfully! Would you like to start your medical diagnosis now?')) {
                    startDiagnosis();
                }
            }, 2500);
        }
        
        // Continue with consultation if we were trying to start one
        if (symptomsData.bodyArea) {
            showSection('chat-section');
            initializeChat();
        }
        
        console.log('API key saved successfully');
    } catch (error) {
        console.error('Error saving API key:', error);
        alert('Error saving API key. Please try again.');
    }
}

function clearApiKey() {
    apiKey = '';
    localStorage.removeItem('groqApiKey');
    
    // Update status display
    updateApiStatusDisplay();
    
    // Clear input field
    document.getElementById('api-key-input-persistent').value = '';
    
    showTip('API key cleared');
}

function updateApiStatusDisplay() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');
    const keyInput = document.getElementById('api-key-input-persistent');
    const apiNotice = document.getElementById('api-key-notice');
    
    if (apiKey) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Connected';
        // Don't set the input value to masked dots - keep it empty for new input
        if (keyInput.value === '') {
            keyInput.placeholder = 'API key saved (••••••••••••••••)';
        }
        // Hide the API key notice
        if (apiNotice) {
            apiNotice.style.display = 'none';
        }
    } else {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Not configured';
        keyInput.value = '';
        keyInput.placeholder = 'Enter your Groq API key';
        // Show the API key notice
        if (apiNotice) {
            apiNotice.style.display = 'block';
        }
    }
}

function toggleApiStatusBox() {
    const content = document.getElementById('api-status-content');
    const toggleIcon = document.getElementById('api-status-toggle-icon');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        toggleIcon.className = 'fas fa-chevron-up';
    } else {
        content.classList.add('collapsed');
        toggleIcon.className = 'fas fa-chevron-down';
    }
}

function handleApiKeyEnter(event) {
    if (event.key === 'Enter') {
        saveApiKeyPersistent();
    }
}

// Test API key function
async function testApiKey() {
    if (!apiKey) {
        showTip('No API key configured');
        return;
    }
    
    try {
        // Show loading state
        const statusDot = document.getElementById('api-status-dot');
        const statusText = document.getElementById('api-status-text');
        statusDot.className = 'status-dot loading';
        statusText.textContent = 'Testing...';
        
        console.log('Testing API key with model: meta-llama/llama-4-scout-17b-16e-instruct');
        
        // Test the API key with a simple request
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: 'Hello'
                    }
                ],
                max_tokens: 10
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connected (Tested)';
            showTip('API key is working!');
        } else {
            const errorText = await response.text();
            console.error('API response error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('API key test failed:', error);
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            apiKey: apiKey ? 'Present' : 'Missing'
        });
        statusDot.className = 'status-dot';
        statusText.textContent = 'Connection Failed';
        showTip(`API key test failed: ${error.message}`);
    }
}

// Debug function to check API key and model availability
function debugApiKey() {
    console.log('=== API Key Debug Info ===');
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key starts with gsk_:', apiKey ? apiKey.startsWith('gsk_') : false);
    console.log('Model being used: meta-llama/llama-4-scout-17b-16e-instruct');
    console.log('Local storage key:', localStorage.getItem('groqApiKey') ? 'Present' : 'Missing');
    console.log('========================');
}

// Utility functions
function formatBodyAreaName(area) {
    return area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('api-key-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// Handle API key input enter key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && document.getElementById('api-key-modal').classList.contains('show')) {
        saveApiKey();
    }
});

// Smooth scrolling for better UX
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Call smooth scroll when changing sections
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection(sectionId);
    smoothScrollToTop();
};

// Add some helpful tips
function showTip(message) {
    // Create a temporary tip element
    const tip = document.createElement('div');
    tip.className = 'tip-message';
    tip.textContent = message;
    tip.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-color);
        color: white;
        padding: 1rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(tip);
    
    setTimeout(() => {
        tip.remove();
    }, 3000);
}

// CSS for tip animation
const tipStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = tipStyles;
document.head.appendChild(styleSheet);

// Show helpful tips at appropriate times
function showHelpfulTips() {
    // Show tip when user first visits
    if (!localStorage.getItem('hasVisited')) {
        setTimeout(() => {
            showTip('Click on a body area to start your medical consultation!');
            localStorage.setItem('hasVisited', 'true');
        }, 2000);
    }
}

// Initialize helpful tips
document.addEventListener('DOMContentLoaded', showHelpfulTips); 
