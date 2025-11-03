"use client";

import { useEffect, useState, useMemo } from "react";
import AuthService from "@/services/auth.service";
import HttpClient from "@/services/http.client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import CreateTaskForm from "@/components/CreateTaskForm";
import TaskFilters from "@/components/TaskFilters";
import EditTaskForm from "@/components/EditTaskForm";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
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
      const response = await fetch("/api/tasks", {
        headers: {
          "Content-Type": "application/json",
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

  useEffect(() => {
    // El AuthGuard ya maneja la verificación de autenticación
    // Aquí solo cargamos los datos si el usuario está autenticado
    const loadUserData = async () => {
      try {
        const userData = AuthService.getUser();
        setUser(userData);
        await loadTasks();
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
  };

  const handleTaskUpdated = (updatedTask) => {
    // Actualizar la tarea en la lista local
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    // Cerrar el modal después de un breve delay
    setTimeout(() => {
      setSelectedTask(null);
    }, 1500);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTaskClick = async (task) => {
    // Cargar los datos completos de la tarea antes de abrir el editor
    try {
      const response = await fetch(`/api/tasks/${task.id}`);
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
          
          {/* Formulario de creación de tareas */}
          <CreateTaskForm onTaskCreated={handleTaskCreated} />

          {/* Componente de filtros y organización */}
          <TaskFilters tasks={tasks} onFilterChange={handleFilterChange} />

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
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h4>
                          {task.status && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.status === "Pendiente" ? "bg-blue-100 text-blue-800" :
                              task.status === "En progreso" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {task.status}
                            </span>
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
    </div>
  );
}