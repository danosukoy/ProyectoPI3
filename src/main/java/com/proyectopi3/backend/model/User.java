package com.proyectopi3.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "username"),
    @UniqueConstraint(columnNames = "email")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 50)
    private String username;

    @NotBlank
    @Email
    @Column(length = 100)
    private String email;

    @NotBlank
    @Column(length = 120)
    private String password;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(length = 100)
    private String career;

    @Column(length = 500)
    private String enrolledCourses;
}
