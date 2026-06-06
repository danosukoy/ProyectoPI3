package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.dto.ProfileRequest;
import com.proyectopi3.backend.dto.ProfileResponse;
import com.proyectopi3.backend.dto.RatingRequest;
import com.proyectopi3.backend.model.User;
import com.proyectopi3.backend.model.UserRating;
import com.proyectopi3.backend.repository.UserRepository;
import com.proyectopi3.backend.repository.UserRatingRepository;
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
import java.util.Optional;
import java.util.ArrayList;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile", description = "Endpoints for managing user profiles and ratings")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRatingRepository userRatingRepository;

    private static final List<String> ALLOWED_CAREERS = Arrays.asList(
            "Ciencias de la Computación",
            "Ingeniería Ambiental",
            "Ingeniería Civil",
            "Ingeniería de la Energía",
            "Sistemas de la Información"
    );

    @GetMapping
    @Operation(summary = "Get all user profiles", description = "Retrieves profiles and rating stats for all registered users.")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<User> users = userRepository.findAll();
        List<ProfileResponse> responses = new ArrayList<>();
        
        for (User u : users) {
            List<String> enrolledList = Collections.emptyList();
            if (u.getEnrolledCourses() != null && !u.getEnrolledCourses().trim().isEmpty()) {
                enrolledList = Arrays.asList(u.getEnrolledCourses().split(","));
            }

            // Compute rating stats
            List<UserRating> ratings = userRatingRepository.findByRatedId(u.getId());
            int ratingCount = ratings.size();
            double averageRating = ratingCount > 0 
                    ? ratings.stream().mapToInt(UserRating::getStars).average().orElse(0.0)
                    : 0.0;

            Integer userRating = null;
            if (userDetails != null) {
                Optional<UserRating> urOpt = userRatingRepository.findByRaterIdAndRatedId(userDetails.getId(), u.getId());
                if (urOpt.isPresent()) {
                    userRating = urOpt.get().getStars();
                }
            }

            responses.add(ProfileResponse.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .role(u.getRole().name())
                    .career(u.getCareer())
                    .enrolledCourses(enrolledList)
                    .averageRating(averageRating)
                    .ratingCount(ratingCount)
                    .userRating(userRating)
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

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

        // Compute rating stats
        List<UserRating> ratings = userRatingRepository.findByRatedId(user.getId());
        int ratingCount = ratings.size();
        double averageRating = ratingCount > 0 
                ? ratings.stream().mapToInt(UserRating::getStars).average().orElse(0.0)
                : 0.0;

        ProfileResponse response = ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .career(user.getCareer())
                .enrolledCourses(enrolledList)
                .averageRating(averageRating)
                .ratingCount(ratingCount)
                .userRating(null) // Can't rate oneself
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{username}")
    @Operation(summary = "Get user profile by username", description = "Retrieves profile info and rating stats for a user by their username.")
    public ResponseEntity<?> getUserProfileByUsername(
            @PathVariable String username,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User rated = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        List<String> enrolledList = Collections.emptyList();
        if (rated.getEnrolledCourses() != null && !rated.getEnrolledCourses().trim().isEmpty()) {
            enrolledList = Arrays.asList(rated.getEnrolledCourses().split(","));
        }

        // Compute rating stats
        List<UserRating> ratings = userRatingRepository.findByRatedId(rated.getId());
        int ratingCount = ratings.size();
        double averageRating = ratingCount > 0 
                ? ratings.stream().mapToInt(UserRating::getStars).average().orElse(0.0)
                : 0.0;

        Integer userRating = null;
        if (userDetails != null) {
            Optional<UserRating> urOpt = userRatingRepository.findByRaterIdAndRatedId(userDetails.getId(), rated.getId());
            if (urOpt.isPresent()) {
                userRating = urOpt.get().getStars();
            }
        }

        ProfileResponse response = ProfileResponse.builder()
                .id(rated.getId())
                .username(rated.getUsername())
                .email(rated.getEmail())
                .role(rated.getRole().name())
                .career(rated.getCareer())
                .enrolledCourses(enrolledList)
                .averageRating(averageRating)
                .ratingCount(ratingCount)
                .userRating(userRating)
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

        // Compute rating stats
        List<UserRating> ratings = userRatingRepository.findByRatedId(user.getId());
        int ratingCount = ratings.size();
        double averageRating = ratingCount > 0 
                ? ratings.stream().mapToInt(UserRating::getStars).average().orElse(0.0)
                : 0.0;

        ProfileResponse response = ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .career(user.getCareer())
                .enrolledCourses(enrolledList)
                .averageRating(averageRating)
                .ratingCount(ratingCount)
                .userRating(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "Rate a user", description = "Allows the current user to rate another user (1-5 stars). Only one rating allowed per user pair.")
    public ResponseEntity<?> rateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody RatingRequest request) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }

        if (userDetails.getId().equals(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: No puedes calificarte a ti mismo."));
        }

        User rater = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        User rated = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User to rate not found."));

        if (request.getStars() == null || request.getStars() < 1 || request.getStars() > 5) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: La calificación debe ser entre 1 y 5 estrellas."));
        }

        Optional<UserRating> existingRating = userRatingRepository.findByRaterIdAndRatedId(rater.getId(), rated.getId());
        if (existingRating.isPresent()) {
            UserRating rating = existingRating.get();
            rating.setStars(request.getStars());
            userRatingRepository.save(rating);
        } else {
            UserRating newRating = UserRating.builder()
                    .rater(rater)
                    .rated(rated)
                    .stars(request.getStars())
                    .build();
            userRatingRepository.save(newRating);
        }

        return ResponseEntity.ok(new MessageResponse("¡Calificación registrada correctamente!"));
    }
}
