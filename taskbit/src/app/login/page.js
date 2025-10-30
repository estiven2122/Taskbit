"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "El correo es obligatorio";
    if (!password) errs.password = "La contraseña es obligatoria";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        
        if (!res.ok) {
          if (data.errors) {
            setErrors(data.errors);
          } else {
            setErrors({ form: data.message || "Error al iniciar sesión" });
          }
        } else {
          // Almacenar token y datos del usuario
          AuthService.login(data.token, data.userId);
          // Redireccionar al dashboard después del login exitoso
          router.push("/dashboard");
        }
      } catch (err) {
        setErrors({ form: "Error de conexión. Intente nuevamente." });
      } finally {
        setIsLoading(false);
      }
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
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}