import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Aquí deberías hacer la petición al backend
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Mapear mensajes del backend a los campos correctos
      const errorMessage = data.message || "Error al iniciar sesión";
      
      if (errorMessage === "Usuario no registrado") {
        return NextResponse.json(
          { errors: { email: "Usuario no registrado" } },
          { status: 401 }
        );
      } else if (errorMessage === "Contraseña inválida") {
        return NextResponse.json(
          { errors: { password: "Contraseña inválida" } },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { errors: { form: errorMessage } },
          { status: 401 }
        );
      }
    }

    // Si la autenticación es exitosa, devolvemos los datos del usuario
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { errors: { form: "Error en el servidor" } },
      { status: 500 }
    );
  }
}