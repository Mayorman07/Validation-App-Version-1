import { niceMessages } from './messages.js'; // Import the messages

const msgEl = document.getElementById('msg');
const niceThingsEl = document.getElementById('nice-things');
const restartBtn = document.getElementById('restart-btn');

let userName = '';
let isRecognizing = false;
let isSpeaking = false;
let voices = [];

if (!("SpeechRecognition" in window)) {
    window.SpeechRecognition = window.webkitSpeechRecognition;
}

if (!window.SpeechRecognition) {
    alert("Speech Recognition not supported.");
} else {
    const recognition = new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = onSpeak;
    recognition.onerror = (e) => console.error("Recognition error:", e);
    recognition.onend = () => {
        if (!isSpeaking) {
            startRecognition();
        }
    };

    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            setTimeout(loadVoices, 200);
        }
    }

    window.speechSynthesis.onvoiceschanged = loadVoices;

    function startRecognition() {
        if (!isRecognizing && !isSpeaking) {
            recognition.start();
            isRecognizing = true;
        }
    }

    function onSpeak(e) {
        if (isSpeaking) return;

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
        const message = `Lovely to meet you, ${name}! You light up the room with just your smile!`;
        niceThingsEl.innerHTML = `<div>${message}</div>`;
        speakMessage(message, () => speakNiceThings(name));
    }

    function speakNiceThings(name) {
        // Shuffle messages
        const shuffledMessages = [...niceMessages];
        shuffledMessages.sort(() => Math.random() - 0.5);

        let currentIndex = 0;

        function speakNext() {
            if (currentIndex < shuffledMessages.length) {
                const message = shuffledMessages[currentIndex];
                const personalizedMessage = message.replace("{name}", name);
                speakMessage(personalizedMessage, () => {
                    currentIndex++;
                    speakNext();
                });
            } else {
                recognition.stop();
                isRecognizing = false;
                resetUI();
            }
        }

        speakNext();
    }

    function speakMessage(message, callback = null) {
        window.speechSynthesis.cancel();
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
            restartBtn.style.display = 'block';
        }, 2000);
    }

    document.addEventListener('click', () => {
        loadVoices();
        startRecognition();
    }, { once: true });

    restartBtn.addEventListener('click', () => {
        userName = '';
        document.querySelector('h1').innerText = 'Say your name!';
        document.querySelector('h2').innerText = 'I’m Jarvis, Mayowa created me for you!';
        document.querySelector('h3').innerText = 'Speak your name into the microphone';
        restartBtn.style.display = 'none';
        startRecognition();
    });
}