// API Configuration
const TAVUS_API_KEY = 'd5162cdc05384f38b8378f09925ec12b';
const TAVUS_API_BASE_URL = 'https://tavusapi.com/v2';
const TTS_API_BASE_URL = 'http://localhost:5000/api/tts';

// Application State
let sessionActive = false;
let sessionTimer = null;
let sessionStartTime = null;
let userStream = null;
let aiReplicas = [];
let currentReplica = null;
let ttsEnabled = true;
let currentVoiceStyle = 'professional'; // professional, warm, calm
let audioContext = null;
let audioQueue = [];
let isPlayingAudio = false;

// DOM Elements
const startSessionBtn = document.getElementById('startSession');
const endSessionBtn = document.getElementById('endSession');
const createReplicaBtn = document.getElementById('createReplica');
const sessionTimerElement = document.getElementById('sessionTimer');
const aiVideoElement = document.getElementById('aiVideo');
const userVideoElement = document.getElementById('userVideo');
const chatMessagesElement = document.getElementById('chatMessages');
const messageInputElement = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const replicaListElement = document.getElementById('replicaList');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadReplicas();
});

function initializeApp() {
    console.log('AI Psychology Expert App Initialized');
    
    // Add fade-in animation to main elements
    document.querySelectorAll('.card, .video-card, .chat-card').forEach(el => {
        el.classList.add('fade-in');
    });
    
    // Initialize TTS
    initializeTTS();
    
    // Initialize audio context for TTS playback
    initializeAudioContext();
}

function setupEventListeners() {
    // Session controls
    startSessionBtn.addEventListener('click', startSession);
    endSessionBtn.addEventListener('click', endSession);
    createReplicaBtn.addEventListener('click', showCreateReplicaModal);
    document.getElementById('createPsychologyPersona').addEventListener('click', createPsychologyPersona);
    
    // Chat functionality
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Modal controls
    document.getElementById('submitReplica').addEventListener('click', createReplica);
    
    // Close modal on backdrop click
    document.getElementById('createReplicaModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideCreateReplicaModal();
        }
    });
}

// Session Management
async function startSession() {
    try {
        // Request camera and microphone access
        userStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Display user video
        const userVideo = document.createElement('video');
        userVideo.srcObject = userStream;
        userVideo.autoplay = true;
        userVideo.muted = true;
        userVideo.playsInline = true;
        
        userVideoElement.innerHTML = '';
        userVideoElement.appendChild(userVideo);
        
        // Update UI
        sessionActive = true;
        sessionStartTime = Date.now();
        startSessionBtn.disabled = true;
        endSessionBtn.disabled = false;
        
        // Start session timer
        startSessionTimer();
        
        // Simulate AI video connection
        simulateAIVideoConnection();
        
        // Add welcome message
        addMessage('ai', 'Great! I can see you now. How are you feeling today? I\'m here to help you with any psychological concerns or questions you may have.');
        
        // Try to start psychology conversation if persona exists
        if (window.psychologyPersonaId) {
            startPsychologyConversation(window.psychologyPersonaId);
        }
        
        showNotification('Session started successfully!', 'success');
        
    } catch (error) {
        console.error('Error starting session:', error);
        showNotification('Failed to start session. Please check camera and microphone permissions.', 'error');
    }
}

function endSession() {
    // Stop user video stream
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
        userStream = null;
    }
    
    // Reset video elements
    userVideoElement.innerHTML = `
        <div class="video-placeholder">
            <i class="fas fa-user"></i>
            <p>Your Video</p>
        </div>
    `;
    
    aiVideoElement.innerHTML = `
        <div class="video-placeholder">
            <i class="fas fa-user-md"></i>
            <p>AI Psychology Expert</p>
            <small class="text-muted">Click "Start Session" to begin</small>
        </div>
    `;
    
    // Update UI
    sessionActive = false;
    startSessionBtn.disabled = false;
    endSessionBtn.disabled = true;
    
    // Stop session timer
    stopSessionTimer();
    
    // Add session end message
    addMessage('ai', 'Session ended. Thank you for talking with me today. Remember, it\'s important to take care of your mental health. Feel free to start a new session anytime you need support.');
    
    showNotification('Session ended', 'info');
}

