package com.taskbit.backend.task;

import com.taskbit.backend.exception.AuthenticationException;
import com.taskbit.backend.task.dto.CreateTaskRequest;
import com.taskbit.backend.task.dto.TaskResponse;
import com.taskbit.backend.task.dto.UpdateTaskRequest;
import com.taskbit.backend.user.AppUser;
import com.taskbit.backend.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final AppUserRepository userRepository;

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, String userEmail) {
        // Obtener usuario por email
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        // Validar título
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new AuthenticationException("Campos obligatorios incompletos");
        }

        // Validar fecha de entrega si se proporciona (debe ser después de hoy, no igual)
        if (request.getDueDate() != null && !request.getDueDate().isAfter(LocalDate.now())) {
            throw new AuthenticationException("La fecha límite debe ser futura");
        }

        // Validar prioridad si se proporciona (normalizar a minúsculas)
        String priority = null;
        if (request.getPriority() != null && !request.getPriority().trim().isEmpty()) {
            String priorityLower = request.getPriority().toLowerCase().trim();
            if (!priorityLower.equals("alta") && !priorityLower.equals("media") && !priorityLower.equals("baja")) {
                throw new AuthenticationException("Prioridad no válida");
            }
            priority = priorityLower;
        }

        // Crear nueva tarea
        Task task = Task.builder()
                .user(user)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .dueDate(request.getDueDate())
                .priority(priority)
                .course(request.getCourse() != null ? request.getCourse().trim() : null)
                .status("Pendiente")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Task savedTask = taskRepository.save(task);

        return mapToResponse(savedTask);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getUserTasks(String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        List<Task> tasks = taskRepository.findByUserId(user.getId());
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AuthenticationException("Tarea no encontrada"));

        // Verificar que la tarea pertenece al usuario
        if (!task.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("No tienes permiso para acceder a esta tarea");
        }

        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AuthenticationException("Tarea no encontrada"));

        // Verificar que la tarea pertenece al usuario
        if (!task.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("No tienes permiso para modificar esta tarea");
        }

        // Validar título
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new AuthenticationException("Campos obligatorios incompletos");
        }

        // Validar fecha de entrega si se proporciona (debe ser después de hoy, no igual)
        if (request.getDueDate() != null && !request.getDueDate().isAfter(LocalDate.now())) {
            throw new AuthenticationException("La fecha límite debe ser futura");
        }

        // Validar prioridad si se proporciona (normalizar a minúsculas)
        String priority = null;
        if (request.getPriority() != null && !request.getPriority().trim().isEmpty()) {
            String priorityLower = request.getPriority().toLowerCase().trim();
            if (!priorityLower.equals("alta") && !priorityLower.equals("media") && !priorityLower.equals("baja")) {
                throw new AuthenticationException("Prioridad no válida");
            }
            priority = priorityLower;
        }

        // Validar estado si se proporciona
        String status = task.getStatus(); // Mantener el estado actual por defecto
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            String statusValue = request.getStatus().trim();
            // Normalizar: capitalizar primera letra de cada palabra
            if (statusValue.equalsIgnoreCase("Pendiente") || 
                statusValue.equalsIgnoreCase("En progreso") || 
                statusValue.equalsIgnoreCase("Completada")) {
                if (statusValue.equalsIgnoreCase("En progreso")) {
                    status = "En progreso";
                } else if (statusValue.equalsIgnoreCase("Completada")) {
                    status = "Completada";
                    // Si se marca como completada, actualizar completedAt
                    if (task.getCompletedAt() == null) {
                        task.setCompletedAt(OffsetDateTime.now());
                    }
                } else {
                    status = "Pendiente";
                    // Si cambia de completada a otro estado, limpiar completedAt
                    if (task.getStatus().equals("Completada")) {
                        task.setCompletedAt(null);
                    }
                }
            } else {
                throw new AuthenticationException("Estado no válido");
            }
        }

        // Actualizar campos
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        task.setDueDate(request.getDueDate());
        task.setPriority(priority);
        task.setCourse(request.getCourse() != null ? request.getCourse().trim() : null);
        task.setStatus(status);
        task.setUpdatedAt(OffsetDateTime.now());

        Task updatedTask = taskRepository.save(task);

        return mapToResponse(updatedTask);
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .dueDate(task.getDueDate())
                .priority(task.getPriority())
                .course(task.getCourse())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

