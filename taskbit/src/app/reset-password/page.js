"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Obtener token de la URL
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrors({ form: "Token de restablecimiento inválido o faltante" });
    }
  }, [searchParams]);

  // Validar contraseña según políticas: mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validaciones
    const errs = {};
    
    if (!password) {
      errs.password = "La contraseña es obligatoria";
    } else if (!validatePassword(password)) {
      errs.password = "Contraseña insegura";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Debes confirmar tu contraseña";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!token) {
      setErrors({ form: "Token de restablecimiento inválido" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.message || "Error al restablecer la contraseña" });
        }
      } else {
        // Mostrar mensaje de éxito
        setSuccessMessage("Contraseña actualizada con éxito");
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setErrors({ form: "Error de conexión. Intente nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar errores cuando el usuario escribe
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      const { password: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      const { confirmPassword: _, ...restErrors } = errors;
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
            Restablecer Contraseña
          </h2>

          <p className="mt-2 text-sm text-center text-gray-600">
            Ingresa tu nueva contraseña
          </p>

          <p className="mt-2 text-sm text-center text-gray-600">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Volver al inicio de sesión
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña <span className="text-red-500">*</span>
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
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading || !password || !confirmPassword ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

