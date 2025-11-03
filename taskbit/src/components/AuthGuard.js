"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.context";

const publicRoutes = ["/login", "/", "/register", "/forgot-password", "/reset-password"];

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Si la ruta es pública, redirigir al dashboard si está autenticado
      if (publicRoutes.includes(pathname) && isAuthenticated) {
        router.replace("/dashboard");
        return;
      }
      
      // Si la ruta es privada y no está autenticado, mostrar mensaje y redirigir
      if (!publicRoutes.includes(pathname) && !isAuthenticated) {
        setShowMessage(true);
        // Mostrar mensaje por 2 segundos antes de redirigir
        const timer = setTimeout(() => {
          router.replace("/login");
        }, 2000);
        
        return () => clearTimeout(timer);
      } else {
        setShowMessage(false);
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  // No mostrar nada mientras verifica autenticación
  if (loading) {
    return null;
  }

  // Mostrar mensaje de error antes de redirigir
  if (showMessage && !isAuthenticated && !publicRoutes.includes(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 mb-2">
            Debe iniciar sesión
          </p>
          <p className="text-sm text-gray-600">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return children;
}