import { niceMessages } from './messages.js'; // Import the messages

const msgEl = document.getElementById('msg');
const niceThingsEl = document.getElementById('nice-things');
const restartBtn = document.getElementById('restart-btn');

let userName = ''; // Store the user's name
let isRecognizing = false; // Track if recognition is running
let isSpeaking = false; // Track if speech synthesis is active
let voices = []; // Store available voices

// Ensure SpeechRecognition is supported
if (!("SpeechRecognition" in window)) {
    window.SpeechRecognition = window.webkitSpeechRecognition;
}

if (!window.SpeechRecognition) {
    alert("Speech Recognition is not supported in your browser.");
} else {
    let recognition = new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = onSpeak;
    recognition.onerror = (e) => console.error("Recognition error:", e);
    recognition.onend = () => {
        if (!isSpeaking) {
            startRecognition(); // Restart only if speech isn't happening
        }
    };

    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            setTimeout(loadVoices, 200); // Retry loading voices every 200ms
        } else {
            console.log("Voices loaded:", voices);
        }
    }

    window.speechSynthesis.onvoiceschanged = loadVoices;

    function startRecognition() {
        if (!isRecognizing && !isSpeaking) {
            recognition.start();
            isRecognizing = true;
            console.log("Speech recognition started...");
        }
    }

    function onSpeak(e) {
        if (isSpeaking) return; // Prevent recognition while speaking

        const msg = e.results[0][0].transcript.trim();
        console.log("User said:", msg);

        if (!userName) {
            userName = msg;
            greetUser(msg);
        } else {
            speakNiceThings(userName);
        }
    }

    function greetUser(name) {
        const message = `Nice to meet you, ${name}! You are incredible, and I want to tell you why!`;
        niceThingsEl.innerHTML = `<div>${message}</div>`;
        speakMessage(message, () => speakNiceThings(name));
    }

    function speakNiceThings(name) {
        let index = 0;

        function speakNext() {
            if (index < niceMessages.length) {
                const personalizedMessage = niceMessages[index].replace("{name}", name); // Replace placeholder with user's name
                speakMessage(personalizedMessage, () => {
                    index++;
                    speakNext();
                });
            } else {
                // Stop speech recognition after speaking all messages
                recognition.stop();
                isRecognizing = false;
                resetUI();
            }
        }

        speakNext(); // Start speaking compliments
    }

    function speakMessage(message, callback = null) {
        console.log("Speaking message:", message);
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const speech = new SpeechSynthesisUtterance(message);

        if (voices.length === 0) {
            setTimeout(() => speakMessage(message, callback), 100);
            return;
        }

        const selectedVoice = voices.find(v => v.name.includes('Google UK English Female'));
        if (selectedVoice) speech.voice = selectedVoice;

        isSpeaking = true;
        speech.onend = () => {
            isSpeaking = false;
            if (callback) callback();
        };

        window.speechSynthesis.speak(speech);
    }

    function resetUI() {
        setTimeout(() => {
            niceThingsEl.innerHTML = '';
            document.querySelector('h1').innerText = 'Great to Meet You!';
            document.querySelector('h2').innerText = 'I’m Jarvis, Mayowa created me for you!';
            document.querySelector('h3').innerText = 'Thank you for listening!';
            restartBtn.style.display = 'block'; // Show the restart button
        }, 2000);
    }

    // Wait for user interaction before starting recognition
    document.addEventListener('click', () => {
        console.log("User interacted with the page.");
        loadVoices();
        startRecognition();
    }, { once: true });

    // Restart functionality
    restartBtn.addEventListener('click', () => {
        userName = ''; // Reset the user's name
        document.querySelector('h1').innerText = 'Say your name!';
        document.querySelector('h2').innerText = 'I’m Jarvis, Mayowa created me for you!';
        document.querySelector('h3').innerText = 'Speak your name into the microphone';
        restartBtn.style.display = 'none'; // Hide the restart button
        startRecognition();
    });
}