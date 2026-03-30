package com.smart.attendance.controllers;

import com.smart.attendance.models.AttendanceRecord;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.AttendanceOverrideRequest;
import com.smart.attendance.payload.AttendanceScanRequest;
import com.smart.attendance.security.UserDetailsImpl;
import com.smart.attendance.services.AttendanceService;
import com.smart.attendance.services.UserContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserContextService userContextService;

    @PostMapping("/scan")
    public ResponseEntity<AttendanceRecord> scanQrCode(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AttendanceScanRequest request) {
        User student = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(attendanceService.scanQrCode(student, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AttendanceRecord>> getMyAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User student = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(attendanceService.getStudentAttendance(student));
    }

    @PostMapping("/{recordId}/override")
    public ResponseEntity<AttendanceRecord> overrideAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long recordId,
            @Valid @RequestBody AttendanceOverrideRequest request) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(attendanceService.overrideAttendance(actor, recordId, request));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AttendanceRecord>> getSessionAttendance(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long sessionId) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(attendanceService.getSessionAttendance(actor, sessionId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceRecord>> getCourseAttendance(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long courseId) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(attendanceService.getCourseAttendance(actor, courseId));
    }
}
