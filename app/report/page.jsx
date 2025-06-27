'use client';
import React, { useState } from 'react'
import { useAuth } from '../lib/useAuth';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Report() {
    const user = useAuth();
     const [issueType, setIssueType] = useState("");
       const [issueDescription, setIssueDescription] = useState("");
       const [contactNumber, setContactNumber] = useState("");
     const handleSubmitReport = async () => {
  if (!issueType || !issueDescription || !contactNumber) {
    alert("⚠️ Please fill in all fields before submitting.");
    return;
  }

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
      setIssueType("");
      setIssueDescription("");
      setContactNumber("");
    } else {
      const err = await res.text();
      console.error("❌ API response:", err);
      alert("❌ Failed to report the issue. Server error.");
    }
  } catch (error) {
    console.error("❌ Report error:", error);
    alert("⚠️ Something went wrong while reporting.");
  }
};
  return (
    <>
    <NavBar/>
   <div className="p-24 flex items-center justify-center bg-black bg-opacity-80">
    <div className="bg-black border-4 border-white text-black rounded-xl shadow-xl w-[90%] max-w-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center text-white">📝 Report Issue</h2>
      
     <label className="block">
  <span className="text-sm font-medium text-gray-300">Issue Type</span>
  <select
    value={issueType}
    onChange={(e) => setIssueType(e.target.value)}
    className="w-full mt-1 p-2 border border-gray-300 bg-black rounded text-white"
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
        <span className="text-sm font-medium text-gray-300">Issue Description</span>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded text-white"
          rows={3}
          placeholder="Describe your issue..."
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-300">Contact Number</span>
        <input
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded text-white"
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
  <Footer/>
  </>
  )
}
