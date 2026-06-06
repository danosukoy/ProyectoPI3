package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.UserRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRatingRepository extends JpaRepository<UserRating, Long> {
    List<UserRating> findByRatedId(Long ratedId);
    Optional<UserRating> findByRaterIdAndRatedId(Long raterId, Long ratedId);
}
