"use client";

import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
export default function ContactPage() {
  return (
    <>
      <NavBar />
      <main className="relative min-h-screen flex items-center justify-center bg-black text-white">
        {/* Background Blur Layer */}
        <div className="absolute inset-0 z-0 bg-blue-500 bg-[size:20px_20px] opacity-20 blur-[100px]" />

        <div className="z-10 max-w-2xl w-full p-8 text-center">
          <h1 className="text-[3rem] font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-300 mb-6">
            Have questions, feedback, or issues with SmartMeet? Reach out to us!
          </p>

          <div className="text-left space-y-4 text-white">
            <div>
              <h2 className="font-semibold text-xl">Email:</h2>
              <p className="text-gray-300">support@smartmeet.ai</p>
            </div>
            <div>
              <h2 className="font-semibold text-xl">Phone:</h2>
              <p className="text-gray-300">+91 98765 43210</p>
            </div>
            <div>
              <h2 className="font-semibold text-xl">Address:</h2>
              <p className="text-gray-300">
                SmartMeet AI Labs, <br />
                Laxmi Theatre Road, Mandapeta, <br />
                Andhra Pradesh, India – 533308
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
