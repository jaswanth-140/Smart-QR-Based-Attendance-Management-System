package com.smart.attendance.payload;

import com.smart.attendance.models.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AttendanceOverrideRequest {

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    @NotBlank(message = "Reason is required")
    @Size(max = 300, message = "Reason is too long")
    private String reason;
}
