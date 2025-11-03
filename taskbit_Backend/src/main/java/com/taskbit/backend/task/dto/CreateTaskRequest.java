package com.taskbit.backend.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Campos obligatorios incompletos")
    private String title;

    private String description;

    private LocalDate dueDate;

    private String priority;

    private String course;
}

