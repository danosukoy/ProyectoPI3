package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.StudyGroupRequest;
import com.proyectopi3.backend.model.StudyGroup;
import com.proyectopi3.backend.repository.StudyGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class StudyGroupService {
    @Autowired
    private StudyGroupRepository repository;

    @Transactional(readOnly = true)
    public List<StudyGroup> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<StudyGroup> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public StudyGroup create(StudyGroupRequest request) {
        if (repository.existsByNameIgnoreCaseAndCourseNameIgnoreCase(request.getName(), request.getCourseName())) {
            throw new IllegalArgumentException("StudyGroup '" + request.getName() + "' for course '" + request.getCourseName() + "' already exists");
        }
        StudyGroup team = StudyGroup.builder()
                .name(request.getName())
                .courseName(request.getCourseName())
                .type(request.getType() != null ? request.getType() : "normal")
                .subaula(request.getSubaula())
                .build();
        return repository.save(team);
    }

    @Transactional
    public Optional<StudyGroup> update(Long id, StudyGroupRequest request) {
        return repository.findById(id).map(existing -> {
            boolean matchesExisting = existing.getName().equalsIgnoreCase(request.getName()) &&
                    existing.getCourseName().equalsIgnoreCase(request.getCourseName());
            if (!matchesExisting &&
                    repository.existsByNameIgnoreCaseAndCourseNameIgnoreCase(request.getName(), request.getCourseName())) {
                throw new IllegalArgumentException("StudyGroup '" + request.getName() + "' for course '" + request.getCourseName() + "' already exists");
            }
            existing.setName(request.getName());
            existing.setCourseName(request.getCourseName());
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
