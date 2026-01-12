package com.smarthr.service;

import com.smarthr.entity.Attendance;
import com.smarthr.entity.AttendanceStatus;
import com.smarthr.entity.User;
import com.smarthr.repository.AttendanceRepository;
import com.smarthr.repository.UserRepository;
import com.smarthr.repository.LateAttendanceRequestRepository;
import com.smarthr.entity.LateAttendanceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    AttendanceRepository attendanceRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LateAttendanceRequestRepository lateAttendanceRequestRepository;

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Kolkata");

    public Attendance checkIn(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate today = LocalDate.now(ZONE_ID);

        Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, today);
        if (existing.isPresent()) {
            throw new RuntimeException("Already checked in or attendance record exists for today");
        }

        LocalDateTime now = LocalDateTime.now(ZONE_ID);
        // Check Late Logic (Threshold: 9:05 AM)
        if (now.toLocalTime().isAfter(java.time.LocalTime.of(9, 5))) {
            // Check if approved request exists
            Optional<LateAttendanceRequest> request = lateAttendanceRequestRepository.findByUserAndDate(user, today);
            if (request.isPresent()) {
                if (request.get().getStatus() == com.smarthr.entity.RequestStatus.PENDING) {
                    throw new RuntimeException("LATE_APPROVAL_PENDING");
                } else if (request.get().getStatus() == com.smarthr.entity.RequestStatus.REJECTED) {
                    throw new RuntimeException("LATE_REQUEST_REJECTED");
                }
                // If APPROVED, proceed.
            } else {
                // No request found -> Block
                throw new RuntimeException("LATE_APPROVAL_REQUIRED");
            }
        }

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setDate(today);
        attendance.setClockInTime(now);

        // Check-in Rules
        if (now.toLocalTime().isAfter(java.time.LocalTime.of(9, 5))) {
            attendance.setStatus(AttendanceStatus.LATE);
        } else {
            attendance.setStatus(AttendanceStatus.PRESENT);
        }

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate today = LocalDate.now(ZONE_ID);

        Attendance attendance = attendanceRepository.findByUserAndDate(user, today)
                .orElseThrow(() -> new RuntimeException("No attendance record found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new RuntimeException("Already checked out");
        }

        LocalDateTime now = LocalDateTime.now(ZONE_ID);
        attendance.setClockOutTime(now);

        // Calculate total hours
        long seconds = Duration.between(attendance.getClockInTime(), attendance.getClockOutTime()).getSeconds();
        attendance.setTotalHours(seconds / 3600.0);

        // Check-out Status Update Rules
        // Preserve LATE status if it was already late
        if (attendance.getStatus() != AttendanceStatus.LATE) {
            if (now.toLocalTime().isBefore(java.time.LocalTime.of(18, 0))) {
                attendance.setStatus(AttendanceStatus.HALF_DAY);
            } else {
                if (attendance.getStatus() == null) {
                    attendance.setStatus(AttendanceStatus.PRESENT);
                }
            }
        }

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getUserHistory(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return attendanceRepository.findByUser(user);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getRecentActivity() {
        return attendanceRepository.findTop10ByOrderByDateDescClockInTimeDesc();
    }

    public com.smarthr.entity.LateAttendanceRequest requestLatePunchIn(Long userId, String reason) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate today = LocalDate.now(ZONE_ID);

        if (lateAttendanceRequestRepository.findByUserAndDate(user, today).isPresent()) {
            throw new RuntimeException("Request already exists for today");
        }

        com.smarthr.entity.LateAttendanceRequest request = new com.smarthr.entity.LateAttendanceRequest();
        request.setUser(user);
        request.setDate(today);
        request.setRequestTime(LocalDateTime.now(ZONE_ID));
        request.setReason(reason);
        request.setStatus(com.smarthr.entity.RequestStatus.PENDING);

        return lateAttendanceRequestRepository.save(request);
    }

    public com.smarthr.entity.LateAttendanceRequest approveLatePunchIn(Long requestId) {
        com.smarthr.entity.LateAttendanceRequest request = lateAttendanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(com.smarthr.entity.RequestStatus.APPROVED);
        return lateAttendanceRequestRepository.save(request);
    }

    public com.smarthr.entity.LateAttendanceRequest rejectLatePunchIn(Long requestId) {
        com.smarthr.entity.LateAttendanceRequest request = lateAttendanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(com.smarthr.entity.RequestStatus.REJECTED);
        return lateAttendanceRequestRepository.save(request);
    }

    public List<com.smarthr.entity.LateAttendanceRequest> getPendingLateRequests() {
        return lateAttendanceRequestRepository.findByStatus(com.smarthr.entity.RequestStatus.PENDING);
    }

    @SuppressWarnings("null")
    public Optional<com.smarthr.entity.LateAttendanceRequest> getMyLateRequest(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return lateAttendanceRequestRepository.findByUserAndDate(user, LocalDate.now(ZONE_ID));
    }
}
