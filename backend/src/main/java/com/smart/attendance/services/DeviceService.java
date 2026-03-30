package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Device;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.DeviceRegistrationRequest;
import com.smart.attendance.repositories.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private static final int MAX_DEVICES = 1;

    private final DeviceRepository deviceRepository;

    public List<Device> getMyDevices(User user) {
        return deviceRepository.findByUser(user);
    }

    @Transactional
    public Device registerDevice(User user, DeviceRegistrationRequest request) {
        int currentCount = deviceRepository.countByUser(user);
        if (currentCount >= MAX_DEVICES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Device limit reached. Maximum 1 device allowed.");
        }

        deviceRepository.findByHardwareIdentifier(request.getHardwareIdentifier())
                .ifPresent(existing -> {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Device already registered");
                });

        // Ensure only one current device marker per user.
        List<Device> devices = deviceRepository.findByUser(user);
        for (Device device : devices) {
            device.setCurrent(false);
        }

        Device newDevice = Device.builder()
                .user(user)
                .hardwareIdentifier(request.getHardwareIdentifier().trim())
                .deviceName(request.getDeviceName().trim())
                .registeredAt(LocalDateTime.now())
                .lastActiveAt(LocalDateTime.now())
                .isCurrent(true)
                .build();

        return deviceRepository.save(newDevice);
    }

    @Transactional
    public void removeDevice(User user, Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Device not found"));

        if (!device.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Device does not belong to current user");
        }

        deviceRepository.delete(device);
    }
}
