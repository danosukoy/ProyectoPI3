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
                .status(status)
                .build();

        return matchRepository.save(match);
    }

    @Transactional
    public Optional<UniversityMatch> updateMatch(Long id, MatchRequest request) {
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
            existingMatch.setStatus(status);

            return matchRepository.save(existingMatch);
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
