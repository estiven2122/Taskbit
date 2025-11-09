package com.taskbit.backend.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "^(Pendiente|En progreso|Completada)$", message = "Estado no válido", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String status;
}

