import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { errors: { email: "El correo electrónico es obligatorio" } },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { errors: { email: "Formato de correo inválido (ejemplo: usuario@correo.com)" } },
        { status: 400 }
      );
    }

    // Hacer petición al backend
    const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Mapear mensajes del backend a los campos correctos
      const errorMessage = data.message || "Error al procesar la solicitud";
      
      if (errorMessage === "Usuario no registrado") {
        return NextResponse.json(
          { errors: { email: "Usuario no registrado" } },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { errors: { form: errorMessage } },
          { status: response.status }
        );
      }
    }

    // Éxito - el email ha sido enviado
    return NextResponse.json({ 
      message: data.message
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { errors: { form: "Error en el servidor" } },
      { status: 500 }
    );
  }
}

