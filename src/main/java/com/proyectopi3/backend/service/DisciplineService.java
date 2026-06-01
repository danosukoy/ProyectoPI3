package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.DisciplineRequest;
import com.proyectopi3.backend.model.Discipline;
import com.proyectopi3.backend.repository.DisciplineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DisciplineService {
    @Autowired
    private DisciplineRepository repository;

    @Transactional(readOnly = true)
    public List<Discipline> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Discipline> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Discipline create(DisciplineRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Discipline with name '" + request.getName() + "' already exists");
        }
        Discipline discipline = Discipline.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return repository.save(discipline);
    }

    @Transactional
    public Optional<Discipline> update(Long id, DisciplineRequest request) {
        return repository.findById(id).map(existing -> {
            if (!existing.getName().equalsIgnoreCase(request.getName()) &&
                    repository.existsByNameIgnoreCase(request.getName())) {
                throw new IllegalArgumentException("Discipline with name '" + request.getName() + "' already exists");
            }
            existing.setName(request.getName());
            existing.setDescription(request.getDescription());
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
