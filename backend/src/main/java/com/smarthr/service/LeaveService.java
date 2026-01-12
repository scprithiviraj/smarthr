package com.smarthr.service;

import com.smarthr.entity.LeaveRequest;
import com.smarthr.entity.LeaveStatus;
import com.smarthr.entity.User;
import com.smarthr.repository.LeaveRequestRepository;
import com.smarthr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class LeaveService {
    @Autowired
    LeaveRequestRepository leaveRequestRepository;

    @Autowired
    UserRepository userRepository;

    private final Path fileStorageLocation = Paths.get("uploads/leaves").toAbsolutePath().normalize();

    public LeaveRequest applyLeave(Long userId, LeaveRequest request, MultipartFile file) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        request.setUser(user); // Set the applicant
        request.setStatus(LeaveStatus.PENDING);

        // Basic validation
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        // Sick Leave Validation
        if ("SICK".equalsIgnoreCase(request.getLeaveType())) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            if (days > 3) {
                throw new RuntimeException("Sick leave cannot apply for more than 3 days");
            }
        }

        // Handle File Upload
        if (file != null && !file.isEmpty()) {
            try {
                if (!Files.exists(fileStorageLocation)) {
                    Files.createDirectories(fileStorageLocation);
                }
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path targetLocation = fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                request.setAttachmentPath(targetLocation.toString());
            } catch (Exception ex) {
                throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!",
                        ex);
            }
        }

        return leaveRequestRepository.save(request);
    }

    public List<LeaveRequest> getUserLeaves(Long userId) {
        // Just verify user exists if needed, or just fetch by ID
        return leaveRequestRepository.findByUserId(userId);
    }

    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest approveLeave(Long leaveId, Long adminId) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId).orElseThrow();
        User admin = userRepository.findById(adminId).orElseThrow();

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(admin);

        return leaveRequestRepository.save(leave);
    }

    public LeaveRequest rejectLeave(Long leaveId, Long adminId) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId).orElseThrow();
        User admin = userRepository.findById(adminId).orElseThrow();

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setApprovedBy(admin);

        return leaveRequestRepository.save(leave);
    }

    public java.util.Map<String, Integer> getLeaveBalance(Long userId) {
        java.util.Map<String, Integer> totalLeaves = new java.util.HashMap<>();
        totalLeaves.put("SICK", 5);
        totalLeaves.put("CASUAL", 7);
        totalLeaves.put("EARNED", 12);
        totalLeaves.put("MATERNITY", 90);
        totalLeaves.put("PATERNITY", 15);

        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findByUserId(userId).stream()
                .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                .collect(java.util.stream.Collectors.toList());

        java.util.Map<String, Integer> usedLeaves = new java.util.HashMap<>();
        for (LeaveRequest leave : approvedLeaves) {
            String type = leave.getLeaveType().toUpperCase();
            int days = (int) leave.getDays();
            usedLeaves.put(type, usedLeaves.getOrDefault(type, 0) + days);
        }

        java.util.Map<String, Integer> balance = new java.util.HashMap<>();
        for (String type : totalLeaves.keySet()) {
            int total = totalLeaves.get(type);
            int used = usedLeaves.getOrDefault(type, 0);
            balance.put(type, Math.max(0, total - used));
        }

        return balance;
    }
}
