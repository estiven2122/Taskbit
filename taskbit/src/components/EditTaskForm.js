"use client";

import { useState, useEffect } from "react";
import AuthService from "@/services/auth.service";

export default function EditTaskForm({ task, onCancel, onTaskUpdated }) {
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

  // Cargar valores de la tarea al montar o cuando cambie
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : "", // Formato YYYY-MM-DD
        priority: task.priority || "",
        course: task.course || "",
      });
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
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar título (obligatorio)
    if (!formData.title.trim()) {
      newErrors.title = "Campos obligatorios incompletos";
    }

    // Validar fecha de entrega (si se proporciona, debe ser futura)
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
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
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
          setErrors({ form: data.error || "Error al actualizar la tarea" });
        }
      } else {
        // Éxito
        setSuccessMessage("Cambios guardados");
        
        // Notificar al componente padre para refrescar la lista
        if (onTaskUpdated) {
          onTaskUpdated(data);
        }

        // Limpiar mensaje de éxito después de 2 segundos
        setTimeout(() => {
          setSuccessMessage("");
        }, 2000);
      }
    } catch (error) {
      setErrors({ form: "Error de conexión. Intente nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Editar Tarea</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

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
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-title"
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
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="edit-description"
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
                <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de entrega
                </label>
                <input
                  type="date"
                  id="edit-dueDate"
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
                <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  id="edit-priority"
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
              <label htmlFor="edit-course" className="block text-sm font-medium text-gray-700 mb-1">
                Curso/Asignatura
              </label>
              <input
                type="text"
                id="edit-course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="Ingrese el curso o asignatura (opcional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

