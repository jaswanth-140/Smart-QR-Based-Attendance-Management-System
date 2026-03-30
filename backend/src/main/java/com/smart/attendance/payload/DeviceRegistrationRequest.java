package com.smart.attendance.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DeviceRegistrationRequest {
    @NotBlank(message = "Hardware identifier is required")
    @Size(max = 128, message = "Hardware identifier is too long")
    private String hardwareIdentifier;

    @NotBlank(message = "Device name is required")
    @Size(max = 100, message = "Device name is too long")
    private String deviceName;
}
