import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCt6sYCbdcjO15OaPX4Xib2jq5zzuzJLr8",
  authDomain: "smartmeet-2cf6b.firebaseapp.com",
  projectId: "smartmeet-2cf6b",
  storageBucket: "smartmeet-2cf6b.firebasestorage.app",
  messagingSenderId: "839469982588",
  appId: "1:839469982588:web:cd80375e82437ab478baf9",
  measurementId: "G-G68LF453TB"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { app, auth };