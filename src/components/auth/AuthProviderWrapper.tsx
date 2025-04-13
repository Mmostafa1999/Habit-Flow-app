"use client";

import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures ToastContainer renders only on the client
  }, []);

  return (
    <AuthProvider>
      {children}
      {isClient && <ToastContainer position="top-right" autoClose={5000} />}
    </AuthProvider>
  );
}