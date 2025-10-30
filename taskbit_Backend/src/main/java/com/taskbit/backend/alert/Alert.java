package com.taskbit.backend.alert;

import com.taskbit.backend.task.Task;
import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.OffsetDateTime;

@Entity @Table(name = "alert",
        uniqueConstraints = @UniqueConstraint(name="ux_alert_nodup", columnNames = {"task_id","time_before"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // Mapear INTERVAL → Duration con @Convert más adelante; por ahora simple String si quieres.
    @Column(name = "time_before", nullable = false)
    private String timeBefore; // ej: '24 hours' (puedes migrarlo a Duration con un AttributeConverter)

    @Column(name = "scheduled_for", nullable = false)
    private OffsetDateTime scheduledFor;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "activa"; // 'activa','desactivada','ejecutada'

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}