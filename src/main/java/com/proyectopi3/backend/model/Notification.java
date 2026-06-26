package com.proyectopi3.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 50)
    private String username;

    @NotBlank
    @Column(length = 30)
    private String type; // e.g. "reserva", "mensaje", "info"

    @NotBlank
    @Column(length = 100)
    private String title;

    @NotBlank
    @Column(length = 500)
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private boolean read = false;
}
