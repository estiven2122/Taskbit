package com.taskbit.backend.alert;

import com.taskbit.backend.alert.dto.AlertResponse;
import com.taskbit.backend.alert.dto.CreateAlertRequest;
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
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Alertas", description = "Endpoints para gestión de alertas")
@SecurityRequirement(name = "Bearer Authentication")
public class AlertController {
    private final AlertService alertService;

    @PostMapping
    @Operation(summary = "Crear nueva alerta", description = "Crea una nueva alerta para una tarea existente")
    public ResponseEntity<AlertResponse> createAlert(@Valid @RequestBody CreateAlertRequest request, Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AlertResponse alert = alertService.createAlert(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(alert);
    }

    @GetMapping
    @Operation(summary = "Listar alertas del usuario", description = "Obtiene todas las alertas de las tareas del usuario autenticado")
    public ResponseEntity<List<AlertResponse>> getUserAlerts(Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<AlertResponse> alerts = alertService.getUserAlerts(userEmail);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/active")
    @Operation(summary = "Listar alertas activas", description = "Obtiene todas las alertas activas de las tareas del usuario autenticado")
    public ResponseEntity<List<AlertResponse>> getActiveAlerts(Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<AlertResponse> alerts = alertService.getActiveAlerts(userEmail);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Listar alertas de una tarea", description = "Obtiene todas las alertas de una tarea específica")
    public ResponseEntity<List<AlertResponse>> getTaskAlerts(@PathVariable Long taskId, Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<AlertResponse> alerts = alertService.getTaskAlerts(taskId, userEmail);
        return ResponseEntity.ok(alerts);
    }
}

