const msgEl = document.getElementById('msg');
const niceThingsEl = document.getElementById('nice-things');

let userName = ''; // Store the user's name
let isRecognizing = false; // Track if recognition is running
let isSpeaking = false; // Track if speech synthesis is active

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

  let voices = []; // Store available voices

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
    const niceMessages = [
      `You have a wonderful personality, ${name}.`,
      `Keep shining, you're doing great!`,
      `You're capable of achieving amazing things, ${name}.`,
      `You bring joy to everyone around you!`,
      `Stay awesome! Keep believing in yourself.`
    ];

    let index = 0;

    function speakNext() {
      if (index < niceMessages.length) {
        speakMessage(niceMessages[index], () => {
          index++;
          speakNext();
        });
      } else {
        resetUI();
      }
    }

    speakNext();
  }

  function speakMessage(message, callback = null) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
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
      document.querySelector('h3').innerText = 'Keep Smiling as you listen!';
      startRecognition();
    }, 2000);
  }

  window.addEventListener('load', () => {
    loadVoices();
    setTimeout(startRecognition, 500);
  });

  document.body.addEventListener('click', e => {
    if (e.target.id == 'play-again') {
      window.location.reload();
    }
  });
}