package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
