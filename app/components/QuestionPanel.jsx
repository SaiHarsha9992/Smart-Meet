"use client";
import React from "react";

const QuestionPanel = ({ question, onNext }) => {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Interview Question</h2>
      <p className="text-lg mb-6">{question}</p>
      <button
        onClick={onNext}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Next Question
      </button>
    </div>
  );
};

export default QuestionPanel;
