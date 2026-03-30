package com.smart.attendance.controllers;

import com.smart.attendance.models.Session;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.SessionQrCodeResponse;
import com.smart.attendance.payload.SessionCreateRequest;
import com.smart.attendance.security.UserDetailsImpl;
import com.smart.attendance.services.SessionService;
import com.smart.attendance.services.UserContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserContextService userContextService;

    @PostMapping
    public ResponseEntity<Session> createSession(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody SessionCreateRequest request) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(sessionService.createSession(actor, request));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Session>> getActiveSessions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(sessionService.getActiveSessions(actor));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Session>> getSessionsByCourse(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long courseId) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(sessionService.getSessionsByCourse(actor, courseId));
    }

    @PostMapping("/{id}/qr-token")
    public ResponseEntity<SessionQrCodeResponse> rotateQrToken(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(sessionService.rotateQrToken(actor, id));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<Session> endSession(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long id) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(sessionService.endSession(actor, id));
    }
}
