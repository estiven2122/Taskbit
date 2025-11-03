"use client";

import { useState } from "react";
import AuthService from "@/services/auth.service";

export default function CreateTaskForm({ onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
    course: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar título (obligatorio)
    if (!formData.title.trim()) {
      newErrors.title = "Campos obligatorios incompletos";
    }

    // Validar fecha de entrega (si se proporciona, debe ser futura, no igual a hoy)
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.dueDate = "La fecha límite debe ser futura";
      }
    }

    // Validar prioridad (si se proporciona, debe ser alta, media o baja)
    if (formData.priority && formData.priority.trim()) {
      const priorityLower = formData.priority.toLowerCase().trim();
      if (!["alta", "media", "baja"].includes(priorityLower)) {
        newErrors.priority = "Prioridad no válida";
      }
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
      // Preparar datos para enviar
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        dueDate: formData.dueDate || null,
        priority: formData.priority.trim() ? formData.priority.trim().toLowerCase() : null,
        course: formData.course.trim() || null,
      };

      const token = AuthService.getToken();
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.error || "Error al crear la tarea" });
        }
      } else {
        // Éxito
        setSuccessMessage("Tarea creada");
        
        // Limpiar formulario
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: "",
          course: "",
        });

        // Notificar al componente padre para refrescar la lista
        if (onTaskCreated) {
          onTaskCreated();
        }

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      setErrors({ form: "Error de conexión. Intente nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Crear Nueva Tarea</h3>

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
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingrese el título de la tarea"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            placeholder="Ingrese la descripción de la tarea (opcional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de entrega
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                errors.dueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black ${
                errors.priority ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccionar prioridad</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Curso/Asignatura
          </label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            placeholder="Ingrese el curso o asignatura (opcional)"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Guardando..." : "Guardar Tarea"}
          </button>
        </div>
      </form>
    </div>
  );
}