function startSessionTimer() {
    sessionTimer = setInterval(() => {
        if (sessionStartTime) {
            const elapsed = Date.now() - sessionStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            sessionTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function stopSessionTimer() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
    sessionTimerElement.textContent = '00:00';
}

// AI Video Simulation
function simulateAIVideoConnection() {
    // Simulate AI video loading
    aiVideoElement.innerHTML = `
        <div class="video-placeholder">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Connecting to AI Expert...</p>
        </div>
    `;
    
    // Simulate connection after 2 seconds
    setTimeout(() => {
        aiVideoElement.innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-user-md pulse"></i>
                <p>Dr. Sarah Chen</p>
                <small class="text-success">Connected</small>
            </div>
        `;
    }, 2000);
}

// Chat Functionality
function sendMessage() {
    const message = messageInputElement.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    messageInputElement.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addMessage('ai', aiResponse);
        speakText(aiResponse); // Optional: for instant TTS
        requestTavusVideo('rb17cf590e15', aiResponse); // Tavus video generation
    }, 1000 + Math.random() * 2000); // Random delay for realism
}

function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    content.appendChild(messageText);
    content.appendChild(messageTime);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessagesElement.appendChild(messageDiv);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// AI Response Generation (Psychology-focused)
function generateAIResponse(userMessage) {
    const responses = {
        greetings: [
            "Hello! I'm here to support you. How are you feeling today?",
            "Hi there! I'm Dr. Sarah Chen, your AI psychology expert. What's on your mind?",
            "Welcome! I'm here to help you with any psychological concerns. How can I assist you?"
        ],
        anxiety: [
            "I understand anxiety can be very challenging. Can you tell me more about what's causing you to feel anxious?",
            "Anxiety is a common experience, and it's completely normal to feel this way. What specific symptoms are you experiencing?",
            "Let's work through this together. When did you first notice these anxious feelings?"
        ],
        depression: [
            "I hear that you're struggling, and I want you to know that your feelings are valid. How long have you been feeling this way?",
            "Depression can make everything feel overwhelming. Can you describe what a typical day looks like for you right now?",
            "Thank you for sharing this with me. Have you noticed any changes in your sleep, appetite, or energy levels?"
        ],
        stress: [
            "Stress can really take a toll on our mental health. What specific situations are causing you stress right now?",
            "It sounds like you're dealing with a lot of pressure. How are you currently coping with these stressors?",
            "Stress management is so important. What activities usually help you feel more relaxed?"
        ],
        relationships: [
            "Relationships can be complex and emotionally challenging. Can you tell me more about what's happening?",
            "Interpersonal dynamics can really impact our mental health. How is this relationship affecting you?",
            "It's important to set healthy boundaries in relationships. What would you like to see change?"
        ],
        general: [
            "That's interesting. Can you tell me more about that?",
            "I appreciate you sharing that with me. How does that make you feel?",
            "Thank you for being open with me. What would be most helpful for you right now?",
            "I'm here to listen and support you. What would you like to focus on today?"
        ]
    };
    
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return getRandomResponse(responses.greetings);
    } else if (message.includes('anxiety') || message.includes('anxious') || message.includes('worry')) {
        return getRandomResponse(responses.anxiety);
    } else if (message.includes('depression') || message.includes('sad') || message.includes('hopeless')) {
        return getRandomResponse(responses.depression);
    } else if (message.includes('stress') || message.includes('overwhelmed') || message.includes('pressure')) {
        return getRandomResponse(responses.stress);
    } else if (message.includes('relationship') || message.includes('partner') || message.includes('friend')) {
        return getRandomResponse(responses.relationships);
    } else {
        return getRandomResponse(responses.general);
    }
}

function getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// TTS Functions
async function initializeTTS() {
    try {
        const response = await fetch(`${TTS_API_BASE_URL}/models`);
        const data = await response.json();
        
        if (data.success) {
            console.log('TTS models available:', data.models.length);
            showNotification('TTS system initialized successfully', 'success');
        } else {
            console.warn('TTS initialization failed:', data.error);
            showNotification('TTS system not available - using fallback', 'warning');
        }
    } catch (error) {
        console.error('TTS initialization error:', error);
        showNotification('TTS system not available - using fallback', 'warning');
    }
}

function initializeAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context initialized');
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
    }
}

async function speakText(text) {
    if (!ttsEnabled) return;
    
    try {
        // Add to audio queue
        audioQueue.push(text);
        
        // Process queue if not currently playing
        if (!isPlayingAudio) {
            processAudioQueue();
        }
    } catch (error) {
        console.error('Error in TTS:', error);
        // Fallback to browser speech synthesis
        fallbackSpeakText(text);
    }
}

async function processAudioQueue() {
    if (audioQueue.length === 0 || isPlayingAudio) return;
    
    isPlayingAudio = true;
    const text = audioQueue.shift();
    
    try {
        // Request TTS from server
        const response = await fetch(`${TTS_API_BASE_URL}/psychology-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                voice_style: currentVoiceStyle
            })
        });
        
        if (response.ok) {
            const audioBlob = await response.blob();
            await playAudioBlob(audioBlob);
        } else {
            console.warn('TTS request failed, using fallback');
            fallbackSpeakText(text);
        }
    } catch (error) {
        console.error('TTS error:', error);
        fallbackSpeakText(text);
    } finally {
        isPlayingAudio = false;
        
        // Process next item in queue
        if (audioQueue.length > 0) {
            setTimeout(processAudioQueue, 100);
        }
    }
}

