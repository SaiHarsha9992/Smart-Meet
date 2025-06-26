"use client";
import { useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { useAuth } from "@/app/lib/useAuth";
import { AuroraText } from "@/components/magicui/aurora-text";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="w-full flex justify-between items-center p-4 bg-black shadow-md relative">
      <a href="/"><h1 className="font-bold text-white text-4xl">Smart<AuroraText>Meet</AuroraText></h1></a>

      {!user ? (
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Login
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Image
              src={user?.photoURL || "/default-profile.png"}
              alt="Profile"
              width={56}
              height={56}
              className="rounded-full border-2 border-gray-300"
              unoptimized
            />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-black border border-white rounded-lg shadow-lg z-50">
              <div className="flex flex-col items-center p-4">
                <Image
                  src={user?.photoURL || "/default-profile.png"}
                  alt="Profile"
                  width={72}
                  height={72}
                  className="rounded-full mb-2"
                  unoptimized
                />
                <span className="font-semibold text-lg text-white">{user.displayName}</span>
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
              <div className="border-t px-4 py-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition mb-2"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
