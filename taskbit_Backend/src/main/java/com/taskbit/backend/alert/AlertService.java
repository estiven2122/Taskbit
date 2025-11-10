package com.taskbit.backend.alert;

import com.taskbit.backend.alert.dto.AlertResponse;
import com.taskbit.backend.alert.dto.CreateAlertRequest;
import com.taskbit.backend.exception.AuthenticationException;
import com.taskbit.backend.exception.BusinessException;
import com.taskbit.backend.task.Task;
import com.taskbit.backend.task.TaskRepository;
import com.taskbit.backend.user.AppUser;
import com.taskbit.backend.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final AlertRepository alertRepository;
    private final TaskRepository taskRepository;
    private final AppUserRepository userRepository;

    @Transactional
    public AlertResponse createAlert(CreateAlertRequest request, String userEmail) {
        // Obtener usuario por email
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        // Validar que la tarea existe
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new AuthenticationException("Tarea no encontrada"));

        // Verificar que la tarea pertenece al usuario
        if (!task.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("No tienes permiso para crear alertas para esta tarea");
        }

        // Validar que la tarea tenga fecha de entrega
        if (task.getDueDate() == null) {
            throw new BusinessException("La tarea debe tener una fecha de entrega para crear una alerta");
        }

        // Validar que la tarea no esté vencida (la fecha de entrega debe ser futura o igual a hoy)
        LocalDate today = LocalDate.now();
        if (task.getDueDate().isBefore(today)) {
            throw new BusinessException("No se puede crear alerta para tarea vencida");
        }

        // Normalizar timeBefore (trim y validar)
        String normalizedTimeBefore = request.getTimeBefore() != null ? request.getTimeBefore().trim() : null;
        if (normalizedTimeBefore == null || normalizedTimeBefore.isEmpty()) {
            throw new BusinessException("El tiempo de aviso no puede estar vacío");
        }

        // Validar que no exista una alerta duplicada (usando el valor normalizado)
        Optional<Alert> existingAlert = alertRepository.findByTaskIdAndTimeBefore(request.getTaskId(), normalizedTimeBefore);
        if (existingAlert.isPresent()) {
            throw new BusinessException("Ya existe una alerta con este tiempo de aviso para esta tarea");
        }

        // Calcular scheduledFor basado en timeBefore y dueDate
        OffsetDateTime scheduledFor = calculateScheduledFor(task.getDueDate(), normalizedTimeBefore);

        // Crear nueva alerta
        Alert alert = Alert.builder()
                .task(task)
                .timeBefore(normalizedTimeBefore)
                .scheduledFor(scheduledFor)
                .status("activa")
                .createdAt(OffsetDateTime.now())
                .build();

        Alert savedAlert = alertRepository.save(alert);
        
        // Forzar el flush para asegurar que se persista inmediatamente
        alertRepository.flush();
        
        // Recargar la alerta con la relación Task cargada usando JOIN FETCH
        Alert alertWithTask = alertRepository.findByIdWithTask(savedAlert.getId())
                .orElse(savedAlert); // Si no se encuentra, usar la alerta guardada
        
        // Asegurar que la relación Task esté inicializada dentro de la transacción
        // Como ya tenemos la tarea cargada desde el inicio, simplemente la asignamos si es necesario
        if (alertWithTask.getTask() == null && savedAlert.getTask() != null) {
            // Si por alguna razón la relación no se cargó, usar la tarea que ya tenemos
            alertWithTask.setTask(task);
        }

        return mapToResponse(alertWithTask);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getUserAlerts(String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        // Obtener todas las tareas del usuario
        List<Task> userTasks = taskRepository.findByUserId(user.getId());
        List<Long> taskIds = userTasks.stream()
                .map(Task::getId)
                .collect(Collectors.toList());

        // Obtener todas las alertas de las tareas del usuario
        List<Alert> alerts = alertRepository.findAll().stream()
                .filter(alert -> taskIds.contains(alert.getTask().getId()))
                .collect(Collectors.toList());

        return alerts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getTaskAlerts(Long taskId, String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AuthenticationException("Tarea no encontrada"));

        // Verificar que la tarea pertenece al usuario
        if (!task.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("No tienes permiso para ver las alertas de esta tarea");
        }

        List<Alert> alerts = alertRepository.findByTaskId(taskId);
        return alerts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getActiveAlerts(String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        // Obtener todas las tareas del usuario
        List<Task> userTasks = taskRepository.findByUserId(user.getId());
        List<Long> taskIds = userTasks.stream()
                .map(Task::getId)
                .collect(Collectors.toList());

        // Obtener todas las alertas activas de las tareas del usuario
        List<Alert> activeAlerts = alertRepository.findByStatus("activa").stream()
                .filter(alert -> taskIds.contains(alert.getTask().getId()))
                .collect(Collectors.toList());

        return activeAlerts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OffsetDateTime calculateScheduledFor(LocalDate dueDate, String timeBefore) {
        // Parsear timeBefore (ej: "24 hours", "2 hours", "1 day")
        int hours = parseTimeBefore(timeBefore);
        
        // Calcular la fecha y hora programada
        LocalDateTime dueDateTime = dueDate.atTime(0, 0); // Medianoche del día de entrega
        LocalDateTime scheduledDateTime = dueDateTime.minusHours(hours);
        
        return scheduledDateTime.atOffset(ZoneOffset.UTC);
    }

    private int parseTimeBefore(String timeBefore) {
        // Formato esperado: "X hours" o "X hour" o "X days" o "X day"
        String normalized = timeBefore.trim().toLowerCase();
        
        if (normalized.contains("hour")) {
            String[] parts = normalized.split("\\s+");
            if (parts.length > 0) {
                try {
                    return Integer.parseInt(parts[0]);
                } catch (NumberFormatException e) {
                    throw new BusinessException("Formato de tiempo de aviso no válido");
                }
            }
        } else if (normalized.contains("day")) {
            String[] parts = normalized.split("\\s+");
            if (parts.length > 0) {
                try {
                    int days = Integer.parseInt(parts[0]);
                    return days * 24;
                } catch (NumberFormatException e) {
                    throw new BusinessException("Formato de tiempo de aviso no válido");
                }
            }
        }
        
        throw new BusinessException("Formato de tiempo de aviso no válido. Use 'X hours' o 'X days'");
    }

    private AlertResponse mapToResponse(Alert alert) {
        // Asegurar que la relación Task esté cargada para evitar LazyInitializationException
        Task task = alert.getTask();
        Long taskId = task != null ? task.getId() : null;
        String taskTitle = task != null ? task.getTitle() : null;
        
        return AlertResponse.builder()
                .id(alert.getId())
                .taskId(taskId)
                .taskTitle(taskTitle)
                .timeBefore(alert.getTimeBefore())
                .scheduledFor(alert.getScheduledFor())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}

