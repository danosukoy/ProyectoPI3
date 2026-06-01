package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByUniversityIgnoreCase(String university);
    boolean existsByNameIgnoreCaseAndUniversityIgnoreCase(String name, String university);
}
