package com.proyectopi3.backend.service;

import com.proyectopi3.backend.model.Notification;
import com.proyectopi3.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(String username) {
        return notificationRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @Transactional
    public Notification createNotification(String username, String type, String title, String description) {
        Notification notification = Notification.builder()
                .username(username)
                .type(type)
                .title(title)
                .description(description)
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push to user via WebSocket
        try {
            String destination = "/topic/notifications/" + username;
            messagingTemplate.convertAndSend(destination, saved);
        } catch (Exception e) {
            System.err.println("Failed to send WebSocket notification to " + username + ": " + e.getMessage());
        }

        return saved;
    }

    @Transactional
    public void markAllAsRead(String username) {
        List<Notification> notifications = notificationRepository.findByUsernameOrderByCreatedAtDesc(username);
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Transactional
    public boolean markAsRead(Long id, String username) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();
            if (n.getUsername().equals(username)) {
                n.setRead(true);
                notificationRepository.save(n);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void clearAll(String username) {
        notificationRepository.deleteByUsername(username);
    }

    @Transactional
    public boolean deleteNotification(Long id, String username) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();
            if (n.getUsername().equals(username)) {
                notificationRepository.delete(n);
                return true;
            }
        }
        return false;
    }
}
