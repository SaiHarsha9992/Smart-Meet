"use client";
import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase'; // ✅ import safe auth
import NavBar from '../components/NavBar';
import { useAuth } from '../lib/useAuth';

const provider = new GoogleAuthProvider();

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
     const user = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/upload');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            router.push('/upload');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <>
        <NavBar/>
        <div className="min-h-screen flex items-center justify-center bg-black">

            <form
                onSubmit={handleLogin}
                className="bg-[#18181b] p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>
                {error && (
                    <div className="mb-4 text-red-400 text-sm text-center">{error}</div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="w-full px-3 py-2 rounded bg-[#27272a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="w-full px-3 py-2 rounded bg-[#27272a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50 mb-4"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <g>
                            <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.2 3.23l6.9-6.9C36.68 2.36 30.7 0 24 0 14.82 0 6.71 5.48 2.69 13.44l8.06 6.26C12.47 13.19 17.74 9.5 24 9.5z"/>
                            <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.91-2.17 5.38-4.62 7.04l7.13 5.55C43.98 37.07 46.1 31.36 46.1 24.55z"/>
                            <path fill="#FBBC05" d="M10.75 28.19c-1.13-3.37-1.13-7.01 0-10.38l-8.06-6.26C.86 15.47 0 19.62 0 24c0 4.38.86 8.53 2.69 12.45l8.06-6.26z"/>
                            <path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.83-6.03l-7.13-5.55c-2.01 1.35-4.59 2.15-7.7 2.15-6.26 0-11.53-3.69-13.25-8.95l-8.06 6.26C6.71 42.52 14.82 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                        </g>
                    </svg>
                    {loading ? 'Please wait...' : 'Sign in with Google'}
                </button>
            </form>
        </div>
        </>
    );
}