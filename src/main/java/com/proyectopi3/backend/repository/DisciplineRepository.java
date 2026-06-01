package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.Discipline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DisciplineRepository extends JpaRepository<Discipline, Long> {
    Optional<Discipline> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
