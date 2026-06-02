package com.proyectopi3.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proyectopi3.backend.dto.DisciplineRequest;
import com.proyectopi3.backend.model.Discipline;
import com.proyectopi3.backend.service.DisciplineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DisciplineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DisciplineService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "user", roles = {"PARTICIPANT"})
    void getAll_Success() throws Exception {
        Discipline d1 = new Discipline(1L, "Football", "11v11 match");
        Discipline d2 = new Discipline(2L, "Basketball", "5v5 match");
        when(service.getAll()).thenReturn(Arrays.asList(d1, d2));

        mockMvc.perform(get("/api/disciplines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Football"))
                .andExpect(jsonPath("$[1].name").value("Basketball"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"PARTICIPANT"})
    void getById_Found() throws Exception {
        Discipline discipline = new Discipline(1L, "Football", "11v11 match");
        when(service.getById(1L)).thenReturn(Optional.of(discipline));

        mockMvc.perform(get("/api/disciplines/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Football"))
                .andExpect(jsonPath("$.description").value("11v11 match"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"PARTICIPANT"})
    void getById_NotFound() throws Exception {
        when(service.getById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/disciplines/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Error: Discipline not found with ID 99"));
    }

    @Test
    @WithMockUser(username = "organizer", roles = {"ORGANIZER"})
    void create_Success_AsOrganizer() throws Exception {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("Tennis");
        request.setDescription("1v1 match");

        Discipline created = new Discipline(1L, "Tennis", "1v1 match");
        when(service.create(any(DisciplineRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/disciplines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Tennis"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"PARTICIPANT"})
    void create_Forbidden_AsParticipant() throws Exception {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("Tennis");
        request.setDescription("1v1 match");

        mockMvc.perform(post("/api/disciplines")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void update_Success_AsAdmin() throws Exception {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("Tennis");
        request.setDescription("1v1 match");

        Discipline updated = new Discipline(1L, "Tennis", "1v1 match");
        when(service.update(eq(1L), any(DisciplineRequest.class))).thenReturn(Optional.of(updated));

        mockMvc.perform(put("/api/disciplines/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tennis"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void delete_Success_AsAdmin() throws Exception {
        when(service.delete(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/disciplines/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Discipline deleted successfully!"));
    }

    @Test
    @WithMockUser(username = "organizer", roles = {"ORGANIZER"})
    void delete_Forbidden_AsOrganizer() throws Exception {
        mockMvc.perform(delete("/api/disciplines/1"))
                .andExpect(status().isForbidden());
    }
}
