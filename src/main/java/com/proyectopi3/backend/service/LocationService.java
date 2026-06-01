package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.LocationRequest;
import com.proyectopi3.backend.model.Location;
import com.proyectopi3.backend.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class LocationService {
    @Autowired
    private LocationRepository repository;

    @Transactional(readOnly = true)
    public List<Location> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Location> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Location create(LocationRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Location with name '" + request.getName() + "' already exists");
        }
        Location location = Location.builder()
                .name(request.getName())
                .address(request.getAddress())
                .build();
        return repository.save(location);
    }

    @Transactional
    public Optional<Location> update(Long id, LocationRequest request) {
        return repository.findById(id).map(existing -> {
            if (!existing.getName().equalsIgnoreCase(request.getName()) &&
                    repository.existsByNameIgnoreCase(request.getName())) {
                throw new IllegalArgumentException("Location with name '" + request.getName() + "' already exists");
            }
            existing.setName(request.getName());
            existing.setAddress(request.getAddress());
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
