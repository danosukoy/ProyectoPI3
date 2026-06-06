package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.TeamRequest;
import com.proyectopi3.backend.model.Team;
import com.proyectopi3.backend.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class TeamService {
    @Autowired
    private TeamRepository repository;

    @Transactional(readOnly = true)
    public List<Team> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Team> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Team create(TeamRequest request) {
        if (repository.existsByNameIgnoreCaseAndUniversityIgnoreCase(request.getName(), request.getUniversity())) {
            throw new IllegalArgumentException("Team '" + request.getName() + "' at university '" + request.getUniversity() + "' already exists");
        }
        Team team = Team.builder()
                .name(request.getName())
                .university(request.getUniversity())
                .type(request.getType() != null ? request.getType() : "normal")
                .subaula(request.getSubaula())
                .build();
        return repository.save(team);
    }

    @Transactional
    public Optional<Team> update(Long id, TeamRequest request) {
        return repository.findById(id).map(existing -> {
            boolean matchesExisting = existing.getName().equalsIgnoreCase(request.getName()) &&
                    existing.getUniversity().equalsIgnoreCase(request.getUniversity());
            if (!matchesExisting &&
                    repository.existsByNameIgnoreCaseAndUniversityIgnoreCase(request.getName(), request.getUniversity())) {
                throw new IllegalArgumentException("Team '" + request.getName() + "' at university '" + request.getUniversity() + "' already exists");
            }
            existing.setName(request.getName());
            existing.setUniversity(request.getUniversity());
            if (request.getType() != null) {
                existing.setType(request.getType());
            }
            existing.setSubaula(request.getSubaula());
            return repository.save(existing);
        });
    }

    @Transactional
    public boolean delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}
