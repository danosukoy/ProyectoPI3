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
@Table(name = "university_matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    private LocalDateTime matchDateTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "discipline_id")
    private Discipline discipline;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "home_team_id")
    private Team homeTeam;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "away_team_id")
    private Team awayTeam;

    private Integer homeScore;
    private Integer awayScore;

    @NotBlank
    @Column(length = 100)
    private String organizer;

    @Column(length = 50)
    private String organizerUsername;

    @NotNull
    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean reminderOneDaySent = false;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean reminderOneHourSent = false;
}
