"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) errs.email = "El correo es obligatorio.";
    else if (!emailRegex.test(email)) errs.email = "El correo no es válido.";
    if (!password) errs.password = "La contraseña es obligatoria.";
    else if (password.length < 8)
      errs.password = "La contraseña debe tener al menos 8 caracteres.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setSubmitted(false);
    if (Object.keys(v).length === 0) {
      try {
        // Usar el API route local para evitar problemas de CORS
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          // server-side validation errors
          if (data && data.errors) setErrors(data.errors);
          else if (data.message) setErrors({ form: data.message });
          else setErrors({ form: "Error en el registro" });
        } else {
          setSubmitted(true);
          // limpiar formulario
          setName("");
          setEmail("");
          setPassword("");
        }
      } catch (err) {
        setErrors({ form: "Error de conexión. Intente nuevamente." });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col items-center">
          <Image
            src="/LogoProyecto.png"
            alt="Logo de Taskbit"
            width={120}
            height={120}
            className="rounded-lg shadow-sm"
          />
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">Taskbit</h1>
          <p className="text-sm text-gray-500">Crea tu cuenta</p>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link 
              href="/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {submitted ? (
          <div className="mt-6 p-4 bg-green-50 rounded-md text-green-800">
            Registro completado correctamente.
          </div>
        ) : null}

        <form className="mt-6" onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2 text-black ${
                errors.name ? "border-red-500" : ""
              }`}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2 text-black ${
                errors.email ? "border-red-500" : ""
              }`}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2 text-black ${
                errors.password ? "border-red-500" : ""
              }`}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
