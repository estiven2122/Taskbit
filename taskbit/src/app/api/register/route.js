import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomBytes, scryptSync } from "crypto";

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
    const { name = "", email = "", password = "" } = body;

    const errors = {};
    if (!name || !name.trim()) errors.name = "El nombre es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) errors.email = "El correo es obligatorio.";
    else if (!emailRegex.test(email)) errors.email = "El correo no es válido.";
    if (!password) errors.password = "La contraseña es obligatoria.";
    else if (password.length < 8)
      errors.password = "La contraseña debe tener al menos 8 caracteres.";

    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Enviar la solicitud al backend
    try {
      const backendResponse = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await backendResponse.json();
      
      if (!backendResponse.ok) {
        if (data && data.message) {
          if (data.message.includes("email ya está registrado")) {
            return NextResponse.json(
              { errors: { email: "El correo ya está registrado." } },
              { status: 400 }
            );
          }
          return NextResponse.json({ errors: { form: data.message } }, { status: 400 });
        }
        return NextResponse.json({ errors: { form: "Error en el registro" } }, { status: 400 });
      }
      
      return NextResponse.json({ message: "Usuario registrado exitosamente", userId: data.userId });
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      
      // Fallback al registro local si el backend no está disponible
      try {
        const users = await readUsers();
        const exists = users.find(
          (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) {
          return NextResponse.json(
            { errors: { email: "El correo ya está registrado." } },
            { status: 400 }
          );
        }

        const salt = randomBytes(16).toString("hex");
        const derivedKey = scryptSync(password, salt, 64).toString("hex");

        const newUser = {
          id: randomBytes(8).toString("hex"),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash: derivedKey,
          salt,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        await fs.mkdir(path.dirname(dataFile), { recursive: true });
        await fs.writeFile(dataFile, JSON.stringify(users, null, 2), "utf8");

        return NextResponse.json(
          { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } },
          { status: 201 }
        );
      } catch (localError) {
        console.error("Error en el registro local:", localError);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
      }
    }
  } catch (err) {
    console.error("/api/register error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
