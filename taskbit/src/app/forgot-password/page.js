"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Validar formato de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validar formato de email
    if (!email.trim()) {
      setErrors({ email: "El correo electrónico es obligatorio" });
      return;
    }

    if (!validateEmail(email.trim())) {
      setErrors({ email: "Formato de correo inválido (ejemplo: usuario@correo.com)" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.message || "Error al procesar la solicitud" });
        }
      } else {
        // Mostrar mensaje de éxito
        setSuccessMessage(data.message || "Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico. Por favor, revisa tu bandeja de entrada.");
        setEmail("");
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
            Recuperar Contraseña
          </h2>

          <p className="mt-2 text-sm text-center text-gray-600">
            Ingresa tu correo electrónico para recibir un enlace de restablecimiento
          </p>

          <p className="mt-2 text-sm text-center text-gray-600">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </Link>
          </p>

          {errors.form && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errors.form}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {successMessage}
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
                  placeholder="usuario@correo.com"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading || !email.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

