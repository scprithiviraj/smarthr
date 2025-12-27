package com.smarthr.service;

import com.smarthr.entity.Attendance;
import com.smarthr.entity.AttendanceStatus;
import com.smarthr.entity.User;
import com.smarthr.repository.AttendanceRepository;
import com.smarthr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    AttendanceRepository attendanceRepository;

    @Autowired
    UserRepository userRepository;

    public Attendance checkIn(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, today);
        if (existing.isPresent()) {
            throw new RuntimeException("Already checked in or attendance record exists for today");
        }

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setDate(today);
        attendance.setClockInTime(LocalDateTime.now());
        attendance.setStatus(AttendanceStatus.PRESENT); // Default to Present, logic can be refined

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByUserAndDate(user, today)
                .orElseThrow(() -> new RuntimeException("No attendance record found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new RuntimeException("Already checked out");
        }

        attendance.setClockOutTime(LocalDateTime.now());

        // Calculate total hours
        long seconds = Duration.between(attendance.getClockInTime(), attendance.getClockOutTime()).getSeconds();
        attendance.setTotalHours(seconds / 3600.0);

        // Status Update Logic (Example: >4 hours = PRESENT, <4 hours = HALF_DAY)
        if (attendance.getTotalHours() < 4.0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        } else {
            attendance.setStatus(AttendanceStatus.PRESENT);
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
}
