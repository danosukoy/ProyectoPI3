package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.BookingRequest;
import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.model.Booking;
import com.proyectopi3.backend.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.proyectopi3.backend.security.CustomUserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
@Tag(name = "University Matches", description = "Endpoints for managing university sports events and matches")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get all matches", description = "Retrieve all matches, optionally filtered by status (e.g., SCHEDULED, ONGOING, FINISHED, CANCELLED) or courseId.")
    public ResponseEntity<List<Booking>> getAllMatches(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long courseId) {
        List<Booking> matches = bookingService.getAllMatches(status, courseId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get match by ID", description = "Retrieve detailed information about a specific match.")
    public ResponseEntity<?> getMatchById(@PathVariable Long id) {
        java.util.Optional<Booking> matchOpt = bookingService.getMatchById(id);
        if (matchOpt.isPresent()) {
            return ResponseEntity.ok(matchOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Match not found with ID " + id));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('PARTICIPANT')")
    @Operation(summary = "Create a new match", description = "Create a new sports event. Restricted to ADMIN, ORGANIZER, and PARTICIPANT roles.")
    public ResponseEntity<?> createMatch(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest matchRequest) {
        try {
            if (userDetails != null) {
                matchRequest.setOrganizerUsername(userDetails.getUsername());
            }
            Booking match = bookingService.createMatch(matchRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(match);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('PARTICIPANT')")
    @Operation(summary = "Update an existing match", description = "Update details of a match. Restricted to ADMIN, ORGANIZER, and PARTICIPANT roles.")
    public ResponseEntity<?> updateMatch(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest matchRequest) {
        try {
            if (userDetails != null) {
                matchRequest.setOrganizerUsername(userDetails.getUsername());
            }
            java.util.Optional<Booking> updatedOpt = bookingService.updateMatch(id, matchRequest);
            if (updatedOpt.isPresent()) {
                return ResponseEntity.ok(updatedOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Error: Match not found with ID " + id));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('PARTICIPANT')")
    @Operation(summary = "Cancel a match/booking", description = "Allows the organizer or an admin to cancel a scheduled booking.")
    public ResponseEntity<?> cancelMatch(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String username = userDetails != null ? userDetails.getUsername() : "";
            boolean isAdmin = userDetails != null && userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            java.util.Optional<Booking> cancelledMatch = bookingService.cancelMatch(id, username, isAdmin);
            if (cancelledMatch.isPresent()) {
                return ResponseEntity.ok(cancelledMatch.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Error: Match not found with ID " + id));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a match", description = "Remove a sports event from the database. Restricted to ADMIN role only.")
    public ResponseEntity<?> deleteMatch(@PathVariable Long id) {
        boolean deleted = bookingService.deleteMatch(id);
        if (deleted) {
            return ResponseEntity.ok(new MessageResponse("Match deleted successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: Match not found with ID " + id));
        }
    }
}
