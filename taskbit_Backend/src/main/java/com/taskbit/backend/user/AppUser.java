package com.taskbit.backend.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity 
@Table(name = "app_user")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}