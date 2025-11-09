package com.taskbit.backend.alert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private String timeBefore;
    private OffsetDateTime scheduledFor;
    private String status;
    private OffsetDateTime createdAt;
}

