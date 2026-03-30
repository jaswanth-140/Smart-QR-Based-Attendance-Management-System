package com.smart.attendance.controllers;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Enrollment;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.CourseCreateRequest;
import com.smart.attendance.payload.EnrollmentRequest;
import com.smart.attendance.security.UserDetailsImpl;
import com.smart.attendance.services.CourseService;
import com.smart.attendance.services.EnrollmentService;
import com.smart.attendance.services.UserContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final UserContextService userContextService;

    @GetMapping("/my-courses")
    public ResponseEntity<List<Course>> getMyCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(courseService.getMyCourses(user));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(courseService.getAllCourses(actor));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CourseCreateRequest request) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(courseService.createCourse(actor, request));
    }

    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> enrollStudent(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody EnrollmentRequest request) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(enrollmentService.enrollStudent(actor, request.getStudentId(), request.getCourseId()));
    }

    @DeleteMapping("/enroll")
    public ResponseEntity<String> unenrollStudent(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody EnrollmentRequest request) {
        User actor = userContextService.requireCurrentUser(userDetails);
        enrollmentService.unenrollStudent(actor, request.getStudentId(), request.getCourseId());
        return ResponseEntity.ok("Enrollment removed successfully");
    }

    @GetMapping("/enrollments")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @org.springframework.web.bind.annotation.RequestParam Long courseId) {
        User actor = userContextService.requireCurrentUser(userDetails);
        return ResponseEntity.ok(enrollmentService.getCourseEnrollments(actor, courseId));
    }
}
