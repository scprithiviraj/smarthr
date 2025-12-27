package com.smarthr.payload.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class PasswordChangeRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    private String newPassword;
}
