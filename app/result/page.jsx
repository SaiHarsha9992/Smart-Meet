"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "../lib/useAuth";
import { useRouter } from "next/navigation";
import domtoimage from 'dom-to-image-more';
import NavBar from "../components/NavBar";
import { FiArrowDown } from "react-icons/fi";
import { AuroraText } from "@/components/magicui/aurora-text";
import { useInterview } from "../context/InterviewContext";

export default function MockInterviewReport() {
  const [report, setReport] = useState(null);
  const user = useAuth();
  const router = useRouter();
  const reportRef = useRef(null); // ← ref to the report section
  const { mockResult, candidateName } = useInterview();
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user]);
console.log("Mock Result:", mockResult);
 useEffect(() => {
  try {
    const data = mockResult;
    if (!data) throw new Error("No mock result");

   const getScore = (label) => {
  const line = data.questions.find(q => q.startsWith(`**${label}:`));
  return line ? parseFloat(line.match(/(\d+(\.\d+)?)/)?.[0] || "0") : 0;
};

const getRemark = () => {
  const line = data.questions.find(q => q.startsWith("**Remark:**"));
  return line ? line.replace("**Remark:**", "").trim() : "No remarks.";
};

const getResult = () => {
  const line = data.questions.find(q => q.startsWith("**Verdict:**"));
  return line?.includes("Passed") ? true : false;
};

const reportData = {
  candidate: candidateName || user?.displayName || "Unknown Candidate",
  date: new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  feedback: {
    communication: getScore("Communication"),
    problemSolving: getScore("Problem Solving"),
    technicalSkills: getScore("Technical Skills"),
    confidence: getScore("Confidence"),
    timeManagement: getScore("Time Management"),
    overall: getScore("Overall"),
  },
  result: getResult(),
  remarks: getRemark(),
  status: getResult() ? "Passed" : "Failed",
};

setReport(reportData);
console.log(reportData);
  } catch (err) {
    console.error("Error loading mock_result:", err);
    setReport({
      candidate: "Unknown",
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
      remarks: "❌ Report data missing or invalid.",
      status: "Failed",
    });
  }
}, []);



 const handleDownload = async () => {
  if (!reportRef.current) return;

  await new Promise((resolve) => {
  const img = document.querySelector("img");
  if (!img || img.complete) return resolve();
  img.onload = img.onerror = resolve;
});


  // Now take the snapshot
  domtoimage.toPng(reportRef.current)
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `${report?.candidate}_SmartMeet_Report.png`;
      link.href = dataUrl;
      link.click();
    })
    .catch((error) => {
      console.error("Error generating image:", error);
    });
};



  if (!report) return <div className="text-white text-center p-8">Loading report...</div>;

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl relative">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full shadow-md text-lg font-medium"
        >
          <FiArrowDown/>
        </button>

        {/* Report Content */}
        <div
          className="border-2 border-white rounded-2xl shadow-lg p-8 download-report"
          ref={reportRef}
        >
          <h2 className="text-3xl font-bold mb-2 text-center">Mock Interview <AuroraText>Report</AuroraText> </h2>
          <p className="text-lg text-center text-gray-400 mb-6">Date: {report.date}</p>

          <div className="mb-4">
            <p className="text-lg font-medium">
              Candidate Name:{" "}
              <span className={`font-semibold text-2xl ${report.result ? "text-green-400" : "text-red-400"}`}>
                {report.candidate}
              </span>
            </p>
          </div>

          <img
  src={user?.photoURL}
  alt="Candidate"
  className="h-[100px] w-[100px] mb-6 mx-auto rounded-full object-cover"
/>

          <div className="grid grid-cols-2 gap-4 text-sm md:text-base mb-6">
            <p>🗣️ Communication: <span className="font-semibold">{report.feedback.communication}/10</span></p>
            <p>💡 Problem Solving: <span className="font-semibold">{report.feedback.problemSolving}/10</span></p>
            <p>💻 Technical Skills: <span className="font-semibold">{report.feedback.technicalSkills}/10</span></p>
            <p>🎯 Confidence: <span className="font-semibold">{report.feedback.confidence}/10</span></p>
            <p>📊 Overall Score: <span className="font-semibold">{report.feedback.overall}/10</span></p>
            <p>⏱️ Time Management: <span className="font-semibold">{report.feedback.timeManagement}/10</span></p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1">💬 Remarks:</h3>
            <p className="text-gray-300">{report.remarks}</p>
          </div>

          <div className="flex items-center justify-center text-2xl">
            <p>Status:{" "}
              <span className={`font-semibold text-2xl ${report.result ? "text-green-400" : "text-red-400"}`}>
                {report.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
