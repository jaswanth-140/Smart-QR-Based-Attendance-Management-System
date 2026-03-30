package com.smart.attendance.controllers;

import com.smart.attendance.models.Device;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.DeviceRegistrationRequest;
import com.smart.attendance.security.UserDetailsImpl;
import com.smart.attendance.services.DeviceService;
import com.smart.attendance.services.UserContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final UserContextService userContextService;

    @GetMapping
    public ResponseEntity<List<Device>> getMyDevices(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(deviceService.getMyDevices(user));
    }

    @PostMapping
    public ResponseEntity<Device> registerDevice(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody DeviceRegistrationRequest request) {
        User user = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(deviceService.registerDevice(user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeDevice(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User user = userContextService.requireCurrentUser(userDetails);
        deviceService.removeDevice(user, id);
        return ResponseEntity.ok("Device removed successfully");
    }
}
