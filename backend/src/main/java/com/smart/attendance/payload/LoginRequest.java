package com.smart.attendance.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "User ID or email is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
