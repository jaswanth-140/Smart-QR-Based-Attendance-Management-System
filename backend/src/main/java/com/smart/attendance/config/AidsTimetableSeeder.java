package com.smart.attendance.config;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.UserRepository;
import com.smart.attendance.services.TeacherIdentity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AidsTimetableSeeder {

    private static final String AIDS_DEPARTMENT = "AI&DS";
    private static final String AIDS_SECTION = "AI&DS";
    private static final String AIDS_COURSE_PREFIX = "AIDS";
    private static final String FACULTY_PASSWORD = "Faculty@123";

    private static final List<TimetableCourseSeed> COURSE_SEEDS = List.of(
            course("MO", "Mathematical Optimization", "Dr Sharanya", "AI&DS common timetable"),
            course("ML", "Machine Learning", "Dr P Harsha & Dr Madhu", "AI&DS common timetable"),
            course("DAA", "Design and Analysis of Algorithms", "Dr Sukla Satapahy", "AI&DS common timetable"),
            course("CIS", "Cloud Infrastructure and Services", "Dr Rama Rao", "AI&DS common timetable"),
            course("FAIEDC", "Foundations of AI-Enabled Edge Computing", "Dr Ravi Boda", "AI&DS common timetable"),
            course("FSAD", "Full Stack Application Development (FSAD)", "Dr Sandeep Chitteddy & Dr Sukla Satapahy", "AI&DS common timetable"),
            course("CN", "Computer Networks", "Dr Saiffuddin", "AI&DS common timetable"));

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.seed.replace-enrollments:false}")
    private boolean replaceEnrollments;

    @Transactional
    public void syncAidsTimetableAndEnrollments() {
        Map<String, User> teachersByName = ensureFacultyAccounts();
        List<Course> sectionCourses = ensureCourses(teachersByName);

        List<User> aidsStudents = userRepository.findByRoleAndDepartment(Role.STUDENT, AIDS_DEPARTMENT).stream()
                .filter(student -> student.getStudentId() != null)
                .toList();

        if (aidsStudents.isEmpty()) {
            log.warn("No AI&DS students found. Synced faculty and courses only, skipping enrollments.");
            return;
        }

        if (replaceEnrollments) {
            enrollmentRepository.deleteByStudentIn(aidsStudents);
        }
        batchInsertEnrollments(aidsStudents, sectionCourses);
        log.info("Synced AI&DS timetable courses and enrollments for {} students", aidsStudents.size());
    }

    private Map<String, User> ensureFacultyAccounts() {
        Map<String, User> result = new LinkedHashMap<>();

        for (String teacherDisplayName : COURSE_SEEDS.stream()
                .map(TimetableCourseSeed::teacherName)
                .collect(Collectors.toCollection(LinkedHashSet::new))) {
            List<String> individualTeachers = TeacherIdentity.extractTeacherNames(teacherDisplayName);
            for (String individualTeacher : individualTeachers) {
                result.putIfAbsent(individualTeacher, ensureTeacherLoginAccount(individualTeacher));
            }

            if (individualTeachers.size() <= 1) {
                result.put(teacherDisplayName, ensureTeacherLoginAccount(teacherDisplayName));
                continue;
            }

            result.put(teacherDisplayName, ensureDisplayTeacherAccount(teacherDisplayName));
        }

        return result;
    }

    private User ensureTeacherLoginAccount(String teacherName) {
        return upsertTeacherAccount(
                teacherName,
                TeacherIdentity.buildTeacherEmail(teacherName),
                TeacherIdentity.buildTeacherPassword(teacherName));
    }

    private User ensureDisplayTeacherAccount(String teacherDisplayName) {
        return upsertTeacherAccount(
                teacherDisplayName,
                TeacherIdentity.buildDisplayAccountEmail(teacherDisplayName),
                FACULTY_PASSWORD);
    }

    private User upsertTeacherAccount(String name, String email, String rawPassword) {
        String normalizedEmail = email.toLowerCase();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> User.builder()
                        .name(name)
                        .email(normalizedEmail)
                        .role(Role.TEACHER)
                        .department(AIDS_DEPARTMENT)
                        .build());

        user.setName(name);
        user.setEmail(normalizedEmail);
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(encodedPassword);
        }
        user.setRole(Role.TEACHER);
        user.setDepartment(AIDS_DEPARTMENT);
        return userRepository.save(user);
    }

    private List<Course> ensureCourses(Map<String, User> teachersByName) {
        List<Course> result = new ArrayList<>();

        for (TimetableCourseSeed seed : COURSE_SEEDS) {
            Course course = courseRepository.findByCode(seed.code())
                    .map(existing -> {
                        existing.setName(seed.displayName());
                        existing.setSchedule(seed.schedule());
                        existing.setTeacher(teachersByName.get(seed.teacherName()));
                        return existing;
                    })
                    .orElseGet(() -> Course.builder()
                            .code(seed.code())
                            .name(seed.displayName())
                            .schedule(seed.schedule())
                            .teacher(teachersByName.get(seed.teacherName()))
                            .build());

            result.add(courseRepository.save(course));
        }

        return result;
    }

    private void batchInsertEnrollments(List<User> students, List<Course> sectionCourses) {
        List<Object[]> batchArgs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (User student : students) {
            for (Course course : sectionCourses) {
                batchArgs.add(new Object[] { course.getId(), java.sql.Timestamp.valueOf(now), student.getId() });
            }
        }

        if (batchArgs.isEmpty()) {
            return;
        }

        jdbcTemplate.batchUpdate(
                "insert into enrollments (course_id, enrolled_at, student_id) values (?, ?, ?) on conflict (student_id, course_id) do nothing",
                batchArgs);
    }

    private static TimetableCourseSeed course(
            String shortCode,
            String displayName,
            String teacherName,
            String schedule) {
        return new TimetableCourseSeed(
                AIDS_COURSE_PREFIX + "-" + AIDS_SECTION + "-" + shortCode,
                displayName,
                teacherName,
                schedule);
    }

    private record TimetableCourseSeed(
            String code,
            String displayName,
            String teacherName,
            String schedule) {
    }
}
