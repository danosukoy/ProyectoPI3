package com.proyectopi3.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    private LocalDateTime bookingDateTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "home_group_id")
    private StudyGroup homeGroup;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "away_group_id")
    private StudyGroup awayGroup;

    private Integer homeScore;
    private Integer awayScore;

    @NotBlank
    @Column(length = 100)
    private String organizer;

    @Column(length = 50)
    private String organizerUsername;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean reminderOneDaySent = false;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean reminderOneHourSent = false;
}
