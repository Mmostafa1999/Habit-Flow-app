// lib/context/AuthContext.ts
"use client"; // Must be a client component

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { auth } from '../firebase/firebase';
import { useRouter } from "next/navigation";

// Session timeout in minutes - forces re-authentication after inactivity
const SESSION_TIMEOUT_MINUTES = 60;

/**
 * AuthContext now provides user state, authentication status,
 * and session management with timeout.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => void; // Added to manually refresh the session timeout
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => { },
  refreshSession: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Function to handle session timeout
  const setupSessionTimeout = () => {
    // Clear any existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Set a new timeout
    const timeout = setTimeout(() => {
      // Force logout after session timeout
      if (user) {
        logout();
        router.push("/?timeout=1"); // Indicate timeout in URL for UI feedback
      }
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);

    setSessionTimeout(timeout);
  };

  // Function to manually refresh the session
  const refreshSession = () => {
    if (user) {
      setupSessionTimeout();
    }
  };

  useEffect(() => {
    // Set session persistence for added security
    setPersistence(auth, browserSessionPersistence).catch(error => {
      console.error("Error setting auth persistence", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Set up session timeout if user is logged in
      if (user) {
        setupSessionTimeout();
      }

      // Client-only redirect to avoid SSR mismatches
      if (typeof window !== "undefined") {
        // If user exists but is not verified and not already on the verify-email page, redirect them there
        if (user && user.emailVerified === false && window.location.pathname !== "/verify-email") {
          router.push("/verify-email");
        }
        // If the user is on the verify-email page but is already verified, redirect to dashboard
        else if (user && user.emailVerified === true && window.location.pathname === "/verify-email") {
          router.push("/dashboard");
        }
      }
    });

    // Add activity listeners to refresh the session timeout
    if (typeof window !== "undefined") {
      const refreshOnActivity = () => refreshSession();
      window.addEventListener("mousemove", refreshOnActivity);
      window.addEventListener("keydown", refreshOnActivity);
      window.addEventListener("click", refreshOnActivity);
      window.addEventListener("scroll", refreshOnActivity);

      return () => {
        window.removeEventListener("mousemove", refreshOnActivity);
        window.removeEventListener("keydown", refreshOnActivity);
        window.removeEventListener("click", refreshOnActivity);
        window.removeEventListener("scroll", refreshOnActivity);
        unsubscribe();
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
        }
      };
    }

    return () => {
      unsubscribe();
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [router]);

  const logout = async () => {
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }

    // Call signOut and navigate to home page
    await signOut(auth);
    router.push("/");
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children} {/* Prevent rendering until auth state is known */}
    </AuthContext.Provider>
  );
};