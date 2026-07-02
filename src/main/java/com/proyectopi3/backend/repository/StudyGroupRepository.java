package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findByCourseNameIgnoreCase(String courseName);
    boolean existsByNameIgnoreCaseAndCourseNameIgnoreCase(String name, String courseName);
}
