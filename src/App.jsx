import { useState, useEffect } from "react";
import "./App.css"; // Import CSS file

export default function Home() {
  const [transcript, setTranscript] = useState(""); // Stores live captions
  const [isListening, setIsListening] = useState(false); // Tracks microphone state
  const [recognition, setRecognition] = useState(null); // Stores speech recognition instance
  const [firstTime, setFirstTime] = useState(true); // Tracks if it's the first-time use
  let timeoutId = null;

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const newRecognition = new window.webkitSpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = "en-US"; // Set language to English

    newRecognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }

      // Hide instruction once user starts speaking
      setFirstTime(false);

      // Clear timeout for pause detection
      if (timeoutId) clearTimeout(timeoutId);

      // Add a period if the user pauses for 3+ seconds
      timeoutId = setTimeout(() => {
        setTranscript((prev) => {
          if (!prev.endsWith(".")) {
            return prev.trim() + ". ";
          }
          return prev;
        });
      }, 3000);

      setTranscript(text.trim());
    };

    newRecognition.onend = () => {
      if (isListening) {
        newRecognition.start();
      }
    };

    setRecognition(newRecognition);
  }, []);

  // Start or stop listening based on button click
  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="container">
      <h1 className="title">🎤 Lingzhi's Live Captioning App</h1>

      {/* Show instruction only if it's the first-time user */}
      {firstTime && (
        <p className="instruction">
          Press the <strong>"Start Listening"</strong> button and talk to your laptop to start.
        </p>
      )}

      {/* Live caption box */}
      <p className="caption">{transcript || (firstTime ? "" : "Start speaking...")}</p>

      {/* Start/Stop button */}
      <button onClick={toggleListening} className={`button ${isListening ? "stop-button" : "start-button"}`}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
    </div>
  );
}
