package com.proyectopi3.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyectopi3.backend.dto.*;
import com.proyectopi3.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerUser_Success() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@utec.edu.pe");
        request.setPassword("password123");

        doReturn(ResponseEntity.ok(new MessageResponse("User registered successfully!")))
                .when(authService).registerUser(any(SignupRequest.class));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));
    }

    @Test
    void authenticateUser_Success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        JwtResponse jwtResponse = new JwtResponse("jwtToken", 1L, "testuser", "testuser@utec.edu.pe", "ROLE_PARTICIPANT");
        when(authService.authenticateUser(any(LoginRequest.class))).thenReturn(jwtResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwtToken"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("testuser@utec.edu.pe"))
                .andExpect(jsonPath("$.role").value("ROLE_PARTICIPANT"));
    }

    @Test
    void authenticateGoogleUser_Success() throws Exception {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("mock-google-token");

        JwtResponse jwtResponse = new JwtResponse("jwtToken", 1L, "Nubia Elena", "nubia.elena@utec.edu.pe", "ROLE_PARTICIPANT");
        when(authService.authenticateGoogleUser(any(GoogleLoginRequest.class))).thenReturn(jwtResponse);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwtToken"))
                .andExpect(jsonPath("$.username").value("Nubia Elena"))
                .andExpect(jsonPath("$.email").value("nubia.elena@utec.edu.pe"))
                .andExpect(jsonPath("$.role").value("ROLE_PARTICIPANT"));
    }
}
