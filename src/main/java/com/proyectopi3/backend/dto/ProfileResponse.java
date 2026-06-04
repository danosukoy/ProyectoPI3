package com.proyectopi3.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String career;
    private List<String> enrolledCourses;
    private Double averageRating;
    private Integer ratingCount;
    private Integer userRating; // Rating given by the requesting user, if any
}
