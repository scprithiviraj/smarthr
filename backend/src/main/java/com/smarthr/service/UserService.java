package com.smarthr.service;

import com.smarthr.entity.User;
import com.smarthr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final java.nio.file.Path rootLocation = java.nio.file.Paths.get("uploads/avatars").toAbsolutePath()
            .normalize();

    public User updateProfilePicture(Long userId, org.springframework.web.multipart.MultipartFile file) {
        try {
            if (!java.nio.file.Files.exists(rootLocation)) {
                java.nio.file.Files.createDirectories(rootLocation);
            }
            String fileName = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path targetLocation = rootLocation.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            user.setProfilePicture(fileName);
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
        }
    }

    public User updateUser(Long userId, User userDetails) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (userDetails.getFullName() != null)
            user.setFullName(userDetails.getFullName());
        if (userDetails.getEmail() != null)
            user.setEmail(userDetails.getEmail());
        if (userDetails.getDesignation() != null)
            user.setDesignation(userDetails.getDesignation());
        if (userDetails.getPhoneNumber() != null)
            user.setPhoneNumber(userDetails.getPhoneNumber());

        return userRepository.save(user);
    }

    @jakarta.transaction.Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        System.out.println("Changing password for user ID: " + userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        boolean matches = passwordEncoder.matches(oldPassword, user.getPassword());
        System.out.println("Password match result: " + matches);

        if (!matches) {
            System.out.println("Invalid current password for user: " + user.getUsername());
            throw new RuntimeException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.saveAndFlush(user);
        System.out.println("Password successfully updated for user: " + user.getUsername());
    }

    public org.springframework.core.io.Resource loadAvatar(String filename) {
        try {
            java.nio.file.Path file = rootLocation.resolve(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (java.net.MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @jakarta.transaction.Transactional
    public void deleteAllUsers() {
        // Dependencies must be cleared first
        // Assuming Attendance and LeaveRequest repositories are needed
        // Since we are in UserService, we might need to inject them or use
        // EntityManager
        // Best approach for TRUNCATE is Native Query

        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE leave_requests").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE attendance").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE departments").executeUpdate();
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();

        // Recreate Admin User
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@smarthr.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("System Administrator");
        admin.setRole(com.smarthr.entity.Role.ADMIN);
        admin.setDesignation("Administrator");
        userRepository.save(admin);
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;
}
