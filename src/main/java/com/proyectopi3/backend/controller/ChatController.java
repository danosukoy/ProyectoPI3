package com.proyectopi3.backend.controller;

import com.proyectopi3.backend.model.ChatMessage;
import com.proyectopi3.backend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat/{groupId}/sendMessage")
    @SendTo("/topic/group/{groupId}")
    public ChatMessage sendGroupMessage(@DestinationVariable String groupId, @Payload ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }
    
    @GetMapping("/api/chat/{groupId}/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@PathVariable String groupId) {
        return chatMessageRepository.findByGroupIdOrderByIdAsc(groupId);
    }
}
