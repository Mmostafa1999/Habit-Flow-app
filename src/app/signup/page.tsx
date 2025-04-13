"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/firebase/firebaseUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSigninButton from "@/components/common/GoogleSigninButton";
import Header from "@/components/common/Header";
import PageTransition from "@/components/common/PageTransition";
import LoadingScreen from "@/components/common/LoadingScreen";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/firebase/firebase';
import { FirebaseError } from "firebase/app";
import usePageLoading from "@/lib/hooks/usePageLoading";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { initialLoading, withLoading, isLoading } = usePageLoading();
    const router = useRouter();

    useEffect(() => {
        // Code already managed by usePageLoading hook
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await withLoading(async () => {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                toast.success("Account created! Please verify your email.");
                router.push("/verify-email");
            });
        } catch (error) {
            const errorMessage = getErrorMessage(error as FirebaseError);
            toast.error(errorMessage);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await withLoading(async () => {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                toast.success("Google sign-in successful!");
                router.push("/dashboard");
            });
        } catch (error) {
            const errorMessage = getErrorMessage(error as FirebaseError);
            toast.error(errorMessage);
        }
    };

    if (initialLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-[#f8f9ef] flex flex-col">
            <Header variant="auth" title="Habit Tracker" />
            <PageTransition>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
                        <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>
                        <p className="text-center text-gray-600 mb-6">Sign up to start tracking your habits</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 mb-2">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#E50046] text-white p-3 rounded font-medium hover:bg-[#d81b60] transition-all duration-300 transform hover:scale-[1.02] disabled:bg-pink-300 disabled:transform-none"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Sign up"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 my-4">Or continue with</p>

                            <GoogleSigninButton
                                onClick={handleGoogleSignup}
                            />
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link href="/" className="text-primary hover:underline transition-colors duration-300">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </div>
    );
} 