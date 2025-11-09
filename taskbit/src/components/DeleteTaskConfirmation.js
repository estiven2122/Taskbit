"use client";

import { useState } from "react";
import AuthService from "@/services/auth.service";

export default function DeleteTaskConfirmation({ task, onCancel, onTaskDeleted, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeactivateOption, setShowDeactivateOption] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const token = AuthService.getToken();
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Si el error es por alertas activas, mostrar opción de desactivar
        if (data.error && data.error.includes("alertas activas")) {
          setErrorMessage(data.error);
          setShowDeactivateOption(true);
          setIsLoading(false);
          return;
        }
        
        setErrorMessage(data.error || "Error al eliminar la tarea");
        setIsLoading(false);
        return;
      }

      // Éxito: notificar al componente padre
      if (onTaskDeleted) {
        onTaskDeleted();
      }
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      setErrorMessage("Error de conexión. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  const handleDeactivateAndDelete = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const token = AuthService.getToken();
      
      // Primero desactivar las alertas
      const deactivateResponse = await fetch(`/api/tasks/${task.id}/deactivate-alerts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!deactivateResponse.ok) {
        const data = await deactivateResponse.json();
        setErrorMessage(data.error || "Error al desactivar las alertas");
        setIsLoading(false);
        return;
      }

      // Luego eliminar la tarea
      const deleteResponse = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!deleteResponse.ok) {
        const data = await deleteResponse.json();
        setErrorMessage(data.error || "Error al eliminar la tarea");
        setIsLoading(false);
        return;
      }

      // Éxito: notificar al componente padre
      if (onTaskDeleted) {
        onTaskDeleted();
      }
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      setErrorMessage("Error de conexión. Intente nuevamente.");
      setIsLoading(false);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Eliminar Tarea</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {!showDeactivateOption ? (
            <>
              <p className="text-gray-700 mb-6">
                ¿Seguro que deseas eliminar esta tarea?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Eliminando..." : "Sí"}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Esta tarea tiene alertas activas. Puedes desactivar las alertas y luego eliminar la tarea, o cancelar la operación.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeactivateAndDelete}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Procesando..." : "Desactivar alertas y eliminar"}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

