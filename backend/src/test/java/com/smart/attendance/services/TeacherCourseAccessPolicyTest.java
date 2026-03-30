package com.smart.attendance.services;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TeacherCourseAccessPolicyTest {

    @Test
    void allowsIndividualTeacherOnCombinedCourseOwner() {
        User actor = User.builder()
                .id(101L)
                .role(Role.TEACHER)
                .email("anuradha@gmail.com")
                .name("Dr Anuradha")
                .build();

        User combinedOwner = User.builder()
                .id(202L)
                .role(Role.TEACHER)
                .email("dr.anuradha.dr.bhaskar.reddy@faculty.smart.edu")
                .name("Dr Anuradha & Dr Bhaskar Reddy")
                .build();

        Course course = Course.builder()
                .id(1L)
                .code("CSE-A2-FSAD")
                .teacher(combinedOwner)
                .build();

        assertTrue(TeacherCourseAccessPolicy.canActorAccessCourse(actor, course));
    }

    @Test
    void deniesUnlistedTeacherOnCourse() {
        User actor = User.builder()
                .id(103L)
                .role(Role.TEACHER)
                .email("hari@gmail.com")
                .name("Dr Hari Prasad")
                .build();

        User courseOwner = User.builder()
                .id(204L)
                .role(Role.TEACHER)
                .email("pavankumar@gmail.com")
                .name("Dr Pavan Kumar")
                .build();

        Course course = Course.builder()
                .id(2L)
                .code("CSE-A4-CN")
                .teacher(courseOwner)
                .build();

        assertFalse(TeacherCourseAccessPolicy.canActorAccessCourse(actor, course));
    }
}
