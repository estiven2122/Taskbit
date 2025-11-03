"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const validatePassword = (password) => {
    // Al menos 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  const validate = () => {
    const errs = {};
    
    // Validar nombre
    if (!name.trim()) errs.name = "El nombre es obligatorio.";
    
    // Validar correo - formato usuario@correo.com
    if (!email.trim()) {
      errs.email = "El correo es obligatorio.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errs.email = "Correo inválido";
      }
    }
    
    // Validar contraseña
    if (!password) {
      errs.password = "La contraseña es obligatoria.";
    } else if (!validatePassword(password)) {
      errs.password = "Contraseña insegura";
    }
    
    // Validar confirmación de contraseña
    if (!confirmPassword) {
      errs.confirmPassword = "Debes confirmar tu contraseña.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden.";
    }
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Error del servidor
        if (data && data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setErrors({ form: data.message });
        } else {
          setErrors({ form: "Error en el registro" });
        }
      } else {
        // Registro exitoso
        setSuccessMessage("Cuenta creada");
        // Limpiar formulario
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        // Redirigir al dashboard después de 1 segundo
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setErrors({ form: "Error de conexión. Intente nuevamente." });
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

        {/* Mensaje de error general */}
        {errors.form && (
          <div className="mt-6 p-4 bg-red-50 rounded-md text-red-800">
            {errors.form}
          </div>
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mt-6 p-4 bg-green-50 rounded-md text-green-800">
            {successMessage}
          </div>
        )}

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2 text-black ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
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
