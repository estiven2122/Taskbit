package com.taskbit.backend.task;

import com.taskbit.backend.task.dto.CreateTaskRequest;
import com.taskbit.backend.task.dto.TaskResponse;
import com.taskbit.backend.task.dto.UpdateTaskRequest;
import com.taskbit.backend.task.dto.UpdateTaskStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tareas", description = "Endpoints para gestión de tareas")
@SecurityRequirement(name = "Bearer Authentication")
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Crear nueva tarea", description = "Crea una nueva tarea para el usuario autenticado")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request, Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        TaskResponse task = taskService.createTask(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @GetMapping
    @Operation(summary = "Listar tareas del usuario", description = "Obtiene todas las tareas del usuario autenticado")
    public ResponseEntity<List<TaskResponse>> getUserTasks(Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<TaskResponse> tasks = taskService.getUserTasks(userEmail);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tarea por ID", description = "Obtiene una tarea específica del usuario autenticado")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id, Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        TaskResponse task = taskService.getTaskById(id, userEmail);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar tarea", description = "Actualiza una tarea existente del usuario autenticado")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        TaskResponse task = taskService.updateTask(id, request, userEmail);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizar estado de una tarea", description = "Actualiza solo el estado de una tarea. Estados válidos: Pendiente, En progreso, Completada")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        TaskResponse task = taskService.updateTaskStatus(id, request.getStatus(), userEmail);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/{id}/deactivate-alerts")
    @Operation(summary = "Desactivar alertas de una tarea", description = "Desactiva todas las alertas activas de una tarea")
    public ResponseEntity<Void> deactivateTaskAlerts(@PathVariable Long id, Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        taskService.deactivateTaskAlerts(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar tarea", description = "Elimina una tarea del usuario autenticado. No se puede eliminar si tiene alertas activas.")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        taskService.deleteTask(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}

