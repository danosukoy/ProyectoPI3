package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.dto.ProfileRequest;
import com.proyectopi3.backend.dto.ProfileResponse;
import com.proyectopi3.backend.model.User;
import com.proyectopi3.backend.repository.UserRepository;
import com.proyectopi3.backend.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Collections;
import java.util.ArrayList;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile", description = "Endpoints for managing user profiles and settings")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private static final List<String> ALLOWED_CAREERS = Arrays.asList(
            "Ciencias de la Computación",
            "Ingeniería Ambiental",
            "Ingeniería Civil",
            "Ingeniería de la Energía",
            "Sistemas de la Información"
    );

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Retrieves profile information for the currently authenticated user.")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        List<String> enrolledList = Collections.emptyList();
        if (user.getEnrolledCourses() != null && !user.getEnrolledCourses().trim().isEmpty()) {
            enrolledList = Arrays.asList(user.getEnrolledCourses().split(","));
        }

        ProfileResponse response = ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .career(user.getCareer())
                .enrolledCourses(enrolledList)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user career", description = "Updates the career of the currently authenticated user.")
    public ResponseEntity<?> updateUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ProfileRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Only update career if provided in the request
        if (request.getCareer() != null) {
            String career = request.getCareer();
            if (!career.trim().isEmpty()) {
                if (!ALLOWED_CAREERS.contains(career)) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Error: La carrera seleccionada no es válida."));
                }
                user.setCareer(career);
            } else {
                user.setCareer(null);
            }
        }

        // Update enrolled courses if provided in the request
        if (request.getEnrolledCourses() != null) {
            if (request.getEnrolledCourses().isEmpty()) {
                user.setEnrolledCourses(null);
            } else {
                String enrolledStr = String.join(",", request.getEnrolledCourses());
                user.setEnrolledCourses(enrolledStr);
            }
        }

        userRepository.save(user);

        List<String> enrolledList = Collections.emptyList();
        if (user.getEnrolledCourses() != null && !user.getEnrolledCourses().trim().isEmpty()) {
            enrolledList = Arrays.asList(user.getEnrolledCourses().split(","));
        }

        ProfileResponse response = ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .career(user.getCareer())
                .enrolledCourses(enrolledList)
                .build();

        return ResponseEntity.ok(response);
    }
}
