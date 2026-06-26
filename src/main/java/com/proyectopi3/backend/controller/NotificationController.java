package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.dto.NotificationRequest;
import com.proyectopi3.backend.model.Notification;
import com.proyectopi3.backend.security.CustomUserDetails;
import com.proyectopi3.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for managing user notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Retrieve all notifications for the authenticated user ordered by date.")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Notification> notifications = notificationService.getNotificationsForUser(userDetails.getUsername());
        return ResponseEntity.ok(notifications);
    }

    @PostMapping
    @Operation(summary = "Create notification", description = "Create a new notification for the authenticated user and push it via WebSocket.")
    public ResponseEntity<?> createNotification(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody NotificationRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Notification notification = notificationService.createNotification(
                userDetails.getUsername(),
                request.getType(),
                request.getTitle(),
                request.getDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @PutMapping("/mark-read")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications for the authenticated user as read.")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read."));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read", description = "Mark a specific notification as read.")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean success = notificationService.markAsRead(id, userDetails.getUsername());
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Notification marked as read."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Notification not found or access denied."));
        }
    }

    @DeleteMapping
    @Operation(summary = "Clear all notifications", description = "Delete all notifications for the authenticated user.")
    public ResponseEntity<?> clearAll(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        notificationService.clearAll(userDetails.getUsername());
        return ResponseEntity.ok(new MessageResponse("All notifications deleted."));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification", description = "Delete a specific notification.")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean success = notificationService.deleteNotification(id, userDetails.getUsername());
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Notification deleted."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Notification not found or access denied."));
        }
    }
}
