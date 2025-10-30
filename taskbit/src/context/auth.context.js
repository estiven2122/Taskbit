"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "@/services/auth.service";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Verificar estado de autenticación al cargar
    const checkAuth = () => {
      const isAuthenticated = AuthService.isAuthenticated();
      const user = AuthService.getUser();
      setState({
        isAuthenticated,
        user,
        loading: false,
      });
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={state}>
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