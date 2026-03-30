package com.smart.attendance.payload;

import com.smart.attendance.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name is too long")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    private String password;

    private Role role;

    @Size(max = 50, message = "Student id is too long")
    private String studentId;

    @Size(max = 120, message = "Department is too long")
    private String department;
}
