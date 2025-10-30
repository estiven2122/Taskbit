import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { scryptSync, timingSafeEqual } from "crypto";

const dataFile = path.join(process.cwd(), "data", "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    return [];
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email = "", password = "" } = body;

    const errors = {};
    if (!email || !email.trim()) errors.email = "El correo es obligatorio.";
    if (!password) errors.password = "La contraseña es obligatoria.";

    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Intentar login con el backend
    try {
      const backendResponse = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await backendResponse.json();
      
      if (!backendResponse.ok) {
        if (data && data.message) {
          return NextResponse.json({ errors: { form: data.message } }, { status: 400 });
        }
        return NextResponse.json({ errors: { form: "Credenciales inválidas" } }, { status: 400 });
      }
      
      return NextResponse.json({ token: data.token, userId: data.userId });
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      
      // Fallback al login local si el backend no está disponible
      try {
        const users = await readUsers();
        const user = users.find(
          (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (!user) {
          return NextResponse.json(
            { errors: { form: "Credenciales inválidas" } },
            { status: 400 }
          );
        }

        // Verificar contraseña
        const [salt, key] = user.passwordHash ? user.passwordHash.split(':') : [user.salt, user.passwordHash];
        const hashedBuffer = scryptSync(password, salt || user.salt, 64);
        const keyBuffer = Buffer.from(key || user.passwordHash, 'hex');
        
        const match = keyBuffer.length === hashedBuffer.length && 
                      timingSafeEqual(hashedBuffer, keyBuffer);
        
        if (!match) {
          return NextResponse.json(
            { errors: { form: "Credenciales inválidas" } },
            { status: 400 }
          );
        }

        // Generar un token simple para el modo local
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
        
        return NextResponse.json(
          { token, userId: user.id },
          { status: 200 }
        );
      } catch (localError) {
        console.error("Error en el login local:", localError);
        return NextResponse.json({ errors: { form: "Error interno del servidor." } }, { status: 500 });
      }
    }
  } catch (err) {
    console.error("/api/login error:", err);
    return NextResponse.json({ errors: { form: "Error interno del servidor." } }, { status: 500 });
  }
}