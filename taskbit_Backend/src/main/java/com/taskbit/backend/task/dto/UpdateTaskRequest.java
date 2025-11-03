package com.taskbit.backend.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateTaskRequest {
    @NotBlank(message = "El título es obligatorio")
    private String title;

    private String description;

    private LocalDate dueDate;

    private String priority;

    private String course;
}

