package com.smart.attendance.controllers;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.security.UserDetailsImpl;
import com.smart.attendance.services.UserContextService;
import com.smart.attendance.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserContextService userContextService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    @GetMapping("/students")
    public ResponseEntity<List<User>> getStudents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User actor = userContextService.requireCurrentUser(userDetails);
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.TEACHER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins and teachers can view students");
        }
        return ResponseEntity.ok(userService.getUsersByRole(Role.STUDENT));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<User>> getTeachers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User actor = userContextService.requireCurrentUser(userDetails);
        if (actor.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins can view teachers");
        }
        return ResponseEntity.ok(userService.getUsersByRole(Role.TEACHER));
    }
}
