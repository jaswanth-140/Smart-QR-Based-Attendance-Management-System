package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Course;
import com.smart.attendance.models.Enrollment;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.CourseCreateRequest;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CseSectionAllocator cseSectionAllocator;

    public List<Course> getMyCourses(User user) {
        if (user.getRole() == Role.TEACHER) {
            List<Course> teacherCourses = new ArrayList<>(courseRepository.findAll().stream()
                    .filter(course -> TeacherCourseAccessPolicy.canActorAccessCourse(user, course))
                    .toList());

            Map<Long, Course> deduped = new LinkedHashMap<>();
            for (Course course : teacherCourses) {
                if (course.getId() != null) {
                    deduped.put(course.getId(), course);
                }
            }

            return deduped.values().stream()
                    .sorted(Comparator.comparing(Course::getCode))
                    .toList();
        }

        if (user.getRole() == Role.STUDENT) {
            List<Enrollment> enrollments = enrollmentRepository.findDetailedByStudentId(user.getId());
            if (!enrollments.isEmpty()) {
                return enrollments.stream()
                        .map(Enrollment::getCourse)
                        .sorted(Comparator.comparing(Course::getCode))
                        .toList();
            }

            String section = cseSectionAllocator.resolveSection(user);
            String coursePrefix = cseSectionAllocator.resolveCourseCodePrefix(user);
            if (section != null && coursePrefix != null) {
                return courseRepository.findByCodeStartingWith(coursePrefix + "-" + section + "-").stream()
                        .sorted(Comparator.comparing(Course::getCode))
                        .toList();
            }

            return List.of();
        }

        return courseRepository.findAll();
    }

    public List<Course> getAllCourses(User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins can access all courses");
        }
        return courseRepository.findAll();
    }

    @Transactional
    public Course createCourse(User actor, CourseCreateRequest request) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins can create courses");
        }

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (courseRepository.findByCode(normalizedCode).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Course code is already in use");
        }

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Teacher not found"));

        if (teacher.getRole() != Role.TEACHER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Provided user is not a teacher");
        }

        Course course = Course.builder()
                .code(normalizedCode)
                .name(request.getName().trim())
                .schedule(request.getSchedule())
                .teacher(teacher)
                .build();

        return courseRepository.save(course);
    }
}
