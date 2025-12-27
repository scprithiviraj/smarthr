package com.smarthr.repository;

import com.smarthr.entity.Attendance;
import com.smarthr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
        List<Attendance> findByUser(User user);

        Optional<Attendance> findByUserAndDate(User user, LocalDate date);

        List<Attendance> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

        long countByUserAndStatusAndDateBetween(User user, com.smarthr.entity.AttendanceStatus status,
                        LocalDate startDate,
                        LocalDate endDate);

        long countByStatusAndDate(com.smarthr.entity.AttendanceStatus status, LocalDate date);

        long countByStatusAndDateBetween(com.smarthr.entity.AttendanceStatus status, LocalDate startDate,
                        LocalDate endDate);

        List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
