"use client";

import { AuroraText } from "@/components/magicui/aurora-text";
import { Dock } from "@/components/magicui/dock";
import { Modal, ModalTrigger } from "@/components/ui/animated-modal";
import { DockIcon, HomeIcon, SearchIcon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import NavBar from "./components/NavBar";
import { useAuth } from "./lib/useAuth";
import Footer from "./components/Footer";

export default function Home() {
  const user = useAuth();
  const router = useRouter();
  
  return (
    <>
    <NavBar />
    <main className="relative min-h-screen flex items-center justify-center bg-black text-white">
  {/* Background Blur Layer */}
  <div className="absolute inset-0 z-0 bg-blue-500 bg-[size:20px_20px] opacity-20 blur-[100px]" />

  {/* Left Side: Iframe */}
  <div className="flex-1 flex justify-center items-center p-8 z-10">
    <iframe
      src="https://lottie.host/embed/7785093d-48aa-4408-aaf6-d67b07957c70/6FVLh9VVTr.lottie"
      title="SmartMeet Demo"
      className="w-full max-w-5xl h-[500px] rounded-xl shadow-lg"
    />
  </div>

  {/* Right Side: Content and Button */}
  <div className="flex-1 flex flex-col justify-center items-start p-8 z-10">
    <h1 className="text-[5.5rem] font-bold mb-4 text-white tracking-tighter">
      Welcome to <AuroraText>SmartMeet</AuroraText>
    </h1>
    <p className="text-lg mb-6 text-gray-300">
      Your AI-powered mock interview portal. Practice, improve, and ace your next interview with SmartMeet.
    </p>

    <Modal>
      <ModalTrigger className="relative flex items-center justify-center w-48 h-16 group">
        <span className="absolute left-0 flex items-start justify-center transition-transform duration-500 group-hover:translate-x-40 text-3xl text-white">
          → 🤖
        </span>
        <div className="absolute left-0 right-0 mx-auto flex items-center justify-center transition-transform duration-500 -translate-x-40 group-hover:translate-x-0 w-full h-full">
          <button
            onClick={() => router.push(user ? "/upload" : "/login")}
            className="px-6 py-3 text-lg hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 w-full"
          >
            Get Started ➡️
          </button>
        </div>
      </ModalTrigger>
    </Modal>
  </div>
</main>

    <Footer/>
    </>
  );
}
