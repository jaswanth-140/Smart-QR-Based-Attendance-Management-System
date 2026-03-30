package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Course;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    @Test
    void teacherCannotEnrollStudentInOtherTeachersCourse() {
        User actor = User.builder().id(99L).role(Role.TEACHER).build();
        User student = User.builder().id(1L).role(Role.STUDENT).build();
        User ownerTeacher = User.builder().id(3L).role(Role.TEACHER).build();
        Course course = Course.builder().id(10L).teacher(ownerTeacher).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));

        assertThrows(ApiException.class, () -> enrollmentService.enrollStudent(actor, 1L, 10L));
    }
}
