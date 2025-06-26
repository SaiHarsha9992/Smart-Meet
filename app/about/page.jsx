"use client";

import { AuroraText } from "@/components/magicui/aurora-text";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main className="relative min-h-screen flex items-center justify-center bg-black text-white">
        {/* Background Blur Layer */}
        <div className="absolute inset-0 z-0 bg-blue-500 bg-[size:20px_20px] opacity-20 blur-[100px]" />

        <div className="z-10 max-w-4xl px-8 text-center">
          <h1 className="text-[4rem] font-bold mb-4">
            About <AuroraText>SmartMeet</AuroraText>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            SmartMeet is an AI-powered mock interview platform designed to simulate real interview experiences using voice input, facial recognition, and personalized questions based on your skills.
            <br /><br />
            Our mission is to help students and professionals gain confidence, improve their communication and problem-solving skills, and be better prepared for real-world interviews — all in an interactive and intelligent way.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
