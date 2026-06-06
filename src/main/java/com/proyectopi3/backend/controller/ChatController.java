package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat/{groupId}/sendMessage")
    @SendTo("/topic/group/{groupId}")
    public ChatMessage sendGroupMessage(@DestinationVariable String groupId, @Payload ChatMessage chatMessage) {
        return chatMessage;
    }
}
