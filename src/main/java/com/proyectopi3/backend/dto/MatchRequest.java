package com.proyectopi3.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MatchRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String title;

    private String description;

    @NotNull
    private LocalDateTime matchDateTime;

    @NotNull
    private Long locationId;

    @NotNull
    private Long disciplineId;

    @NotNull
    private Long homeTeamId;

    @NotNull
    private Long awayTeamId;

    private Integer homeScore;
    private Integer awayScore;

    @NotBlank
    @Size(max = 100)
    private String organizer;

    @NotBlank
    private String status; // Expected to match MatchStatus enum values
}
