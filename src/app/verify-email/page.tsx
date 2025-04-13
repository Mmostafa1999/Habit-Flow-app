"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import PageTransition from "@/components/common/PageTransition";
import LoadingScreen from "@/components/common/LoadingScreen";
import { sendEmailVerification } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import usePageLoading from "@/lib/hooks/usePageLoading";
import { getErrorMessage } from "@/lib/firebase/firebaseUtils";

export default function VerifyEmailPage() {
    const { user } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const { initialLoading, withLoading } = usePageLoading();
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Code already managed by usePageLoading hook
    }, []);

    useEffect(() => {
        // If no user, redirect to home
        if (!user) {
            router.push("/");
            return;
        }

        // If user is already verified, redirect to dashboard
        if (user.emailVerified) {
            toast.success("Email verified successfully!");
            router.push("/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const resendVerification = async () => {
        if (!user) return;

        try {
            await withLoading(async () => {
                setIsResending(true);
                await sendEmailVerification(user);
                setCountdown(60); // 1 minute cooldown
                toast.success("Verification email resent! Please check your inbox.");
            });
        } catch (error) {
            const errorMessage = getErrorMessage(error as FirebaseError);
            toast.error(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (initialLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-[#f8f9ef] flex flex-col">
            <Header variant="auth" title="Habit Tracker" />
            <PageTransition>

                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
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

                        <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
                        <p className="text-gray-600 mb-6">
                            We&apos;ve sent a verification email to:{" "}
                            <span className="font-medium">{user.email}</span>
                        </p>

                        <p className="mb-6 text-gray-600">
                            Please check your inbox and click the verification link to complete your registration.
                        </p>

                        <button
                            onClick={resendVerification}
                            className="w-full bg-[#E50046] text-white p-3 rounded font-medium hover:bg-[#d81b60] transition-colors duration-200 disabled:bg-pink-300 mb-4"
                            disabled={isResending || countdown > 0}
                        >
                            {isResending
                                ? "Sending..."
                                : countdown > 0
                                    ? `Resend email (${countdown}s)`
                                    : "Resend verification email"}
                        </button>

                        <p className="text-gray-600">
                            Already verified your email?{" "}
                            <Link href="/" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </PageTransition>
        </div>
    );
} 