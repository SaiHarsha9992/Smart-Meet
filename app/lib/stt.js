export function startListening(onResult, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true; // Enable partial results
  recognition.maxAlternatives = 1;

  let finalTranscript = "";
  let silenceTimer = null;

  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    // Reset the silence timer on every result
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      recognition.stop(); // Stop after 3s of silence
    }, 2000);
  };

  recognition.onerror = (e) => {
    console.error("Speech recognition error:", e.error);
    clearTimeout(silenceTimer);
  };

  recognition.onend = () => {
    if (finalTranscript.trim()) {
      onResult(finalTranscript.trim());
    }
    onEnd && onEnd();
  };

  recognition.start();
}
