"use client";

import { useState, useEffect } from "react";
import AuthService from "@/services/auth.service";

export default function CreateAlertForm({ task, onAlertCreated, onCancel }) {
  const [formData, setFormData] = useState({
    taskId: task?.id || "",
    timeBefore: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Opciones predefinidas de tiempo de aviso
  const timeBeforeOptions = [
    { value: "1 hour", label: "1 hora antes" },
    { value: "2 hours", label: "2 horas antes" },
    { value: "6 hours", label: "6 horas antes" },
    { value: "12 hours", label: "12 horas antes" },
    { value: "24 hours", label: "24 horas antes" },
    { value: "2 days", label: "2 días antes" },
    { value: "3 days", label: "3 días antes" },
    { value: "7 days", label: "7 días antes" },
  ];

  useEffect(() => {
    if (task?.id) {
      setFormData(prev => ({
        ...prev,
        taskId: task.id,
      }));
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Limpiar mensaje de éxito cuando el usuario cambia algo
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar que se haya seleccionado una tarea
    if (!formData.taskId) {
      newErrors.taskId = "Debe seleccionar una tarea";
    }

    // Validar que se haya seleccionado un tiempo de aviso
    if (!formData.timeBefore) {
      newErrors.timeBefore = "Debe seleccionar un tiempo de aviso";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const token = AuthService.getToken();
      if (!token) {
        setErrors({ form: "No estás autenticado. Por favor, inicia sesión." });
        setIsLoading(false);
        return;
      }

      const requestBody = {
        taskId: parseInt(formData.taskId),
        timeBefore: formData.timeBefore,
      };

      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Verificar si la respuesta tiene contenido antes de parsear JSON
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error("Error parseando JSON:", parseError);
          setErrors({ form: "Error en la respuesta del servidor. Intente nuevamente." });
          setIsLoading(false);
          return;
        }
      } else {
        data = {};
      }

      console.log("CreateAlertForm: Respuesta recibida - Status:", response.status, "Data:", data);

      if (!response.ok) {
        // El backend puede devolver 'message' o 'error'
        const errorMessage = data.message || data.error || `Error al crear la alerta (${response.status})`;
        console.error("CreateAlertForm: Error al crear alerta:", errorMessage);
        setErrors({ form: errorMessage });
      } else {
        // Éxito
        console.log("CreateAlertForm: Alerta creada exitosamente - ID:", data.id, "TaskId:", data.taskId);
        setSuccessMessage("Alerta creada exitosamente");
        
        // Limpiar formulario
        setFormData({
          taskId: task?.id || "",
          timeBefore: "",
        });

        // Notificar al componente padre para refrescar la lista
        if (onAlertCreated) {
          console.log("CreateAlertForm: Notificando al componente padre con alerta:", data);
          onAlertCreated(data);
        }

        // Limpiar mensaje de éxito después de 2 segundos
        setTimeout(() => {
          setSuccessMessage("");
          if (onCancel) {
            onCancel();
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error al crear alerta:", error);
      if (error.name === 'AbortError') {
        setErrors({ form: "La petición tardó demasiado. Intente nuevamente." });
      } else {
        setErrors({ form: "Error de conexión. Intente nuevamente." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Crear Nueva Alerta</h3>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errors.form}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!task && (
          <div>
            <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
              Tarea <span className="text-red-500">*</span>
            </label>
            <select
              id="taskId"
              name="taskId"
              value={formData.taskId}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                errors.taskId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccionar tarea</option>
              {/* Nota: Las tareas deben ser pasadas como prop 'tasks' al componente */}
            </select>
            {errors.taskId && (
              <p className="mt-1 text-sm text-red-600">{errors.taskId}</p>
            )}
          </div>
        )}

        {task && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarea
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-300">
              {task.title}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="timeBefore" className="block text-sm font-medium text-gray-700 mb-1">
            Tiempo de aviso <span className="text-red-500">*</span>
          </label>
          <select
            id="timeBefore"
            name="timeBefore"
            value={formData.timeBefore}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
              errors.timeBefore ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccionar tiempo de aviso</option>
            {timeBeforeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.timeBefore && (
            <p className="mt-1 text-sm text-red-600">{errors.timeBefore}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Guardando..." : "Guardar Alerta"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

