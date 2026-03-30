package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Course;
import com.smart.attendance.models.Enrollment;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public Enrollment enrollStudent(User actor, Long studentId, Long courseId) {
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.TEACHER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins or teachers can enroll students");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only student users can be enrolled");
        }

        if (actor.getRole() == Role.TEACHER && !TeacherCourseAccessPolicy.canActorAccessCourse(actor, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Teachers can only enroll in their own courses");
        }

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Student is already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .build();

        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void unenrollStudent(User actor, Long studentId, Long courseId) {
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.TEACHER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins or teachers can remove enrollments");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (actor.getRole() == Role.TEACHER && !TeacherCourseAccessPolicy.canActorAccessCourse(actor, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Teachers can only manage their own courses");
        }

        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        enrollmentRepository.delete(enrollment);
    }

    public List<Enrollment> getCourseEnrollments(User actor, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (actor.getRole() == Role.TEACHER && !TeacherCourseAccessPolicy.canActorAccessCourse(actor, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Teachers can only view enrollments for their own courses");
        }

        if (actor.getRole() == Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Students cannot access enrollment lists");
        }

        return enrollmentRepository.findByCourse(course);
    }
}
