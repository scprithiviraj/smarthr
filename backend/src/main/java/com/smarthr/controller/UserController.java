package com.smarthr.controller;

import com.smarthr.entity.User;
import com.smarthr.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping("/{id}/avatar")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public org.springframework.http.ResponseEntity<?> uploadAvatar(@PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            User updatedUser = userService.updateProfilePicture(id, file);
            return org.springframework.http.ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/avatar")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public org.springframework.http.ResponseEntity<?> deleteAvatar(@PathVariable Long id) {
        try {
            User updatedUser = userService.deleteProfilePicture(id);
            return org.springframework.http.ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public org.springframework.http.ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return org.springframework.http.ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAuthority('EMPLOYEE') or hasAuthority('ADMIN')")
    public org.springframework.http.ResponseEntity<?> changePassword(@PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.smarthr.payload.request.PasswordChangeRequest passwordRequest) {
        try {
            userService.changePassword(id, passwordRequest.getCurrentPassword(), passwordRequest.getNewPassword());
            return org.springframework.http.ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/avatars/{filename:.+}")
    public org.springframework.http.ResponseEntity<?> getAvatar(@PathVariable String filename) {
        org.springframework.core.io.Resource file = null;
        try {
            file = userService.loadAvatar(filename);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }

        String contentType = "image/jpeg";
        if (filename.toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        } else if (filename.toLowerCase().endsWith(".gif")) {
            contentType = "image/gif";
        }

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(file);
    }

    @DeleteMapping("/reset")
    @PreAuthorize("hasAuthority('ADMIN')")
    public org.springframework.http.ResponseEntity<?> resetUsers() {
        userService.deleteAllUsers();
        return org.springframework.http.ResponseEntity.ok("All users deleted and IDs reset.");
    }
}
