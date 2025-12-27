package com.smarthr.payload.request;

import com.smarthr.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    private String fullName;

    private Role role; // Optional, defaults to EMPLOYEE in logic

    private String designation;

    private Long departmentId;
}
