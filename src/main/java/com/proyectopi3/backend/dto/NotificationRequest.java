package com.proyectopi3.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRequest {
    @NotBlank
    private String type; // "reserva", "mensaje", "info"

    @NotBlank
    private String title;

    @NotBlank
    private String description;
}