async function playAudioBlob(audioBlob) {
    return new Promise((resolve, reject) => {
        try {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
            
            audio.onerror = (error) => {
                URL.revokeObjectURL(audioUrl);
                reject(error);
            };
            
            audio.play();
        } catch (error) {
            reject(error);
        }
    });
}

function fallbackSpeakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Try to find a female voice for the AI expert
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => voice.name.includes('female') || voice.name.includes('Female'));
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

async function changeVoiceStyle(style) {
    currentVoiceStyle = style;
    
    // Update UI to reflect voice style
    const voiceStyleElements = document.querySelectorAll('.voice-style-btn');
    voiceStyleElements.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.style === style) {
            btn.classList.add('active');
        }
    });
    
    showNotification(`Voice style changed to ${style}`, 'info');
}

function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const ttsToggleBtn = document.getElementById('ttsToggle');
    if (ttsToggleBtn) {
        ttsToggleBtn.innerHTML = ttsEnabled ? 
            '<i class="fas fa-volume-up me-2"></i>Disable TTS' : 
            '<i class="fas fa-volume-mute me-2"></i>Enable TTS';
    }
    
    showNotification(`TTS ${ttsEnabled ? 'enabled' : 'disabled'}`, 'info');
}

// Voice Cloning Functions
async function testVoiceClone() {
    const fileInput = document.getElementById('voiceCloneFile');
    const statusDiv = document.getElementById('voiceCloneStatus');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('Please select an audio file first', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Show loading status
    statusDiv.innerHTML = '<div class="text-warning"><i class="fas fa-spinner fa-spin me-2"></i>Processing voice clone...</div>';
    
    try {
        const formData = new FormData();
        formData.append('audio_file', file);
        formData.append('text', 'Hello, this is a test of the voice cloning system. How does my voice sound?');
        
        const response = await fetch(`${TTS_API_BASE_URL}/voice-clone`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const audioBlob = await response.blob();
            
            // Play the cloned voice
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };
            
            audio.play();
            
            statusDiv.innerHTML = '<div class="text-success"><i class="fas fa-check me-2"></i>Voice clone successful! Playing test audio...</div>';
            showNotification('Voice cloning successful!', 'success');
            
        } else {
            const errorData = await response.json();
            statusDiv.innerHTML = `<div class="text-danger"><i class="fas fa-times me-2"></i>Error: ${errorData.error}</div>`;
            showNotification('Voice cloning failed', 'error');
        }
        
    } catch (error) {
        console.error('Voice cloning error:', error);
        statusDiv.innerHTML = '<div class="text-danger"><i class="fas fa-times me-2"></i>Voice cloning failed</div>';
        showNotification('Voice cloning failed', 'error');
    }
}

