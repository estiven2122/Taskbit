package com.taskbit.backend.alert.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAlertRequest {
    @NotNull(message = "El ID de la tarea es obligatorio")
    private Long taskId;

    @NotBlank(message = "El tiempo de aviso es obligatorio")
    private String timeBefore; // ej: "24 hours", "2 hours"
}

