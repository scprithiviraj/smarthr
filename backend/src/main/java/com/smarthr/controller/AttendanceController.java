package com.smarthr.controller;

import com.smarthr.entity.Attendance;
import com.smarthr.service.AttendanceService;
import com.smarthr.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    AttendanceService attendanceService;

    @PostMapping("/check-in")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public ResponseEntity<?> checkIn() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        try {
            Attendance attendance = attendanceService.checkIn(userDetails.getId());
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public ResponseEntity<?> checkOut() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        try {
            Attendance attendance = attendanceService.checkOut(userDetails.getId());
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public List<Attendance> getUserHistory(@PathVariable Long userId) {
        return attendanceService.getUserHistory(userId);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public List<Attendance> getMyHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return attendanceService.getUserHistory(userDetails.getId());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Attendance> getRecentActivity() {
        return attendanceService.getRecentActivity();
    }

    @PostMapping("/late-request")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public ResponseEntity<?> requestLatePunchIn(@RequestBody java.util.Map<String, String> payload) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        try {
            return ResponseEntity.ok(attendanceService.requestLatePunchIn(userDetails.getId(), payload.get("reason")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/late-request/{requestId}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> approveLatePunchIn(@PathVariable Long requestId) {
        try {
            return ResponseEntity.ok(attendanceService.approveLatePunchIn(requestId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/late-request/{requestId}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> rejectLatePunchIn(@PathVariable Long requestId) {
        try {
            return ResponseEntity.ok(attendanceService.rejectLatePunchIn(requestId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/late-requests/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<com.smarthr.entity.LateAttendanceRequest> getPendingLateRequests() {
        System.out.println("Fetching pending late requests...");
        List<com.smarthr.entity.LateAttendanceRequest> requests = attendanceService.getPendingLateRequests();
        System.out.println("Found " + requests.size() + " pending requests.");
        return requests;
    }

    @SuppressWarnings("null")
    @GetMapping("/late-request/my-status")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public ResponseEntity<?> getMyLateRequestStatus() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return ResponseEntity.of(attendanceService.getMyLateRequest(userDetails.getId()));
    }
}
