package com.proyectopi3.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProfileRequest {
    private String career;
    private List<String> enrolledCourses;
}
