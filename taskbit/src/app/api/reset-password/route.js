import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !token.trim()) {
      return NextResponse.json(
        { errors: { form: "Token de restablecimiento inválido" } },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { errors: { password: "La contraseña es obligatoria" } },
        { status: 400 }
      );
    }

    // Hacer petición al backend
    const response = await fetch("http://localhost:8080/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token.trim(), password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Mapear mensajes del backend a los campos correctos
      const errorMessage = data.message || "Error al restablecer la contraseña";
      
      if (errorMessage === "Contraseña insegura") {
        return NextResponse.json(
          { errors: { password: "Contraseña insegura" } },
          { status: 400 }
        );
      } else if (errorMessage.includes("Token") || errorMessage.includes("expirado")) {
        return NextResponse.json(
          { errors: { form: errorMessage } },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { errors: { form: errorMessage } },
          { status: response.status }
        );
      }
    }

    // Éxito
    return NextResponse.json({ message: data.message });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { errors: { form: "Error en el servidor" } },
      { status: 500 }
    );
  }
}

