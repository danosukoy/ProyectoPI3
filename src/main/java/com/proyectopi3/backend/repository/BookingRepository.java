package com.proyectopi3.backend.repository;

import com.proyectopi3.backend.model.BookingStatus;
import com.proyectopi3.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByCourseId(Long courseId);
}
