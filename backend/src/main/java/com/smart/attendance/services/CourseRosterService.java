package com.smart.attendance.services;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Enrollment;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CourseRosterService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CseSectionAllocator cseSectionAllocator;

    public boolean isStudentEligibleForCourse(User student, Course course) {
        if (student == null || course == null || student.getRole() != Role.STUDENT) {
            return false;
        }

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            return true;
        }

        String courseSection = extractSectionFromCourseCode(course.getCode());
        if (courseSection == null) {
            return false;
        }

        return cseSectionAllocator.matchesCourseSection(student, course.getCode());
    }

    public List<User> getEligibleStudentsForCourse(Course course) {
        Map<Long, User> roster = new LinkedHashMap<>();

        for (Enrollment enrollment : enrollmentRepository.findByCourse(course)) {
            User student = enrollment.getStudent();
            if (student != null && student.getId() != null) {
                roster.put(student.getId(), student);
            }
        }

        String courseSection = extractSectionFromCourseCode(course.getCode());
        if (courseSection != null) {
            String department = cseSectionAllocator.resolveDepartmentFromCourseCode(course.getCode());
            if (department != null) {
                List<User> students = userRepository.findByRoleAndDepartment(Role.STUDENT, department);
                for (User student : students) {
                    if (cseSectionAllocator.matchesCourseSection(student, course.getCode()) && student.getId() != null) {
                        roster.put(student.getId(), student);
                    }
                }
            }
        }

        return new ArrayList<>(roster.values());
    }

    private String extractSectionFromCourseCode(String code) {
        if (code == null) {
            return null;
        }

        String[] parts = code.split("-");
        if (parts.length < 3) {
            return null;
        }

        return parts[1];
    }
}
