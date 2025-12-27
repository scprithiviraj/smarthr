package com.smarthr;

import com.smarthr.entity.Role;
import com.smarthr.entity.User;
import com.smarthr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.existsByUsername("admin")) {
            // Admin already exists, do nothing to preserve changes (like password updates)
            System.out.println("Admin user already exists. Skipping initialization.");
        } else {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@smarthr.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setRole(Role.ADMIN);
            admin.setDesignation("Administrator");

            userRepository.save(admin);
        }
    }
}
