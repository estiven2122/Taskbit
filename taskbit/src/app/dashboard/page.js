"use client";

import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";
import HttpClient from "@/services/http.client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    const loadUserData = async () => {
      try {
        // Aquí puedes cargar los datos del usuario desde el backend si es necesario
        const userData = AuthService.getUser();
        setUser(userData);
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">TaskBit</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.email || "Usuario"}
              </span>
              <button
                onClick={() => {
                  AuthService.logout();
                  router.push("/login");
                }}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Tablero Principal</h2>
            {/* Aquí irá el contenido del dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Tareas Pendientes</h3>
                <p className="text-gray-600">Próximamente...</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Alertas Activas</h3>
                <p className="text-gray-600">Próximamente...</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Resumen</h3>
                <p className="text-gray-600">Próximamente...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}