package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.CourseRequest;
import com.proyectopi3.backend.model.Course;
import com.proyectopi3.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    @Autowired
    private CourseRepository repository;

    @Transactional(readOnly = true)
    public List<Course> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Course> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Course create(CourseRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Course with name '" + request.getName() + "' already exists");
        }
        Course discipline = Course.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return repository.save(discipline);
    }

    @Transactional
    public Optional<Course> update(Long id, CourseRequest request) {
        return repository.findById(id).map(existing -> {
            if (!existing.getName().equalsIgnoreCase(request.getName()) &&
                    repository.existsByNameIgnoreCase(request.getName())) {
                throw new IllegalArgumentException("Course with name '" + request.getName() + "' already exists");
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
