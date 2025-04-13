"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { getErrorMessage } from "@/lib/firebase/firebaseUtils";
import PageTransition from "@/components/common/PageTransition";
import Header from "@/components/common/Header";
import LoadingScreen from "@/components/common/LoadingScreen";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '@/lib/firebase/firebase';
import { FirebaseError } from "firebase/app";
import usePageLoading from "@/lib/hooks/usePageLoading";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { initialLoading, withLoading, isLoading } = usePageLoading();

    useEffect(() => {
        // Code already managed by usePageLoading hook
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        try {
            
            await withLoading(async () => {
                await sendPasswordResetEmail(auth, email);
                setIsSubmitted(true);
                toast.success("Password reset email sent. Please check your inbox.");
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

                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                        {isSubmitted ? (
                            <div className="text-center">
                                <svg
                                    className="w-16 h-16 mx-auto text-primary mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                                <p className="text-gray-600 mb-6">
                                    We&apos;ve sent a password reset link to:{" "}
                                    <span className="font-medium">{email}</span>
                                </p>
                                <p className="mb-6 text-gray-600">
                                    Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
                                </p>
                                <Link
                                    href="/"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Return to login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-center mb-2">Reset your password</h1>
                                <p className="text-center text-gray-600 mb-6">
                                    Enter your email address and we&apos;ll send you a link to reset your password
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
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
                                                className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                suppressHydrationWarning
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[#E50046] text-white p-3 rounded font-medium hover:bg-[#d81b60] transition-colors duration-200 disabled:bg-pink-300 mb-4"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Sending..." : "Send reset link"}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <Link href="/" className="text-primary hover:underline">
                                        Back to login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </PageTransition>
        </div>
    );
} 