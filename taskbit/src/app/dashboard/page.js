"use client";

import { useEffect, useState, useMemo } from "react";
import AuthService from "@/services/auth.service";
import HttpClient from "@/services/http.client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import CreateTaskForm from "@/components/CreateTaskForm";
import TaskFilters from "@/components/TaskFilters";
import EditTaskForm from "@/components/EditTaskForm";
import DeleteTaskConfirmation from "@/components/DeleteTaskConfirmation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    course: "",
    searchTitle: "",
    sortBy: "none",
    sortOrder: "asc",
  });
  const router = useRouter();
  const { logout } = useAuth();

  const loadTasks = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch("/api/tasks", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  const loadAlerts = async () => {
    try {
      const token = AuthService.getToken();
      console.log("Dashboard: Cargando alertas activas...");
      const response = await fetch("/api/alerts/active", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const alertsData = await response.json();
        console.log("Dashboard: Alertas activas cargadas:", alertsData.length, "alertas");
        console.log("Dashboard: Detalle de alertas activas:", alertsData);
        setAlerts(alertsData);
      } else {
        console.error("Dashboard: Error al cargar alertas activas - Status:", response.status);
      }
    } catch (error) {
      console.error("Dashboard: Error cargando alertas:", error);
    }
  };

  useEffect(() => {
    // El AuthGuard ya maneja la verificación de autenticación
    // Aquí solo cargamos los datos si el usuario está autenticado
    const loadUserData = async () => {
      try {
        const userData = AuthService.getUser();
        setUser(userData);
        await loadTasks();
        await loadAlerts();
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleTaskCreated = () => {
    loadTasks();
    loadAlerts();
  };

  const handleTaskUpdated = async (updatedTask) => {
    console.log("Dashboard: Tarea actualizada recibida:", updatedTask);
    // Actualizar la tarea en la lista local
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    // Esperar un momento antes de recargar alertas
    await new Promise(resolve => setTimeout(resolve, 300));
    // Recargar alertas por si se crearon nuevas
    console.log("Dashboard: Recargando alertas activas...");
    await loadAlerts();
    console.log("Dashboard: Alertas activas recargadas");
    // Cerrar el modal después de un breve delay
    setTimeout(() => {
      setSelectedTask(null);
    }, 1500);
  };

  const handleStatusChange = async (task, newStatus, e) => {
    e.stopPropagation(); // Evitar que se abra el editor
    
    try {
      const token = AuthService.getToken();
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        // Actualizar la tarea en la lista local inmediatamente
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === updatedTask.id ? updatedTask : t
          )
        );
        // Si el modal de edición está abierto para esta tarea, actualizar también
        if (selectedTask && selectedTask.id === updatedTask.id) {
          setSelectedTask(updatedTask);
        }
      } else {
        const data = await response.json();
        console.error("Error al actualizar el estado:", data.error);
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pendiente":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "En progreso":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "Completada":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColors = (status) => {
    switch (status) {
      case "Pendiente":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "En progreso":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Completada":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTaskClick = async (task) => {
    // Cargar los datos completos de la tarea antes de abrir el editor
    try {
      const token = AuthService.getToken();
      const response = await fetch(`/api/tasks/${task.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const taskData = await response.json();
        setSelectedTask(taskData);
      } else {
        console.error("Error al cargar la tarea");
      }
    } catch (error) {
      console.error("Error al cargar la tarea:", error);
    }
  };

  const handleDeleteClick = (task, e) => {
    e.stopPropagation(); // Evitar que se abra el editor al hacer clic en eliminar
    setTaskToDelete(task);
  };

  const handleTaskDeleted = () => {
    // Mostrar mensaje de éxito
    setSuccessMessage("Tarea eliminada");
    
    // Recargar la lista de tareas
    loadTasks();
    
    // Cerrar el modal de confirmación
    setTaskToDelete(null);
    
    // Limpiar el mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  // Filtrar y ordenar tareas
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Aplicar filtros
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter(task => 
        task.priority && task.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    if (filters.course) {
      result = result.filter(task => task.course === filters.course);
    }

    // Búsqueda por título (combinada con otros filtros)
    if (filters.searchTitle) {
      const searchLower = filters.searchTitle.toLowerCase();
      result = result.filter(task => 
        task.title && task.title.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar ordenamiento
    if (filters.sortBy !== "none") {
      result.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "dueDate":
            // Ordenar por fecha de entrega
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            comparison = dateA - dateB;
            // Si no hay fecha, van al final
            if (!a.dueDate && b.dueDate) comparison = 1;
            if (a.dueDate && !b.dueDate) comparison = -1;
            break;

          case "priority":
            // Ordenar por prioridad: alta > media > baja
            const priorityOrder = { alta: 3, media: 2, baja: 1 };
            const priorityA = priorityOrder[a.priority?.toLowerCase()] || 0;
            const priorityB = priorityOrder[b.priority?.toLowerCase()] || 0;
            comparison = priorityA - priorityB;
            break;

          case "title":
            // Ordenar por título alfabéticamente
            const titleA = (a.title || "").toLowerCase();
            const titleB = (b.title || "").toLowerCase();
            comparison = titleA.localeCompare(titleB);
            break;

          default:
            return 0;
        }

        return filters.sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [tasks, filters]);

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
                onClick={handleLogout}
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
          <h2 className="text-2xl font-bold mb-6">Tablero Principal</h2>
          
          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          
          {/* Formulario de creación de tareas */}
          <CreateTaskForm onTaskCreated={handleTaskCreated} />

          {/* Componente de filtros y organización */}
          <TaskFilters tasks={tasks} onFilterChange={handleFilterChange} />

          {/* Lista de Alertas Activas */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Alertas Activas</h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-green-50 border border-green-200 rounded-md"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {alert.taskTitle}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.timeBefore} antes de la fecha de entrega
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Programada para: {new Date(alert.scheduledFor).toLocaleString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Tareas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Lista de Tareas</h3>
            
            {filteredAndSortedTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No se encontraron tareas</p>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h4>
                          {task.status && (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColors(task.status)}`}>
                                {getStatusIcon(task.status)}
                                {task.status}
                              </span>
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task, e.target.value, e)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="text-xs font-medium border border-gray-300 rounded-md px-2 py-1 cursor-pointer bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                title="Cambiar estado"
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En progreso">En progreso</option>
                                <option value="Completada">Completada</option>
                              </select>
                            </div>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          {task.priority && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Prioridad: {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Entrega: {new Date(task.dueDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                          {task.course && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {task.course}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(task, e)}
                        className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                        title="Eliminar tarea"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de edición de tarea */}
      {selectedTask && (
        <EditTaskForm
          task={selectedTask}
          onCancel={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {taskToDelete && (
        <DeleteTaskConfirmation
          task={taskToDelete}
          onCancel={handleDeleteCancel}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}