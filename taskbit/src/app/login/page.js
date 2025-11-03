"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { useAuth } from "@/context/auth.context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  // Cargar email recordado al iniciar
  useEffect(() => {
    const rememberedEmail = AuthService.getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
      // Si hay recordarme activo y el usuario está autenticado, redirigir directamente
      if (AuthService.isAuthenticated() && AuthService.isRememberMeActive()) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  // Validar formato de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar si el formulario está completo y válido
  const isFormValid = () => {
    return email.trim() !== "" && 
           password.trim() !== "" && 
           validateEmail(email.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!isFormValid()) {
      // Validar campos individuales
      const errs = {};
      if (!email.trim()) {
        errs.email = "El correo es obligatorio";
      } else if (!validateEmail(email.trim())) {
        errs.email = "Formato de correo inválido (ejemplo: usuario@correo.com)";
      }
      if (!password) {
        errs.password = "La contraseña es obligatoria";
      }
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.message || "Error al iniciar sesión" });
        }
      } else {
        // Almacenar token y datos del usuario con "Recordarme"
        AuthService.login(data.token, data.userId, rememberMe, email.trim());
        
        // Actualizar el contexto de autenticación inmediatamente
        refreshAuth();
        
        // Mostrar mensaje de bienvenida brevemente
        setShowWelcome(true);
        
        // Redireccionar al dashboard después de 1.5 segundos
        // Usar window.location.href para forzar recarga completa y asegurar que el contexto se inicialice
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch (err) {
      setErrors({ form: "Error de conexión. Intente nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar errores cuando el usuario escribe
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      const { email: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      const { password: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // Si se muestra el mensaje de bienvenida, mostrar solo eso
  if (showWelcome) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Image
              src="/LogoProyecto.png"
              alt="Logo de TaskBit"
              width={100}
              height={100}
              className="rounded-lg shadow-sm mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido!
          </h2>
          <p className="text-gray-600">
            Redirigiendo al tablero de tareas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-center mb-6">
            <Image
              src="/LogoProyecto.png"
              alt="Logo de TaskBit"
              width={100}
              height={100}
              className="rounded-lg shadow-sm"
            />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-center text-gray-900">
            Iniciar Sesión
          </h2>
          
          <p className="mt-2 text-sm text-center text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              Regístrate aquí
            </Link>
          </p>

          {errors.form && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errors.form}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="usuario@correo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              {/* Enlace "Olvidé mi contraseña" debajo del campo contraseña */}
              <div className="mt-2">
                <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Olvidé mi contraseña
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                Recordarme
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Iniciando sesión..." : "Ingresar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}