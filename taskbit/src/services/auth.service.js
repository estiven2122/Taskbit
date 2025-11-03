// Constantes para las claves de almacenamiento
const TOKEN_KEY = 'taskbit_token';
const USER_KEY = 'taskbit_user';
const REMEMBER_ME_KEY = 'taskbit_remember_me';
const REMEMBER_ME_EMAIL_KEY = 'taskbit_remember_email';
const REMEMBER_ME_EXPIRY_KEY = 'taskbit_remember_expiry';

// Duración del "Recordarme" en días
const REMEMBER_ME_DURATION_DAYS = 30;

// Servicio de autenticación
class AuthService {
  // Almacenar token y datos del usuario
  static login(token, userId, rememberMe = false, email = null) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({ id: userId }));

    if (rememberMe && email) {
      // Almacenar información de "Recordarme" con fecha de expiración
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + REMEMBER_ME_DURATION_DAYS);
      
      // Usar un método más seguro: no almacenar la contraseña directamente
      // Solo almacenamos el email y un flag, el token JWT ya maneja la autenticación
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email);
      localStorage.setItem(REMEMBER_ME_EXPIRY_KEY, expiryDate.toISOString());
    } else {
      // Limpiar datos de "Recordarme" si no está activo
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
      localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
    }
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
    const token = this.getToken();
    if (!token) return false;

    // Si hay "Recordarme" activo, verificar expiración
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberMe === 'true') {
      const expiryStr = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);
      if (expiryStr) {
        const expiryDate = new Date(expiryStr);
        const now = new Date();
        if (now > expiryDate) {
          // La sesión ha expirado, limpiar todo
          this.logout();
          return false;
        }
      }
    }

    return true;
  }

  // Obtener email recordado si está disponible y válido
  static getRememberedEmail() {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberMe === 'true') {
      const expiryStr = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);
      if (expiryStr) {
        const expiryDate = new Date(expiryStr);
        const now = new Date();
        if (now <= expiryDate) {
          return localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
        } else {
          // Limpiar si ha expirado
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
          localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
        }
      }
    }
    return null;
  }

  // Verificar si "Recordarme" está activo
  static isRememberMeActive() {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberMe === 'true') {
      const expiryStr = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);
      if (expiryStr) {
        const expiryDate = new Date(expiryStr);
        const now = new Date();
        return now <= expiryDate;
      }
    }
    return false;
  }

  // Cerrar sesión - eliminar todos los tokens y sesiones almacenadas
  static logout() {
    // Limpiar completamente todo incluyendo "Recordarme"
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
    localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
  }

  // Limpiar completamente todo incluyendo "Recordarme" (alias para logout)
  static clearAll() {
    this.logout();
  }
}

export default AuthService;