package com.proyectopi3.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"rater_id", "rated_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rater_id", nullable = false)
    private User rater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rated_id", nullable = false)
    private User rated;

    @NotNull
    @Column(nullable = false)
    private Integer stars; // Rating between 1 and 5
}
