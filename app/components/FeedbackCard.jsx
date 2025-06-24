"use client";
import React from "react";

const FeedbackCard = ({ feedback }) => {
  return (
    <div className="bg-purple-800 text-white p-4 mt-6 rounded-md w-full max-w-2xl mx-auto">
      <h3 className="text-lg font-bold mb-2">Feedback</h3>
      <p>{feedback}</p>
    </div>
  );
};

export default FeedbackCard;
