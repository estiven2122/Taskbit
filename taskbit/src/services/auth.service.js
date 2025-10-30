// Constantes para las claves de almacenamiento
const TOKEN_KEY = 'taskbit_token';
const USER_KEY = 'taskbit_user';

// Servicio de autenticación
class AuthService {
  // Almacenar token y datos del usuario
  static login(token, userId) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({ id: userId }));
  }

  // Obtener token almacenado
  static getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Obtener datos del usuario almacenados
  static getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Verificar si hay un usuario autenticado
  static isAuthenticated() {
    return !!this.getToken();
  }

  // Cerrar sesión - limpiar almacenamiento
  static logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export default AuthService;