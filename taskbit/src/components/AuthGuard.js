"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.context";

const publicRoutes = ["/login", "/", "/register"];

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Si la ruta es pública, redirigir al dashboard si está autenticado
      if (publicRoutes.includes(pathname) && isAuthenticated) {
        router.replace("/dashboard");
        return;
      }
      
      // Si la ruta es privada y no está autenticado, redirigir al login
      if (!publicRoutes.includes(pathname) && !isAuthenticated) {
        router.replace("/login");
        return;
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  // No mostrar nada mientras verifica autenticación
  if (loading) {
    return null;
  }

  return children;
}