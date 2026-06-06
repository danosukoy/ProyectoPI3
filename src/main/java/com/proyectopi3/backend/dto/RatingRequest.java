package com.proyectopi3.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RatingRequest {
    @NotNull(message = "El número de estrellas es obligatorio.")
    @Min(value = 1, message = "El puntaje mínimo es 1 estrella.")
    @Max(value = 5, message = "El puntaje máximo es 5 estrellas.")
    private Integer stars;
}
