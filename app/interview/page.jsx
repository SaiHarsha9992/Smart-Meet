"use client";

import React, { useState, useEffect } from "react";
import { askGemini } from "@/app/lib/gemini";
import { speak } from "@/app/lib/tts";
import SpeechRecorder from "@/app/components/SpeechRecorder";
import Camera from "../components/Camera";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import { useAuth } from "../lib/useAuth";
import { useInterview } from "../context/InterviewContext";

export default function InterviewPage() {
  const router = useRouter();
  const user = useAuth();
  const { setMockResult, setCandidateName, skills, experience } = useInterview();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTabDialog, setShowTabDialog] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [proxyFailed, setProxyFailed] = useState(false);
  const [proxyWarnings, setProxyWarnings] = useState(0);
  const userName = user?.displayName || "Student";

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user]);

  useEffect(() => {
    const explainInterview = async () => {
      if (!skills.length || !experience) {
        if (!started && !proxyFailed) {
          setTimeout(() => {
            router.push("/upload");
          }, 2000);
        }
        return;
      }

      const prompt = `Give a short and friendly explanation for a mock interview for a student named ${userName}, who is learning ${skills.join(", ")} with experience level: ${experience}. Include what type of roles ${userName} can get and how this mock will help. Also, generate only 5 short and simple interview questions relevant to these skills.`;
      const intro = await askGemini(prompt);
      setMessages([{ role: "ai", text: intro }]);
      speak(intro);
      setIntroSpoken(true);
    };

    explainInterview();
  }, [skills, experience, proxyFailed]);

  const handleProxyDetected = () => {
  if (proxyWarnings === 0) {
    // 🔔 First warning only
    speak("Warning: Multiple people detected. Please make sure you are alone.");
    setProxyWarnings(1);
    setShowWarningDialog(true); // ✅ show the warning dialog
    return;
  }


  const result = {
    candidate: userName,
    date: new Date().toLocaleDateString("en-IN"),
    feedback: {
      communication: 0,
      problemSolving: 0,
      technicalSkills: 0,
      confidence: 0,
      timeManagement: 0,
      overall: 0,
    },
    result: false,
    remarks: "❌ Interview failed. Multiple faces detected (proxy attempt).",
    status: "Failed",
    questions: [],
  };
  setMockResult(result);
  setCandidateName(userName);
  setProxyFailed(true);
  speak("Interview failed. Multiple people detected. You are disqualified.");
  setStarted(false);
  document.exitFullscreen?.();
  const video = document.querySelector("video");
  if (video?.srcObject) video.srcObject.getTracks().forEach((track) => track.stop());
  setTimeout(() => router.push("/result"), 500);
};


  const startInterview = async () => {
    setStarted(true);
    await document.documentElement.requestFullscreen();
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Generate 5 short, beginner-friendly interview questions for a student learning ${skills.join(", ")} with ${experience} experience. Only return the questions in a list format.`,
      }),
    });
    const data = await res.json();
    setQuestions(data.questions || []);
    setAnswered(new Array(data.questions?.length || 0).fill(false));
    if (data.questions?.length > 0) {
      const q = data.questions[0];
      setMessages((prev) => [...prev, { role: "ai", text: q }]);
      setTimeout(() => speak(q), 400);
    }
  };

  const handleTranscript = async (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    setAnswered((prev) => {
      const updated = [...prev];
      updated[current] = true;
      return updated;
    });

    const prompt = `The student ${userName}, who has ${experience} level experience, answered: "${text}". Based on their skills in ${skills.join(", ")}, provide kind, helpful, and constructive feedback. Avoid harsh criticism.`;

    const feedback = await askGemini(prompt);
    setMessages((prev) => [...prev, { role: "ai", text: feedback }]);
    speak(feedback);
    setLoading(false);
  };

  const handleNext = () => {
    if (!answered[current]) {
      setShowWarningDialog(true);
      return;
    }
    const nextIndex = current + 1;
    if (nextIndex < questions.length) {
      setCurrent(nextIndex);
      const q = questions[nextIndex];
      setMessages((prev) => [...prev, { role: "ai", text: q }]);
      speak(q);
    } else {
      const doneMessage = "🎉 Mock interview complete! Well done.";
      setMessages((prev) => [...prev, { role: "ai", text: doneMessage }]);
      speak(doneMessage);
    }
  };

  const handleFinishInterview = async () => {
    const userAnswers = messages.filter((msg) => msg.role === "user").map((msg) => msg.text).join("\n");
    const unansweredCount = answered.filter((ans) => !ans).length;

    const prompt = `You are an AI interviewer. Based on the student's answers below, give a performance review with scores out of 10 for: communication, problem solving, technical skills, confidence, time management, overall (average). Verdict: "Passed" or "Failed". Remark: short and kind. Skipped ${unansweredCount} out of ${questions.length} questions.\nAnswers:\n${userAnswers}`;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = await res.json();
      setMockResult(result);
      setCandidateName(userName);
      document.exitFullscreen?.();
      const video = document.querySelector("video");
      if (video?.srcObject) video.srcObject.getTracks().forEach((track) => track.stop());
      router.push("/result");
    } catch (err) {
      console.error("❌ Failed to evaluate report:", err);
      alert("Something went wrong during evaluation.");
    }
  };

  // Fullscreen exit warning
  useEffect(() => {
    const handleFullscreenExit = () => {
      if (!document.fullscreenElement && started) {
        setWarnings((prev) => {
          const updated = prev + 1;
          if (updated >= 3) {
            const result = {
              candidate: userName,
              date: new Date().toLocaleDateString("en-IN"),
              feedback: {
                communication: 0,
                problemSolving: 0,
                technicalSkills: 0,
                confidence: 0,
                timeManagement: 0,
                overall: 0,
              },
              result: false,
              remarks: "❌ Proxy detected or user manipulated the exam by exiting full screen repeatedly.",
              status: "Failed",
              questions: [],
            };
            setMockResult(result);
            setCandidateName(userName);
            speak("Interview canceled. Proxy or manipulation detected.");
            setStarted(false);
            document.exitFullscreen?.();
            const video = document.querySelector("video");
            if (video?.srcObject) video.srcObject.getTracks().forEach((track) => track.stop());
            setTimeout(() => router.push("/result"), 0);
          } else {
            setShowExitDialog(true);
          }
          return updated;
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenExit);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenExit);
  }, [started]);

  // Tab switch warning
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.visibilityState === "hidden" && started) {
        setTabWarnings((prev) => {
          const updated = prev + 1;
          if (updated >= 3) {
            const result = {
              candidate: userName,
              date: new Date().toLocaleDateString("en-IN"),
              feedback: {
                communication: 0,
                problemSolving: 0,
                technicalSkills: 0,
                confidence: 0,
                timeManagement: 0,
                overall: 0,
              },
              result: false,
              remarks: "❌ Interview failed. Tab switching or minimizing screen repeatedly.",
              status: "Failed",
              questions: [],
            };
            setMockResult(result);
            setCandidateName(userName);
            speak("Interview failed due to tab switching.");
            setStarted(false);
            document.exitFullscreen?.();
            const video = document.querySelector("video");
            if (video?.srcObject) video.srcObject.getTracks().forEach((track) => track.stop());
            setTimeout(() => router.push("/result"), 500);
          } else {
            setShowTabDialog(true);
          }
          return updated;
        });
      }
    };

    document.addEventListener("visibilitychange", handleTabSwitch);
    return () => document.removeEventListener("visibilitychange", handleTabSwitch);
  }, [started]);

  // Report dialog submit
  const handleSubmitReport = async () => {
    try {
      const res = await fetch("https://9xbddx8l07.execute-api.eu-north-1.amazonaws.com/prod/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user?.displayName || "Unknown",
          email: user?.email || "unknown@example.com",
          issue_type: issueType,
          issue_description: issueDescription,
          contact_number: contactNumber,
        }),
      });
      if (res.ok) {
        alert("✅ Issue reported successfully.");
        setShowReportDialog(false);
        setIssueType("");
        setIssueDescription("");
        setContactNumber("");
      } else {
        alert("❌ Failed to report the issue.");
      }
    } catch (error) {
      console.error("Report error:", error);
      alert("⚠️ Something went wrong while reporting.");
    }
  };

  if (user === undefined) return <div className="text-white text-center p-6">Checking login...</div>;

  return (
    <div className="relative min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <NavBar />
      <h1 className="text-3xl font-bold mb-2 text-center">🧠 AI Mock Interview</h1>

      <div className="fixed bottom-4 left-4 z-50 border border-gray-600 rounded-lg overflow-hidden">
        <Camera onProxyDetected={handleProxyDetected} />
      </div>

      <div className="w-full max-w-3xl space-y-4 bg-zinc-900 p-6 rounded-xl shadow-md h-[450px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-sky-600 text-white" : "bg-gray-800 text-gray-100"}`}>
              {msg.text.replace(/\*/g, "")}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm animate-pulse">Typing...</div>
          </div>
        )}
      </div>

      {!started && introSpoken && (
        <button onClick={startInterview} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
          Start Interview
        </button>
      )}

      {started && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <SpeechRecorder onTranscript={handleTranscript} />
          {current < questions.length - 1 ? (
            <button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Next Question</button>
          ) : (
            <button onClick={handleFinishInterview} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Finish Interview</button>
          )}
        </div>
      )}

      {showWarningDialog && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-black text-white border-4 border-white p-6 rounded-lg shadow-lg max-w-md text-center">
      <h2 className="text-2xl font-semibold text-red-700">⚠️ Warning</h2>

      {/* Show different message based on proxyWarnings value */}
      {proxyWarnings === 1 ? (
        <p>Multiple people were detected in the frame. Please make sure you're alone. The next time, your interview will end.</p>
      ) : (
        <p>Please answer the current question before proceeding.</p>
      )}

      <button
        className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        onClick={() => setShowWarningDialog(false)}
      >
        Okay
      </button>
    </div>
  </div>
)}


      

      {showExitDialog && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-black text-white border border-red-500 p-6 rounded-xl max-w-md">
            <h2 className="text-xl font-bold text-red-500">⚠️ Fullscreen Exit Detected</h2>
            <p>Please stay in full screen. Exiting full screen 3 times will fail the interview.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 rounded" onClick={() => {
  setShowExitDialog(false);
  document.documentElement.requestFullscreen?.();
}}
>Continue</button>
          </div>
        </div>
      )}

      {showTabDialog && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-black text-white border border-yellow-500 p-6 rounded-xl max-w-md">
            <h2 className="text-xl font-bold text-yellow-400">⚠️ Tab Switch Detected</h2>
            <p>Switching tabs or minimizing is not allowed. 3 attempts will cancel your interview.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 rounded" onClick={() => setShowTabDialog(false)}>Got it</button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-400 mt-2">
        Question {current + 1} of {questions.length}
      </div>

      <button onClick={() => setShowReportDialog(true)} className="fixed text-sm text-white w-40 mb-2 bottom-0 right-0 mr-2 rounded-2xl bg-blue-500 p-2 hover:bg-blue-600 transition">
        🚩 Report
      </button>
    </div>
  );
}
