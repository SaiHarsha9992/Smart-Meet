"use client";

import React, { useState, useEffect } from "react";
import { askGemini } from "@/app/lib/gemini";
import { speak } from "@/app/lib/tts";
import SpeechRecorder from "@/app/components/SpeechRecorder";
import Camera from "../components/Camera";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import { useAuth } from "../lib/useAuth";
import { FaFlag } from "react-icons/fa6";
import { useInterview } from "../context/InterviewContext";

export default function InterviewPage() {
  const router = useRouter();
  const user = useAuth();
  const { setMockResult, setCandidateName, mockResult } = useInterview();
  const { skills, experience } = useInterview();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const userName = user?.displayName || "Student";
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");



console.log("InterviewPage rendered with skills:", skills, "and experience:", experience);
  useEffect(() => {
    const explainInterview = async () => {
  if (!skills.length || !experience) {
    setTimeout(() => {
      router.push("/"); // Redirect to upload page
    }, 2000); // 2 second delay for smooth UX
  }

      const prompt = `Give a short and friendly explanation for a mock interview for a student named ${userName}, who is learning ${skills.join(", ")} with experience level: ${experience}. Include what type of roles ${userName} can get and how this mock will help. Also, generate only 5 short and simple interview questions relevant to these skills.`;
      const intro = await askGemini(prompt);
      setMessages([{ role: "ai", text: intro }]);
      speak(intro);
      setIntroSpoken(true);
    };
    explainInterview();
  }, [skills, experience]);

  if (user == null || user === undefined || !user) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <p className="text-lg font-medium">No Account, No Interview 😉</p>
    </div>
  );
}
  if (!skills.length || !experience) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <p className="text-lg font-medium">Skills not found. Redirecting to upload page...</p>
    </div>
  );
}

useEffect(() => {
  if (user === null) {
    router.push("/login");
  }
}, [user]);

if (user === undefined) {
  return <div className="text-white text-center p-6">Checking login...</div>;
}

// useEffect(() => {
//   if (!skills.length || !experience) {
//     router.push("/"); // Redirect to upload if data is missing
//   }
// }, [skills, experience]);
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
    moveToNext();
  };

  const moveToNext = () => {
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
  const userAnswers = messages
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.text)
    .join("\n");

  const unansweredCount = answered.filter((ans) => !ans).length;

  const prompt = `
You are an AI interviewer. Based on the student's answers below, give a performance review with scores out of 10 for:

- communication
- problem solving
- technical skills
- confidence
- time management
- overall (average)

Verdict: "Passed" or "Failed".
Remark: short and kind.

Skipped ${unansweredCount} out of ${questions.length} questions.

Answers:
${userAnswers}
`;

  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const result = await res.json();
    setMockResult(result);
    setCandidateName(userName);

    const getRemark = () => {
      const line = result?.text?.split("\n").find((line) =>
        line.toLowerCase().includes("remark")
      );
      return line ? line.replace(/[*_]*remark[:]*[*_]*/i, "").trim() : "No remarks.";
    };

    const getResult = () => {
      const line = result?.text?.split("\n").find((line) =>
        line.toLowerCase().includes("verdict")
      );
      return line?.toLowerCase().includes("pass") ? true : false;
    };

    const reportData = {
      candidate: user?.displayName || "Unknown Candidate",
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      feedback: {
        communication: result?.feedback?.communication || 0,
        problemSolving: result?.feedback?.problemSolving || 0,
        technicalSkills: result?.feedback?.technicalSkills || 0,
        confidence: result?.feedback?.confidence || 0,
        timeManagement: result?.feedback?.timeManagement || 0,
        overall: result?.feedback?.overall || 0,
      },
      result: getResult(),
      remarks: getRemark(),
      status: getResult() ? "Passed" : "Failed",
    };

    // Removed Lambda submission
    router.push("/result");
  } catch (err) {
    console.error("❌ Failed to evaluate report:", err);
    alert("Something went wrong during evaluation.");
  }
};



