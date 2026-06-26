package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.MatchRequest;
import com.proyectopi3.backend.model.*;
import com.proyectopi3.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private DisciplineRepository disciplineRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<UniversityMatch> getAllMatches(String status, Long disciplineId) {
        List<UniversityMatch> matches;

        if (disciplineId != null) {
            matches = matchRepository.findByDisciplineId(disciplineId);
        } else {
            matches = matchRepository.findAll();
        }

        if (status != null && !status.trim().isEmpty()) {
            try {
                MatchStatus filterStatus = MatchStatus.valueOf(status.trim().toUpperCase());
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
    public Optional<UniversityMatch> getMatchById(Long id) {
        return matchRepository.findById(id);
    }

    @Transactional
    public UniversityMatch createMatch(MatchRequest request) {
        if (request.getMatchDateTime() == null) {
            throw new IllegalArgumentException("La fecha y hora de la reserva no puede estar vacía.");
        }
        if (request.getMatchDateTime().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("No puedes realizar una reserva para una fecha o tiempo anterior al actual.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Location not found with ID " + request.getLocationId()));

        Discipline discipline = disciplineRepository.findById(request.getDisciplineId())
                .orElseThrow(() -> new IllegalArgumentException("Discipline not found with ID " + request.getDisciplineId()));

        Team homeTeam = teamRepository.findById(request.getHomeTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Home Team not found with ID " + request.getHomeTeamId()));

        Team awayTeam = teamRepository.findById(request.getAwayTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Away Team not found with ID " + request.getAwayTeamId()));

        MatchStatus status;
        try {
            status = MatchStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            status = MatchStatus.SCHEDULED;
        }

        UniversityMatch match = UniversityMatch.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .matchDateTime(request.getMatchDateTime())
                .location(location)
                .discipline(discipline)
                .homeTeam(homeTeam)
                .awayTeam(awayTeam)
                .homeScore(request.getHomeScore())
                .awayScore(request.getAwayScore())
                .organizer(request.getOrganizer())
                .organizerUsername(request.getOrganizerUsername())
                .status(status)
                .build();

        return matchRepository.save(match);
    }

    @Transactional
    public Optional<UniversityMatch> updateMatch(Long id, MatchRequest request) {
        if (request.getMatchDateTime() == null) {
            throw new IllegalArgumentException("La fecha y hora de la reserva no puede estar vacía.");
        }
        if (request.getMatchDateTime().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("No puedes realizar una reserva para una fecha o tiempo anterior al actual.");
        }

        return matchRepository.findById(id).map(existingMatch -> {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("Location not found with ID " + request.getLocationId()));

            Discipline discipline = disciplineRepository.findById(request.getDisciplineId())
                    .orElseThrow(() -> new IllegalArgumentException("Discipline not found with ID " + request.getDisciplineId()));

            Team homeTeam = teamRepository.findById(request.getHomeTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("Home Team not found with ID " + request.getHomeTeamId()));

            Team awayTeam = teamRepository.findById(request.getAwayTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("Away Team not found with ID " + request.getAwayTeamId()));

            MatchStatus status;
            try {
                status = MatchStatus.valueOf(request.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException | NullPointerException e) {
                status = existingMatch.getStatus();
            }

            existingMatch.setTitle(request.getTitle());
            existingMatch.setDescription(request.getDescription());
            existingMatch.setMatchDateTime(request.getMatchDateTime());
            existingMatch.setLocation(location);
            existingMatch.setDiscipline(discipline);
            existingMatch.setHomeTeam(homeTeam);
            existingMatch.setAwayTeam(awayTeam);
            existingMatch.setHomeScore(request.getHomeScore());
            existingMatch.setAwayScore(request.getAwayScore());
            existingMatch.setOrganizer(request.getOrganizer());
            existingMatch.setOrganizerUsername(request.getOrganizerUsername());
            existingMatch.setStatus(status);

            return matchRepository.save(existingMatch);
        });
    }

    @Transactional
    public Optional<UniversityMatch> cancelMatch(Long id, String username, boolean isAdmin) {
        return matchRepository.findById(id).map(match -> {
            if (!isAdmin && match.getOrganizerUsername() != null && !match.getOrganizerUsername().equals(username)) {
                throw new IllegalArgumentException("No tienes permiso para cancelar esta reserva.");
            }
            match.setStatus(MatchStatus.CANCELLED);
            return matchRepository.save(match);
        });
    }

    @Transactional
    public boolean deleteMatch(Long id) {
        if (matchRepository.existsById(id)) {
            matchRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
