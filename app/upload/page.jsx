'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractTextFromPDF, parseResumeSkills } from '@/app/utils/parseResume';
import NavBar from '../components/NavBar';
import { useAuth } from '../lib/useAuth';
import { useInterview } from '../context/InterviewContext';
import Footer from '../components/Footer';

export default function Upload() {
  const {
  setSkills: setCtxSkills,
  setExperience: setCtxExperience,
  setCandidateName
} = useInterview();

  const [skills, setSkills] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [experience, setExperience] = useState("");
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [ats, setAts] = useState(null);
  const user = useAuth();
// ✅ Updated redirect logic
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user]);

  // ⛔ Don't render anything while checking auth
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

  const handleClick = () => fileInputRef.current?.click();

const handleFileChange = async (e) => {
  const newFiles = Array.from(e.target.files || []);
  if (!newFiles.length) return;

  setFiles(newFiles);
  setLoading(true);
  setError("");
  setSkills([]);

  try {
    const text = await extractTextFromPDF(newFiles[0]);

    const res = await fetch("/api/geminipdf", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ text }),
});

const data = await res.json();
if (Array.isArray(data.skills)) {
  setSkills(data.skills);
  setAts(data.ats);  // 💡 Store ATS result
} else {
  setError("Failed to extract skills using Gemini.");
}

  } catch (err) {
    console.error("Skill extraction error:", err);
    setError("Failed to extract skills.");
  } finally {
    setLoading(false);
  }
};



const handleContinue = () => {
  setCtxSkills(skills);
  setCtxExperience(experience);
  setCandidateName(user?.displayName || "Candidate");
  router.push('/interview');
};


  return (
    <>
    <NavBar />
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10">
  {/* Background Blur Layer */}
  <div className="absolute inset-0 z-0 bg-blue-500 bg-[size:20px_20px] opacity-20 blur-[100px]" />
      <h1 className="text-4xl font-bold text-white mb-6 z-10">Upload Your Resume</h1>
    
    
    <div className='flex flex-col w-full items-center justify-center gap-8 z-10 '>
      <div
        className="w-full max-w-lg border-2 border-dashed border-gray-400 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-900 transition z-10"
        onClick={handleClick}
      >
        <p className="text-white text-lg mb-2">Click to upload your resume</p>
        <p className="text-gray-400 text-sm">Accepted: .txt, .pdf (plain text only)</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
       {files.length > 0 && (
        <p className="text-white text-center">{files[0].name}</p>
      )}
     {ats && (
  <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg w-[600px]">
    <h3 className="text-lg font-semibold text-white mb-2">ATS Resume Score</h3>
    <p
      className={`font-bold text-4xl ${
        ats.score < 35 ? "text-red-500" : "text-green-400"
      }`}
    >
      {ats.score}/100
    </p>

    <p className="text-gray-300 mt-1 text-[12px]">{ats.reason}</p>

    <p className="text-gray-400 pt-2 text-[11px]">
      Note: This ATS Score is given by Gemini, It is giving by text baseed only.
    </p>
  </div>
)}

    </div>
      
      

     

      {loading && <p className="text-yellow-400 mt-4">Extracting skills...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {!loading && skills.length > 0 && (
        <div className="mt-8 text-white w-full max-w-xl z-10">
          <h2 className="text-xl font-semibold mb-2">Extracted Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="bg-sky-700 px-3 py-1 rounded-full text-sm">{s}</span>
            ))}
          </div>


          <div className="mt-4">
            <label className="block text-white mb-1">Experience Level:</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
            >
              <option value="">-- Select --</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <button
  onClick={handleContinue}
  disabled={!experience}
  className={`mt-6 w-full py-2 rounded-lg font-semibold ${
    !experience ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
  } text-white transition`}
>
  Start Mock Interview
</button>

        </div>
        
      )}

      {!loading && files.length > 0 && skills.length === 0 && (
        <p className="text-gray-400 mt-4">No skills found in the uploaded file.</p>
      )}

      


    </div>
    <Footer/>
    </>
  );
}
