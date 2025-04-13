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
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/firebase/firebase';
import { FirebaseError } from "firebase/app";
import usePageLoading from "@/lib/hooks/usePageLoading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { initialLoading, withLoading, isLoading } = usePageLoading();
  const router = useRouter();

  useEffect(() => {
    // Code already managed by usePageLoading hook
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await withLoading(async () => {
        await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (auth.currentUser?.emailVerified) {
          toast.success("Login successful!");
          // Add a small delay before navigation to allow the toast to be visible
          setTimeout(() => {
            router.push("/dashboard");
          }, 300);
        } else {
          toast.info("Please verify your email to continue.");
          setTimeout(() => {
            router.push("/verify-email");
          }, 300);
        }
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error as FirebaseError);
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      await withLoading(async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        toast.success("Login successful!");
        // Add a small delay before navigation to allow the toast to be visible
        setTimeout(() => {
          router.push("/dashboard");
        }, 300);
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error as FirebaseError);
      toast.error(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f8f9ef] flex flex-col">
        <Header variant="auth" title="Habit Tracker" />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
            <p className="text-center text-gray-600 mb-6">Sign in to your account to continue</p>

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

              <div className="mb-6 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary hover:underline text-sm transition-colors duration-300"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E50046] text-white p-3 rounded font-medium hover:bg-[#d81b60] transition-all duration-300 transform hover:scale-[1.02] disabled:bg-pink-300 disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 my-4">Or continue with</p>

              <GoogleSigninButton
                onClick={handleGoogleSignin}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline transition-colors duration-300">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
