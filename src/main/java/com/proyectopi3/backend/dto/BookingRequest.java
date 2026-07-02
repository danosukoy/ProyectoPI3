package com.proyectopi3.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String title;

    private String description;

    @NotNull
    private LocalDateTime bookingDateTime;

    @NotNull
    private Long locationId;

    @NotNull
    private Long courseId;

    @NotNull
    private Long homeGroupId;

    @NotNull
    private Long awayGroupId;

    private Integer homeScore;
    private Integer awayScore;

    @NotBlank
    @Size(max = 100)
    private String organizer;

    private String organizerUsername;

    private String status; // Expected to match BookingStatus enum values
}
