import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Error al obtener la tarea" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Mapear errores del backend
      let errorMessage = data.message || "Error al actualizar la tarea";
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en PUT /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}