// Tavus Video Generation Integration
async function requestTavusVideo(replicaId, text) {
    try {
        console.log('Requesting Tavus video for replica:', replicaId);
        console.log('Text to speak:', text);
        
        // Show loading spinner in AI video area
        aiVideoElement.innerHTML = `
            <div class="video-placeholder">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Generating AI video...</p>
            </div>
        `;
        
        // 1. Create a new conversation (video generation)
        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-api-key": TAVUS_API_KEY
            },
            body: JSON.stringify({
                "replica_id": replicaId,
                "script": text
            }),
        });
        
        console.log('Tavus API Response Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Tavus API Error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Tavus API Response Data:', data);
        
        if (!data.conversation_id) {
            console.error('No conversation_id in response:', data);
            throw new Error('No conversation_id returned');
        }
        
        // 2. Poll for video status
        pollTavusVideo(data.conversation_id);
    } catch (error) {
        console.error('Error requesting Tavus video:', error);
        showNotification(`Failed to generate AI video: ${error.message}`, 'error');
        
        // Reset AI video area on error
        aiVideoElement.innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-user-md"></i>
                <p>AI Psychology Expert</p>
                <small class="text-muted">Video generation failed</small>
            </div>
        `;
    }
}

async function pollTavusVideo(conversationId) {
    const statusUrl = `https://tavusapi.com/v2/conversations/${conversationId}`;
    let attempts = 0;
    const maxAttempts = 20;
    const pollInterval = 5000; // 5 seconds

    async function poll() {
        attempts++;
        console.log(`Polling attempt ${attempts} for conversation: ${conversationId}`);
        
        try {
            const response = await fetch(statusUrl, {
                headers: { "x-api-key": TAVUS_API_KEY }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Polling error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Polling response:', data);
            
            if (data.status === 'completed' && data.video_url) {
                console.log('Video ready! URL:', data.video_url);
                // Show the video in the AI video area
                aiVideoElement.innerHTML = `<video src="${data.video_url}" controls autoplay style="width:100%;border-radius:10px;"></video>`;
                showNotification('AI video generated successfully!', 'success');
            } else if (data.status === 'failed') {
                console.error('Video generation failed:', data);
                showNotification('AI video generation failed.', 'error');
                aiVideoElement.innerHTML = `
                    <div class="video-placeholder">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                        <p>Video Generation Failed</p>
                        <small class="text-muted">Please try again</small>
                    </div>
                `;
            } else if (attempts < maxAttempts) {
                console.log(`Status: ${data.status}, waiting ${pollInterval}ms...`);
                setTimeout(poll, pollInterval);
            } else {
                console.error('Polling timed out');
                showNotification('AI video generation timed out.', 'error');
                aiVideoElement.innerHTML = `
                    <div class="video-placeholder">
                        <i class="fas fa-clock text-warning"></i>
                        <p>Generation Timed Out</p>
                        <small class="text-muted">Please try again</small>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Polling error:', error);
            if (attempts < maxAttempts) {
                setTimeout(poll, pollInterval);
            } else {
                showNotification('Error checking video status.', 'error');
            }
        }
    }
    poll();
}

// Replica Management
function showCreateReplicaModal() {
    const modal = new bootstrap.Modal(document.getElementById('createReplicaModal'));
    modal.show();
}

function hideCreateReplicaModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('createReplicaModal'));
    if (modal) {
        modal.hide();
    }
}

async function createReplica() {
    const replicaName = document.getElementById('replicaName').value.trim();
    const trainVideoUrl = document.getElementById('trainVideoUrl').value.trim();
    const callbackUrl = document.getElementById('callbackUrl').value.trim();
    
    if (!replicaName || !trainVideoUrl) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        const response = await fetch(`${TAVUS_API_BASE_URL}/replicas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': TAVUS_API_KEY
            },
            body: JSON.stringify({
                replica_name: replicaName,
                train_video_url: trainVideoUrl,
                callback_url: callbackUrl || ''
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add new replica to list
        addReplicaToList(data.replica_id, replicaName, data.status);
        
        // Hide modals
        loadingModal.hide();
        hideCreateReplicaModal();
        
        // Clear form
        document.getElementById('replicaForm').reset();
        
        showNotification('Replica created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating replica:', error);
        loadingModal.hide();
        showNotification('Failed to create replica. Please check your API key and video URL.', 'error');
    }
}

function addReplicaToList(replicaId, name, status) {
    const replicaItem = document.createElement('div');
    replicaItem.className = 'replica-item fade-in';
    replicaItem.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="replica-avatar me-2">
                <i class="fas fa-robot"></i>
            </div>
            <div class="flex-grow-1">
                <small class="text-muted">${replicaId}</small>
                <div class="d-flex align-items-center">
                    <span class="badge bg-${status === 'training' ? 'warning' : 'success'} me-2">${status}</span>
                    <small class="text-muted">${name}</small>
                </div>
            </div>
        </div>
    `;
    
    replicaListElement.appendChild(replicaItem);
}

function loadReplicas() {
    // Load existing replicas (in a real app, this would fetch from API)
    const existingReplicas = [
        { id: 'r783537ef5', name: 'Dr. Chen - Psychology', status: 'training' }
    ];
    
    existingReplicas.forEach(replica => {
        addReplicaToList(replica.id, replica.name, replica.status);
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden && sessionActive) {
        showNotification('Session paused - page is not visible', 'warning');
    }
});

// Create Psychology Expert Persona
async function createPsychologyPersona() {
    try {
        console.log('Creating psychology expert persona...');
        
        const response = await fetch('https://tavusapi.com/v2/personas', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-api-key": TAVUS_API_KEY
            },
            body: JSON.stringify({
                "persona_name": "Psychology Expert",
                "default_replica_id": "rb17cf590e15",
                "system_prompt": "You are Dr. Sarah Chen, a 35-year-old clinical psychologist with 15+ years of experience specializing in cognitive behavioral therapy, anxiety, depression, and stress management. You have a warm, empathetic, and professional demeanor. You're passionate about helping people understand their mental health and develop healthy coping strategies. Your approach is evidence-based, compassionate, and non-judgmental. You excel at active listening and asking insightful questions that help people gain self-awareness. When speaking with clients, you maintain a supportive and encouraging tone while maintaining professional boundaries. You're knowledgeable about psychology but explain complex concepts in accessible ways, often using relatable examples and analogies. You have a talent for helping people reframe their thoughts and develop practical strategies for managing their mental health. You believe in the power of therapy and the importance of mental health awareness. You encourage people to be kind to themselves and seek help when needed. Your responses will be spoken out loud, so speak naturally as you would in a therapy session. Don't refer to yourself as an AI, LLM, assistant, or any similar terms - you are simply Dr. Sarah Chen, a psychologist. You initiate conversations with a warm greeting, then follow the client's lead. If they seem hesitant, you might ask about their general well-being or what brought them to seek support. Your goal is to provide psychological support, education, and guidance in a safe, professional environment.",
                "context": "You're having a video conversation with someone seeking psychological support or guidance. This is a Conversational Video Interface that allows for real-time interaction. Your role is to be a professional psychologist who provides evidence-based psychological support and education. You specialize in anxiety, depression, stress management, relationship issues, and general mental health concerns. You will only provide general psychological information and support - you are not providing formal therapy or diagnosis. Your purpose is to offer psychological education, coping strategies, and supportive guidance, not to replace professional mental health treatment. You must NEVER provide medical advice, diagnose mental health conditions, or recommend specific medications. If someone is in crisis or needs immediate help, always encourage them to contact emergency services or a mental health professional. When discussing mental health topics, maintain a balanced, evidence-based approach. Your conversation should be educational and supportive, focused on psychological concepts and healthy coping strategies. Ask open-ended questions about their experiences and feelings to encourage self-reflection. Share well-documented psychological information and practical strategies from reputable sources. Recommend professional resources, books, or mental health services when appropriate. Based on visual cues from ambient awareness: If you notice the person seems distressed, gently check in with them and offer supportive words. If you notice any signs of crisis, immediately provide crisis resources and encourage professional help. Your goal is to create a safe, supportive space for psychological discussion and education.",
                "layers": {
                    "perception": {
                        "perception_model": "raven-0",
                        "ambient_awareness_queries": [
                            "Is the user maintaining eye contact and appearing engaged, or do they seem distracted?",
                            "Does the user appear to be in a comfortable, private environment for this conversation?",
                            "Is the user showing signs of emotional distress, anxiety, or comfort through their facial expressions or body language?",
                            "Is the user in an environment that provides context for their mental health needs (home, office, private space)?"
                        ]
                    }
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Persona creation error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Psychology persona created:', data);
        
        if (data.persona_id) {
            // Store the persona ID for future use
            window.psychologyPersonaId = data.persona_id;
            showNotification('Psychology expert persona created successfully!', 'success');
            return data.persona_id;
        } else {
            throw new Error('No persona_id returned');
        }
        
    } catch (error) {
        console.error('Error creating psychology persona:', error);
        showNotification(`Failed to create psychology persona: ${error.message}`, 'error');
        return null;
    }
}

// Start conversation with psychology persona
async function startPsychologyConversation(personaId) {
    try {
        console.log('Starting conversation with psychology persona:', personaId);
        
        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-api-key": TAVUS_API_KEY
            },
            body: JSON.stringify({
                "persona_id": personaId
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Conversation start error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Conversation started:', data);
        
        if (data.conversation_id) {
            // Store the conversation ID
            window.currentConversationId = data.conversation_id;
            showNotification('Psychology conversation started!', 'success');
            return data.conversation_id;
        } else {
            throw new Error('No conversation_id returned');
        }
        
    } catch (error) {
        console.error('Error starting psychology conversation:', error);
        showNotification(`Failed to start conversation: ${error.message}`, 'error');
        return null;
    }
}

// Export functions for potential external use
window.AIPsychologyApp = {
    startSession,
    endSession,
    createReplica,
    createPsychologyPersona,
    startPsychologyConversation,
    addMessage,
    showNotification
}; 