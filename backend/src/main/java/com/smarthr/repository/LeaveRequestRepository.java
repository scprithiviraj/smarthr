package com.smarthr.repository;

import com.smarthr.entity.LeaveRequest;
import com.smarthr.entity.LeaveStatus;
import com.smarthr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUser(User user);

    List<LeaveRequest> findByUserId(Long userId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    long countByUserAndStatus(User user, LeaveStatus status);

    long countByStatus(LeaveStatus status);

    List<LeaveRequest> findByUserAndStartDateBetween(User user, java.time.LocalDate startDate,
            java.time.LocalDate endDate);

    List<LeaveRequest> findByStartDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
