"use client";
import React, { useState } from "react";
import { startListening } from "@/app/lib/stt";

const SpeechRecorder = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStart = () => {
    setIsListening(true);
    startListening((text) => {
      setTranscript(text);
      onTranscript(text);
    }, () => {
      setIsListening(false);
    });
  };

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleStart}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        {isListening ? "Listening..." : "Start Speaking"}
      </button>
      {transcript && (
        <p className="text-white mt-2 italic">You said: "{transcript}"</p>
      )}
    </div>
  );
};

export default SpeechRecorder;
