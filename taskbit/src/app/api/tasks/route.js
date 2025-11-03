import { NextResponse } from "next/server";
import AuthService from "@/services/auth.service";

export async function GET(req) {
  try {
    const token = AuthService.getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const response = await fetch("http://localhost:8080/api/tasks", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Error al obtener las tareas" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/tasks:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const token = AuthService.getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const response = await fetch("http://localhost:8080/api/tasks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Mapear errores del backend
      let errorMessage = data.message || "Error al crear la tarea";
      let statusCode = response.status;
      
      if (errorMessage.includes("obligatorios incompletos")) {
        return NextResponse.json(
          { errors: { title: "Campos obligatorios incompletos" } },
          { status: 400 }
        );
      } else if (errorMessage.includes("fecha límite") || errorMessage.includes("debe ser futura")) {
        return NextResponse.json(
          { errors: { dueDate: "La fecha límite debe ser futura" } },
          { status: 400 }
        );
      } else if (errorMessage.includes("Prioridad no válida")) {
        return NextResponse.json(
          { errors: { priority: "Prioridad no válida" } },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/tasks:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

