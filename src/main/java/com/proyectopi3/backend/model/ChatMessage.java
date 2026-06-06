package com.proyectopi3.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    private String id;
    private String sender;
    private String text;
    private String time;
    
    @Transient
    private boolean isMe;
    
    private String groupId;

    @org.hibernate.annotations.CreationTimestamp
    private java.time.LocalDateTime createdAt;
}
