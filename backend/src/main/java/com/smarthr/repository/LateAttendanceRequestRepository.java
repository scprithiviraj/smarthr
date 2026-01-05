package com.smarthr.repository;

import com.smarthr.entity.LateAttendanceRequest;
import com.smarthr.entity.RequestStatus;
import com.smarthr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LateAttendanceRequestRepository extends JpaRepository<LateAttendanceRequest, Long> {
    List<LateAttendanceRequest> findByStatus(RequestStatus status);

    Optional<LateAttendanceRequest> findByUserAndDate(User user, LocalDate date);

    List<LateAttendanceRequest> findByUser(User user);
}
