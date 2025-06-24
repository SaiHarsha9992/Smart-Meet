// context/InterviewContext.js
'use client';
import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext();

export function InterviewProvider({ children }) {
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [mockResult, setMockResult] = useState(null);
  return (
    <InterviewContext.Provider value={{
      skills,
      setSkills,
      experience,
      setExperience,
      candidateName,
      setCandidateName,
      mockResult,
      setMockResult
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterview = () => useContext(InterviewContext);
