"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "@/services/auth.service";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  logout: () => {},
  refreshAuth: () => {},
});

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Función para refrescar el estado de autenticación
  const refreshAuth = () => {
    const isAuthenticated = AuthService.isAuthenticated();
    const user = AuthService.getUser();
    setState({
      isAuthenticated,
      user,
      loading: false,
    });
  };

  // Función para cerrar sesión
  const logout = () => {
    AuthService.logout();
    refreshAuth();
  };

  useEffect(() => {
    // Verificar estado de autenticación al cargar
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, logout, refreshAuth }}>
      {state.loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Cargando...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}