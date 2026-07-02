package com.proyectopi3.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "study_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 100)
    private String name;

    @NotBlank
    @Column(length = 100)
    private String courseName;

    @Column(length = 20)
    private String type; // "normal" or "subaula"

    @Column(length = 50)
    private String subaula;
}
