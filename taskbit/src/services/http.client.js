import AuthService from "./auth.service";

class HttpClient {
  static async fetch(url, options = {}) {
    // Asegurarse de que options.headers existe
    options.headers = options.headers || {};

    // Si hay un token, añadirlo a los headers
    const token = AuthService.getToken();
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    // Añadir Content-Type por defecto si no está definido
    if (!options.headers["Content-Type"]) {
      options.headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, options);

      // Si el servidor responde 401 (no autorizado), limpiar el token
      if (response.status === 401) {
        AuthService.logout();
        // Redirigir a login si es necesario
        window.location.href = "/login";
        throw new Error("Sesión expirada");
      }

      return response;
    } catch (error) {
      // Manejar errores de red u otros
      console.error("Error en la petición:", error);
      throw error;
    }
  }

  // Métodos helper para diferentes tipos de peticiones
  static async get(url, options = {}) {
    return this.fetch(url, { ...options, method: "GET" });
  }

  static async post(url, body, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static async put(url, body, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static async delete(url, options = {}) {
    return this.fetch(url, { ...options, method: "DELETE" });
  }
}

export default HttpClient;