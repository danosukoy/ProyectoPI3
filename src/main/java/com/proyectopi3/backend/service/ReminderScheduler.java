package com.proyectopi3.backend.service;

import com.proyectopi3.backend.model.UniversityMatch;
import com.proyectopi3.backend.model.User;
import com.proyectopi3.backend.repository.MatchRepository;
import com.proyectopi3.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Component
public class ReminderScheduler {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(fixedRate = 10000) // Runs every 10 seconds
    public void checkAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<UniversityMatch> matches = matchRepository.findAll();

        for (UniversityMatch match : matches) {
            LocalDateTime matchTime = match.getMatchDateTime();
            if (matchTime == null) continue;

            // 1. One Day Reminder (24 hours before match time)
            if (!match.isReminderOneDaySent()) {
                LocalDateTime oneDayBeforeStart = matchTime.minusDays(1);
                LocalDateTime oneDayBeforeEnd = matchTime.minusDays(1).plusHours(2);
                // If we are within the 2-hour window after the 24-hour mark
                if (now.isAfter(oneDayBeforeStart) && now.isBefore(oneDayBeforeEnd)) {
                    sendReminder(match, "Recordatorio de Reserva (1 día)", 
                            "Tu reserva de " + match.getTitle() + " en " + 
                            match.getLocation().getName() + " está programada para mañana a las " + 
                            matchTime.format(TIME_FORMATTER) + ".");
                    match.setReminderOneDaySent(true);
                    matchRepository.save(match);
                }
            }

            // 2. One Hour Reminder (1 hour before match time)
            if (!match.isReminderOneHourSent()) {
                LocalDateTime oneHourBeforeStart = matchTime.minusHours(1);
                // If we are within the 1-hour window before the match start time
                if (now.isAfter(oneHourBeforeStart) && now.isBefore(matchTime)) {
                    sendReminder(match, "Recordatorio de Reserva (1 hora)", 
                            "Tu reserva de " + match.getTitle() + " en " + 
                            match.getLocation().getName() + " comienza en menos de una hora (a las " + 
                            matchTime.format(TIME_FORMATTER) + ").");
                    match.setReminderOneHourSent(true);
                    matchRepository.save(match);
                }
            }

            // 3. Auto-complete reservation once the hour ends
            if (match.getStatus() == com.proyectopi3.backend.model.MatchStatus.SCHEDULED || match.getStatus() == com.proyectopi3.backend.model.MatchStatus.ONGOING) {
                LocalDateTime endOfReservation = matchTime.plusHours(1);
                if (now.isAfter(endOfReservation)) {
                    match.setStatus(com.proyectopi3.backend.model.MatchStatus.FINISHED);
                    matchRepository.save(match);
                    System.out.println("Reservation '" + match.getTitle() + "' auto-completed (hour ended).");
                }
            }
        }
    }

    private void sendReminder(UniversityMatch match, String title, String description) {
        Optional<User> userOpt = Optional.empty();
        String organizerUsername = match.getOrganizerUsername();
        if (organizerUsername != null && !organizerUsername.trim().isEmpty()) {
            userOpt = userRepository.findByUsername(organizerUsername);
        }
        if (userOpt.isEmpty()) {
            String organizer = match.getOrganizer();
            userOpt = findUserByOrganizer(organizer);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            notificationService.createNotification(
                    user.getUsername(),
                    "reserva",
                    title,
                    description
            );
            System.out.println("Reminder '" + title + "' sent successfully to user: " + user.getUsername());
        } else {
            // If the organizer cannot be mapped to a specific user, we broadcast or log it
            System.err.println("Could not find registered user for organizer: " + match.getOrganizer() + " (username: " + organizerUsername + "). Reminder not sent.");
        }
    }

    private Optional<User> findUserByOrganizer(String organizer) {
        if (organizer == null || organizer.trim().isEmpty()) return Optional.empty();

        // 1. Exact match in username
        Optional<User> uOpt = userRepository.findByUsername(organizer);
        if (uOpt.isPresent()) return uOpt;

        // 2. Normalized match (e.g. "Nubia Elena" -> "nubia.elena")
        String normalized = organizer.toLowerCase().trim().replace(" ", ".");
        uOpt = userRepository.findByUsername(normalized);
        if (uOpt.isPresent()) return uOpt;

        // 3. Compare formatted names
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (formatName(u.getUsername()).equalsIgnoreCase(organizer)) {
                return Optional.of(u);
            }
        }

        return Optional.empty();
    }

    private String formatName(String name) {
        if (name == null) return "";
        String[] parts = name.split("[\\s._\\-]+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                  .append(part.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}
