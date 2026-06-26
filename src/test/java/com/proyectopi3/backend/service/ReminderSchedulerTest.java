package com.proyectopi3.backend.service;

import com.proyectopi3.backend.model.*;
import com.proyectopi3.backend.repository.MatchRepository;
import com.proyectopi3.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderSchedulerTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReminderScheduler reminderScheduler;

    @Test
    void testCheckAndSendReminders_OneDayBefore() {
        // Arrange
        Location location = Location.builder().name("Aula 101").build();
        UniversityMatch match = UniversityMatch.builder()
                .id(1L)
                .title("Clase de Cálculo")
                .matchDateTime(LocalDateTime.now().plusHours(23)) // 23 hours in the future (within 24h window)
                .location(location)
                .organizerUsername("diego.alva")
                .reminderOneDaySent(false)
                .reminderOneHourSent(false)
                .build();

        User user = User.builder().username("diego.alva").build();

        when(matchRepository.findAll()).thenReturn(Collections.singletonList(match));
        when(userRepository.findByUsername("diego.alva")).thenReturn(Optional.of(user));

        // Act
        reminderScheduler.checkAndSendReminders();

        // Assert
        verify(notificationService, times(1)).createNotification(
                eq("diego.alva"),
                eq("reserva"),
                contains("1 día"),
                anyString()
        );
        verify(matchRepository, times(1)).save(match);
        assertTrue(match.isReminderOneDaySent());
        assertTrue(!match.isReminderOneHourSent());
    }

    @Test
    void testCheckAndSendReminders_OneHourBefore() {
        // Arrange
        Location location = Location.builder().name("Aula 101").build();
        UniversityMatch match = UniversityMatch.builder()
                .id(2L)
                .title("Clase de Física")
                .matchDateTime(LocalDateTime.now().plusMinutes(45)) // 45 minutes in the future (within 1h window)
                .location(location)
                .organizerUsername("lucia.mendez")
                .reminderOneDaySent(true) // already sent 1 day
                .reminderOneHourSent(false)
                .build();

        User user = User.builder().username("lucia.mendez").build();

        when(matchRepository.findAll()).thenReturn(Collections.singletonList(match));
        when(userRepository.findByUsername("lucia.mendez")).thenReturn(Optional.of(user));

        // Act
        reminderScheduler.checkAndSendReminders();

        // Assert
        verify(notificationService, times(1)).createNotification(
                eq("lucia.mendez"),
                eq("reserva"),
                contains("1 hora"),
                anyString()
        );
        verify(matchRepository, times(1)).save(match);
        assertTrue(match.isReminderOneHourSent());
    }

    @Test
    void testCheckAndSendReminders_AutoComplete() {
        // Arrange
        Location location = Location.builder().name("Aula 101").build();
        UniversityMatch match = UniversityMatch.builder()
                .id(3L)
                .title("Clase de Química")
                .matchDateTime(LocalDateTime.now().minusHours(2)) // 2 hours ago (past the 1 hour duration)
                .location(location)
                .organizerUsername("diego.alva")
                .status(MatchStatus.SCHEDULED)
                .reminderOneDaySent(true)
                .reminderOneHourSent(true)
                .build();

        when(matchRepository.findAll()).thenReturn(Collections.singletonList(match));

        // Act
        reminderScheduler.checkAndSendReminders();

        // Assert
        verify(matchRepository, times(1)).save(match);
        org.junit.jupiter.api.Assertions.assertEquals(MatchStatus.FINISHED, match.getStatus());
    }
}
