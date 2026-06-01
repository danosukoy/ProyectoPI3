package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.MatchStatus;
import com.proyectopi3.backend.model.UniversityMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<UniversityMatch, Long> {
    List<UniversityMatch> findByStatus(MatchStatus status);
    List<UniversityMatch> findByDisciplineId(Long disciplineId);
}