useEffect(() => {
  const handleFullscreenExit = () => {
    if (!document.fullscreenElement && started) {
      setWarnings((prev) => {
        const updated = prev + 1;

        if (updated >= 3) {
          const result = {
            candidate: userName,
            date: new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
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
            questions: [], // ✅ Prevents .join crash on /result
          };

          setMockResult(result);
          setCandidateName(userName); // for display on result
          speak("Interview canceled. Proxy or manipulation detected.");
          setStarted(false);
         speak("Interview canceled. Proxy or manipulation detected.");
setStarted(false);
setTimeout(() => {
  router.push("/result");
}, 0); // ✅ defers to next tick

          return 0;
        } else {
          setShowExitDialog(true); // show warning modal
          return updated;
        }
      });
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenExit);
  return () => document.removeEventListener("fullscreenchange", handleFullscreenExit);
}, [started, userName, router]);



  if (user === undefined) return <div className="text-white text-center p-6">Checking login...</div>;
  if (user === null) {
    router.push("/login");
    return null;
  }

 const handleSubmitReport = async () => {
  try {
    const res = await fetch("https://9xbddx8l07.execute-api.eu-north-1.amazonaws.com/prod/report-issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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



  return (
    <>
      
      <div className="relative min-h-screen bg-black text-white p-6 flex flex-col items-center">
        <NavBar className="relative top-0"/>
        <h1 className="text-3xl font-bold mb-2 text-center">🧠 AI Mock Interview</h1>

        <div className="fixed bottom-4 left-4 z-50 border border-gray-600 rounded-lg overflow-hidden">
          <Camera className="w-full h-full object-cover" />
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
            {current < questions.length - 1 && (
              <button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                Next Question
              </button>
            )}
            {current >= questions.length - 1 && (
              <button onClick={handleFinishInterview} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
                Finish Interview
              </button>
            )}
           
          </div>
        )}

        {/* Skipped answer warning dialog */}
        {showWarningDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white text-black rounded-xl shadow-lg p-6 w-80 text-center">
              <h2 className="text-lg font-semibold mb-4">⚠️ Warning</h2>
              <p className="mb-4">You didn’t answer the current question. This will affect your score. Are you sure you want to continue?</p>
              <div className="flex justify-around">
                <button onClick={() => setShowWarningDialog(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                <button onClick={() => { setShowWarningDialog(false); moveToNext(); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Exit Warning Dialog */}
        {showExitDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
    <div className="bg-white text-black rounded-xl shadow-lg p-6 w-96 text-center">
      <h2 className="text-lg font-semibold mb-4">⚠️ Fullscreen Warning {warnings}/3</h2>
      <p className="mb-4">You exited fullscreen. Please stay in fullscreen mode during the interview. After 3 exits, the test will be canceled.</p>
      <button
        onClick={async () => {
          setShowExitDialog(false);
          await document.documentElement.requestFullscreen(); // Re-enter fullscreen
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Resume Interview
      </button>
    </div>
  </div>
)}

{showReportDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
    <div className="bg-white text-black rounded-xl shadow-xl w-[90%] max-w-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">📝 Report Issue</h2>
      
     <label className="block">
  <span className="text-sm font-medium">Issue Type</span>
  <select
    value={issueType}
    onChange={(e) => setIssueType(e.target.value)}
    className="w-full mt-1 p-2 border border-gray-300 rounded"
  >
    <option value="">Select Issue</option>
    <option value="Resume Upload">Resume Upload</option>
    <option value="Job Role Selection">Job Role Selection</option>
    <option value="Interview Interface">Interview Interface</option>
    <option value="Camera/Mic Issue">Camera/Mic Issue</option>
    <option value="Question/Answer Issue">Question/Answer Issue</option>
    <option value="Submission Error">Submission Error</option>
    <option value="Feedback Error">Feedback Error</option>
  </select>
</label>


      <label className="block">
        <span className="text-sm font-medium">Issue Description</span>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          rows={3}
          placeholder="Describe your issue..."
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Contact Number</span>
        <input
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          placeholder="9876543210"
        />
      </label>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowReportDialog(false)}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

       <div className="text-sm text-gray-400 mt-2">
            Question {current + 1} of {questions.length}
        </div>
        <button onClick={() => setShowReportDialog(true)}
 className="fixed text-sm text-white w-40 mb-2 bottom-0 right-0 mr-2 rounded-2xl bg-blue-500 p-2 hover:bg-blue-600 transition">
          🚩 Report
        </button>


      </div>
      
    </>
  );
}
