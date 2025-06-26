"use client";
import React, { useEffect, useRef, useState } from "react";
import { FiCamera, FiCameraOff } from "react-icons/fi";
import * as faceapi from "face-api.js";

const emojiMap = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  fearful: "😨",
  disgusted: "🤢",
  surprised: "😲",
  neutral: "😐",
};

const Camera = ({ onProxyDetected }) => {
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [emoji, setEmoji] = useState("😐");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    setModelsLoaded(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access the camera. Please allow permissions.");
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    setIsCameraOn(false);
  };

  const toggleCamera = () => {
    if (isCameraOn) stopCamera();
    else startCamera();
  };

  useEffect(() => {
    loadModels().then(startCamera);

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let interval;

    if (isCameraOn && modelsLoaded) {
     interval = setInterval(async () => {
  if (videoRef.current) {
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections.length > 1) {
      onProxyDetected?.(); // call the handler
      clearInterval(interval); // stop further detection
      return;
    }

    if (detections[0]?.expressions) {
      const sorted = Object.entries(detections[0].expressions).sort(
        (a, b) => b[1] - a[1]
      );
      const topEmotion = sorted[0][0];
      setEmoji(emojiMap[topEmotion] || "😐");
    }
  }
}, 1000);

    }

    return () => clearInterval(interval);
  }, [isCameraOn, modelsLoaded]);

  return (
    <div className="relative w-[250px] h-[180px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {error ? (
        <p className="text-red-500 text-center text-sm">{error}</p>
      ) : (
        <>
          <div className="absolute top-2 left-2 text-3xl">{emoji}</div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <button
            onClick={toggleCamera}
            className="absolute bottom-2 right-2 bg-blue-500 rounded-full w-[30px] h-[30px] flex justify-center items-center p-1 hover:bg-white/20 transition"
          >
            {isCameraOn ? <FiCameraOff size={20} /> : <FiCamera size={20} />}
          </button>
        </>
      )}
    </div>
  );
};

export default Camera;