package com.taskbit.backend.task;

import com.taskbit.backend.user.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "task")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    private LocalDate dueDate;

    @Column(length = 10)
    private String priority;

    @Column(length = 100)
    private String course;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Pendiente";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}