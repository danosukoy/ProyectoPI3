package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.BookingRequest;
import com.proyectopi3.backend.model.*;
import com.proyectopi3.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Transactional(readOnly = true)
    public List<Booking> getAllMatches(String status, Long courseId) {
        List<Booking> matches;

        if (courseId != null) {
            matches = bookingRepository.findByCourseId(courseId);
        } else {
            matches = bookingRepository.findAll();
        }

        if (status != null && !status.trim().isEmpty()) {
            try {
                BookingStatus filterStatus = BookingStatus.valueOf(status.trim().toUpperCase());
                matches = matches.stream()
                        .filter(m -> m.getStatus() == filterStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {
                // Keep matches as is if status is invalid
            }
        }

        return matches;
    }

    @Transactional(readOnly = true)
    public Optional<Booking> getMatchById(Long id) {
        return bookingRepository.findById(id);
    }

    @Transactional
    public Booking createMatch(BookingRequest request) {
        if (request.getBookingDateTime() == null) {
            throw new IllegalArgumentException("La fecha y hora de la reserva no puede estar vacía.");
        }
        if (request.getBookingDateTime().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("No puedes realizar una reserva para una fecha o tiempo anterior al actual.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID " + request.getLocationId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID " + request.getCourseId()));

        StudyGroup homeGroup = studyGroupRepository.findById(request.getHomeGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Home StudyGroup not found with ID " + request.getHomeGroupId()));

        StudyGroup awayGroup = studyGroupRepository.findById(request.getAwayGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Away StudyGroup not found with ID " + request.getAwayGroupId()));

        BookingStatus status;
        try {
            status = BookingStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            status = BookingStatus.SCHEDULED;
        }

        Booking match = Booking.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .bookingDateTime(request.getBookingDateTime())
                .location(location)
                .course(course)
                .homeGroup(homeGroup)
                .awayGroup(awayGroup)
                .homeScore(request.getHomeScore())
                .awayScore(request.getAwayScore())
                .organizer(request.getOrganizer())
                .organizerUsername(request.getOrganizerUsername())
                .status(status)
                .build();

        return bookingRepository.save(match);
    }

    @Transactional
    public Optional<Booking> updateMatch(Long id, BookingRequest request) {
        if (request.getBookingDateTime() == null) {
            throw new IllegalArgumentException("La fecha y hora de la reserva no puede estar vacía.");
        }
        if (request.getBookingDateTime().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("No puedes realizar una reserva para una fecha o tiempo anterior al actual.");
        }

        return bookingRepository.findById(id).map(existingMatch -> {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("Location not found with ID " + request.getLocationId()));

            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("Course not found with ID " + request.getCourseId()));

            StudyGroup homeGroup = studyGroupRepository.findById(request.getHomeGroupId())
                    .orElseThrow(() -> new IllegalArgumentException("Home StudyGroup not found with ID " + request.getHomeGroupId()));

            StudyGroup awayGroup = studyGroupRepository.findById(request.getAwayGroupId())
                    .orElseThrow(() -> new IllegalArgumentException("Away StudyGroup not found with ID " + request.getAwayGroupId()));

            BookingStatus status;
            try {
                status = BookingStatus.valueOf(request.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException | NullPointerException e) {
                status = existingMatch.getStatus();
            }

            existingMatch.setTitle(request.getTitle());
            existingMatch.setDescription(request.getDescription());
            existingMatch.setBookingDateTime(request.getBookingDateTime());
            existingMatch.setLocation(location);
            existingMatch.setCourse(course);
            existingMatch.setHomeGroup(homeGroup);
            existingMatch.setAwayGroup(awayGroup);
            existingMatch.setHomeScore(request.getHomeScore());
            existingMatch.setAwayScore(request.getAwayScore());
            existingMatch.setOrganizer(request.getOrganizer());
            existingMatch.setOrganizerUsername(request.getOrganizerUsername());
            existingMatch.setStatus(status);

            return bookingRepository.save(existingMatch);
        });
    }

    @Transactional
    public Optional<Booking> cancelMatch(Long id, String username, boolean isAdmin) {
        return bookingRepository.findById(id).map(match -> {
            if (!isAdmin && match.getOrganizerUsername() != null && !match.getOrganizerUsername().equals(username)) {
                throw new IllegalArgumentException("No tienes permiso para cancelar esta reserva.");
            }
            match.setStatus(BookingStatus.CANCELLED);
            return bookingRepository.save(match);
        });
    }

    @Transactional
    public boolean deleteMatch(Long id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
