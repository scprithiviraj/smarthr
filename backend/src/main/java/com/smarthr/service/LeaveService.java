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
}
