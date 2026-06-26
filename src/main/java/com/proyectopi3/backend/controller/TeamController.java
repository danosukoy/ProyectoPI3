package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.dto.TeamRequest;
import com.proyectopi3.backend.model.Team;
import com.proyectopi3.backend.service.TeamService;
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
@RequestMapping("/api/teams")
@Tag(name = "University Teams", description = "Endpoints for managing college teams and clubs")
public class TeamController {

    @Autowired
    private TeamService service;

    @GetMapping
    @Operation(summary = "Get all teams", description = "Retrieve all registered university teams.")
    public ResponseEntity<List<Team>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get team by ID", description = "Retrieve information about a specific university team.")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        java.util.Optional<Team> teamOpt = service.getById(id);
        if (teamOpt.isPresent()) {
            return ResponseEntity.ok(teamOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Team not found with ID " + id));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('PARTICIPANT')")
    @Operation(summary = "Create a new team", description = "Register a new university team. Restricted to ADMIN, ORGANIZER, and PARTICIPANT.")
    public ResponseEntity<?> create(@Valid @RequestBody TeamRequest request) {
        try {
            Team team = service.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(team);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('PARTICIPANT')")
    @Operation(summary = "Update an existing team", description = "Update information about a university team. Restricted to ADMIN, ORGANIZER, and PARTICIPANT.")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody TeamRequest request) {
        try {
            java.util.Optional<Team> updatedOpt = service.update(id, request);
            if (updatedOpt.isPresent()) {
                return ResponseEntity.ok(updatedOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Error: Team not found with ID " + id));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a team", description = "Remove a university team from the database. Restricted to ADMIN.")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);
        if (deleted) {
            return ResponseEntity.ok(new MessageResponse("Team deleted successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Team not found with ID " + id));
        }
    }
}
