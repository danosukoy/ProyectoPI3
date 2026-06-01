package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.GoogleLoginRequest;
import com.proyectopi3.backend.dto.JwtResponse;
import com.proyectopi3.backend.dto.LoginRequest;
import com.proyectopi3.backend.dto.SignupRequest;
import com.proyectopi3.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and login")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with specified username, email, password and optional role.")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return authService.registerUser(signUpRequest);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token", description = "Logs in user with credentials and returns a Bearer token required for secured endpoints.")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google ID Token", description = "Verifies Google ID Token, registers user if first login, and returns JWT.")
    public ResponseEntity<JwtResponse> authenticateGoogleUser(@Valid @RequestBody GoogleLoginRequest googleLoginRequest) {
        JwtResponse jwtResponse = authService.authenticateGoogleUser(googleLoginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
}
