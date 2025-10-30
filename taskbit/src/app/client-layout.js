"use client";

import { AuthProvider } from "@/context/auth.context";
import AuthGuard from "@/components/AuthGuard";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}