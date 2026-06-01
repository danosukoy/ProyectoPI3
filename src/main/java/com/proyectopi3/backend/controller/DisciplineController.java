package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.DisciplineRequest;
import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.model.Discipline;
import com.proyectopi3.backend.service.DisciplineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/disciplines")
@Tag(name = "Sport Disciplines", description = "Endpoints for managing sports categories and disciplines")
public class DisciplineController {

    @Autowired
    private DisciplineService service;

    @GetMapping
    @Operation(summary = "Get all disciplines", description = "Retrieve all registered sport disciplines.")
    public ResponseEntity<List<Discipline>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get discipline by ID", description = "Retrieve information about a specific discipline.")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        java.util.Optional<Discipline> disciplineOpt = service.getById(id);
        if (disciplineOpt.isPresent()) {
            return ResponseEntity.ok(disciplineOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Discipline not found with ID " + id));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    @Operation(summary = "Create a new discipline", description = "Register a new sport discipline. Restricted to ADMIN and ORGANIZER.")
    public ResponseEntity<?> create(@Valid @RequestBody DisciplineRequest request) {
        try {
            Discipline discipline = service.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(discipline);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    @Operation(summary = "Update an existing discipline", description = "Update information about a discipline. Restricted to ADMIN and ORGANIZER.")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody DisciplineRequest request) {
        try {
            java.util.Optional<Discipline> updatedOpt = service.update(id, request);
            if (updatedOpt.isPresent()) {
                return ResponseEntity.ok(updatedOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Error: Discipline not found with ID " + id));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a discipline", description = "Remove a sport discipline from the database. Restricted to ADMIN.")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);
        if (deleted) {
            return ResponseEntity.ok(new MessageResponse("Discipline deleted successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Discipline not found with ID " + id));
        }
    }
}
