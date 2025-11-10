import { NextResponse } from "next/server";

export async function GET(req) {
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

    const response = await fetch("http://localhost:8080/api/alerts", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Error al obtener las alertas" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/alerts:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
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

    const body = await req.json();
    console.log("Enviando petición al backend:", body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    const response = await fetch("http://localhost:8080/api/alerts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Verificar el tipo de contenido antes de parsear
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Error parseando respuesta del backend:", parseError);
        return NextResponse.json(
          { error: "Error en la respuesta del servidor" },
          { status: 500 }
        );
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      console.error("Error del backend:", data);
      return NextResponse.json(
        { 
          error: data.message || data.error || "Error al crear la alerta",
          message: data.message || data.error || "Error al crear la alerta"
        },
        { status: response.status }
      );
    }

    console.log("Alerta creada exitosamente:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/alerts:", error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "La petición tardó demasiado tiempo" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Error en el servidor" },
      { status: 500 }
    );
  }
}

