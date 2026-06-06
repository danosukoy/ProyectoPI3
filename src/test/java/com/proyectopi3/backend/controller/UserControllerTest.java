package com.proyectopi3.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyectopi3.backend.dto.ProfileRequest;
import com.proyectopi3.backend.model.Role;
import com.proyectopi3.backend.model.User;
import com.proyectopi3.backend.repository.UserRepository;
import com.proyectopi3.backend.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getUserProfile_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getUserProfile_Success() throws Exception {
        CustomUserDetails principal = new CustomUserDetails(
                1L, "testuser", "testuser@utec.edu.pe", "password", java.util.Collections.emptyList()
        );

        User userEntity = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@utec.edu.pe")
                .password("password")
                .role(Role.ROLE_PARTICIPANT)
                .career("Ciencias de la Computación")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));

        mockMvc.perform(get("/api/users/profile").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("testuser@utec.edu.pe"))
                .andExpect(jsonPath("$.career").value("Ciencias de la Computación"));
    }

    @Test
    void updateUserProfile_Success() throws Exception {
        CustomUserDetails principal = new CustomUserDetails(
                1L, "testuser", "testuser@utec.edu.pe", "password", java.util.Collections.emptyList()
        );

        User userEntity = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@utec.edu.pe")
                .password("password")
                .role(Role.ROLE_PARTICIPANT)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileRequest request = new ProfileRequest();
        request.setCareer("Ciencias de la Computación");

        mockMvc.perform(put("/api/users/profile")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.career").value("Ciencias de la Computación"));
    }

    @Test
    void updateUserProfile_InvalidCareer() throws Exception {
        CustomUserDetails principal = new CustomUserDetails(
                1L, "testuser", "testuser@utec.edu.pe", "password", java.util.Collections.emptyList()
        );

        User userEntity = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@utec.edu.pe")
                .password("password")
                .role(Role.ROLE_PARTICIPANT)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));

        ProfileRequest request = new ProfileRequest();
        request.setCareer("Invalid Career Name");

        mockMvc.perform(put("/api/users/profile")
                        .with(user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: La carrera seleccionada no es válida."));
    }
}
