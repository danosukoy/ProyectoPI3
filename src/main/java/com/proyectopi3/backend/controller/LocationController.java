package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.LocationRequest;
import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.model.Location;
import com.proyectopi3.backend.service.LocationService;
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
@RequestMapping("/api/locations")
@Tag(name = "Match Locations", description = "Endpoints for managing venues and match locations")
public class LocationController {

    @Autowired
    private LocationService service;

    @GetMapping
    @Operation(summary = "Get all locations", description = "Retrieve all registered match locations/venues.")
    public ResponseEntity<List<Location>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get location by ID", description = "Retrieve information about a specific location/venue.")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        java.util.Optional<Location> locationOpt = service.getById(id);
        if (locationOpt.isPresent()) {
            return ResponseEntity.ok(locationOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Location not found with ID " + id));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    @Operation(summary = "Create a new location", description = "Register a new location/venue. Restricted to ADMIN and ORGANIZER.")
    public ResponseEntity<?> create(@Valid @RequestBody LocationRequest request) {
        try {
            Location location = service.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(location);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    @Operation(summary = "Update an existing location", description = "Update information about a location. Restricted to ADMIN and ORGANIZER.")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody LocationRequest request) {
        try {
            java.util.Optional<Location> updatedOpt = service.update(id, request);
            if (updatedOpt.isPresent()) {
                return ResponseEntity.ok(updatedOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Error: Location not found with ID " + id));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a location", description = "Remove a location/venue from the database. Restricted to ADMIN.")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);
        if (deleted) {
            return ResponseEntity.ok(new MessageResponse("Location deleted successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Location not found with ID " + id));
        }
    }
}
