"use client";

import { useState, useEffect } from "react";

export default function TaskFilters({ tasks, onFilterChange }) {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    course: "",
    searchTitle: "",
    sortBy: "none",
    sortOrder: "asc",
  });

  const [uniqueCourses, setUniqueCourses] = useState([]);

  useEffect(() => {
    // Extraer cursos únicos de las tareas
    const courses = [...new Set(tasks.map(task => task.course).filter(Boolean))].sort();
    setUniqueCourses(courses);
  }, [tasks]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Contadores por estado
  const taskCounts = {
    Pendiente: tasks.filter(t => t.status === "Pendiente").length,
    "En progreso": tasks.filter(t => t.status === "En progreso").length,
    Completada: tasks.filter(t => t.status === "Completada").length,
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Organización de Tareas</h3>

      {/* Contadores por estado */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{taskCounts.Pendiente}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{taskCounts["En progreso"]}</div>
          <div className="text-sm text-gray-600">En progreso</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{taskCounts.Completada}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
      </div>

      {/* Búsqueda por título */}
      <div className="mb-4">
        <label htmlFor="searchTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Buscar por título
        </label>
        <input
          type="text"
          id="searchTitle"
          value={filters.searchTitle}
          onChange={(e) => handleFilterChange("searchTitle", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          placeholder="Buscar tareas por título..."
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Filtro por estado */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Estado
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

        {/* Filtro por prioridad */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Prioridad
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {/* Filtro por curso */}
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Curso
          </label>
          <select
            id="course"
            value={filters.course}
            onChange={(e) => handleFilterChange("course", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="">Todos los cursos</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ordenamiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          >
            <option value="none">Sin ordenar</option>
            <option value="dueDate">Fecha de entrega</option>
            <option value="priority">Prioridad</option>
            <option value="title">Título</option>
          </select>
        </div>

        {filters.sortBy !== "none" && (
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Orden
            </label>
            <select
              id="sortOrder"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            >
              {filters.sortBy === "priority" ? (
                <>
                  <option value="desc">Alta → Baja</option>
                  <option value="asc">Baja → Alta</option>
                </>
              ) : filters.sortBy === "title" ? (
                <>
                  <option value="asc">A–Z</option>
                  <option value="desc">Z–A</option>
                </>
              ) : (
                <>
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Botón para limpiar filtros */}
      {(filters.status || filters.priority || filters.course || filters.searchTitle || filters.sortBy !== "none") && (
        <div className="mt-4">
          <button
            onClick={() => {
              const resetFilters = {
                status: "",
                priority: "",
                course: "",
                searchTitle: "",
                sortBy: "none",
                sortOrder: "asc",
              };
              setFilters(resetFilters);
              onFilterChange(resetFilters);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}


