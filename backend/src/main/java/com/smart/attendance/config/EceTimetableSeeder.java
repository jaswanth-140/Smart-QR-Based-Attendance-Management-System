package com.smart.attendance.config;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.UserRepository;
import com.smart.attendance.services.CseSectionAllocator;
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
public class EceTimetableSeeder {

    private static final String ECE_DEPARTMENT = "ECE";
    private static final String ECE_COURSE_PREFIX = "ECE";
    private static final String PLACEHOLDER_FACULTY_NAME = "ECE Faculty TBD";
    private static final String PLACEHOLDER_FACULTY_EMAIL = "ece.faculty.tbd@faculty.smart.edu";
    private static final String PLACEHOLDER_FACULTY_PASSWORD = "Faculty@123";

    private static final List<TimetableCourseSeed> COURSE_SEEDS = List.of(
            course("S1", "DC", "DC", "AK Varma", "ECE S1 timetable"),
            course("S1", "EMTL", "EMTL", "Prashanth", "ECE S1 timetable"),
            course("S1", "VAC", "VAC Skilling", "Joshitha", "ECE S1 timetable"),
            course("S1", "FC1", "FC1", "AK Varma", "ECE S1 timetable"),
            course("S1", "VLSI", "VLSI", "Sanjay", "ECE S1 timetable"),
            course("S1", "DAA", "DAA", PLACEHOLDER_FACULTY_NAME, "ECE S1 timetable"),
            course("S1", "OE1", "OE1", "Tirupatiah", "ECE S1 timetable"),
            course("S1", "MLPP", "MLPP", "Satish", "ECE S1 timetable"),
            course("S1", "NPS", "NPS", "Prasanna Lakshmi", "ECE S1 timetable"),
            course("S1", "AUD", "AUD", PLACEHOLDER_FACULTY_NAME, "ECE S1 timetable"),

            course("S2", "DC", "DC", "AK Varma", "ECE S2 timetable"),
            course("S2", "EMTL", "EMTL", "Prashanth", "ECE S2 timetable"),
            course("S2", "VAC", "VAC Skilling", "Joshitha", "ECE S2 timetable"),
            course("S2", "FC1", "FC1", "AK Varma", "ECE S2 timetable"),
            course("S2", "VLSI", "VLSI", "Sanjay", "ECE S2 timetable"),
            course("S2", "DAA", "DAA", PLACEHOLDER_FACULTY_NAME, "ECE S2 timetable"),
            course("S2", "OE1", "OE1", "Tirupatiah", "ECE S2 timetable"),
            course("S2", "MLPP", "MLPP", "Satish", "ECE S2 timetable"),
            course("S2", "NPS", "NPS", "Prasanna Lakshmi", "ECE S2 timetable"),
            course("S2", "AUD", "AUD", PLACEHOLDER_FACULTY_NAME, "ECE S2 timetable"));

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final CseSectionAllocator cseSectionAllocator;

    @Value("${app.seed.replace-enrollments:false}")
    private boolean replaceEnrollments;

    @Transactional
    public void syncEceTimetableAndEnrollments() {
        Map<String, User> teachersByName = ensureFacultyAccounts();
        Map<String, List<Course>> coursesBySection = ensureCourses(teachersByName);

        List<User> eceStudents = userRepository.findByRoleAndDepartment(Role.STUDENT, ECE_DEPARTMENT).stream()
                .filter(student -> student.getStudentId() != null)
                .toList();

        if (eceStudents.isEmpty()) {
            log.warn("No ECE students found. Synced faculty and courses only, skipping enrollments.");
            return;
        }

        if (replaceEnrollments) {
            enrollmentRepository.deleteByStudentIn(eceStudents);
        }
        batchInsertEnrollments(eceStudents, coursesBySection);

        long s1Count = eceStudents.stream()
                .filter(student -> "S1".equalsIgnoreCase(cseSectionAllocator.resolveSection(student)))
                .count();
        long s2Count = eceStudents.size() - s1Count;
        log.info("Synced ECE timetable courses and enrollments. Section counts: S1={}, S2={}", s1Count, s2Count);
    }

    private Map<String, User> ensureFacultyAccounts() {
        Map<String, User> result = new LinkedHashMap<>();
        result.put(PLACEHOLDER_FACULTY_NAME, ensurePlaceholderFacultyAccount());

        for (String teacherDisplayName : COURSE_SEEDS.stream()
                .map(TimetableCourseSeed::teacherName)
                .collect(Collectors.toCollection(LinkedHashSet::new))) {
            if (PLACEHOLDER_FACULTY_NAME.equals(teacherDisplayName)) {
                continue;
            }

            List<String> individualTeachers = TeacherIdentity.extractTeacherNames(teacherDisplayName);
            for (String individualTeacher : individualTeachers) {
                result.putIfAbsent(individualTeacher, ensureTeacherLoginAccount(individualTeacher));
            }

            if (individualTeachers.size() <= 1) {
                result.put(teacherDisplayName, ensureTeacherLoginAccount(teacherDisplayName));
            } else {
                result.put(teacherDisplayName, ensureDisplayTeacherAccount(teacherDisplayName));
            }
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
                PLACEHOLDER_FACULTY_PASSWORD);
    }

    private User ensurePlaceholderFacultyAccount() {
        return upsertTeacherAccount(
                PLACEHOLDER_FACULTY_NAME,
                PLACEHOLDER_FACULTY_EMAIL,
                PLACEHOLDER_FACULTY_PASSWORD);
    }

    private User upsertTeacherAccount(String name, String email, String rawPassword) {
        String normalizedEmail = email.toLowerCase();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> User.builder()
                        .name(name)
                        .email(normalizedEmail)
                        .role(Role.TEACHER)
                        .department(ECE_DEPARTMENT)
                        .build());

        user.setName(name);
        user.setEmail(normalizedEmail);
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(encodedPassword);
        }
        user.setRole(Role.TEACHER);
        user.setDepartment(ECE_DEPARTMENT);
        return userRepository.save(user);
    }

    private Map<String, List<Course>> ensureCourses(Map<String, User> teachersByName) {
        Map<String, List<Course>> result = new LinkedHashMap<>();

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

            Course saved = courseRepository.save(course);
            result.computeIfAbsent(seed.section(), ignored -> new ArrayList<>()).add(saved);
        }

        return result;
    }

    private void batchInsertEnrollments(List<User> students, Map<String, List<Course>> coursesBySection) {
        List<Object[]> batchArgs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (User student : students) {
            String section = cseSectionAllocator.resolveSection(student);
            for (Course course : coursesBySection.getOrDefault(section, List.of())) {
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
            String section,
            String shortCode,
            String displayName,
            String teacherName,
            String schedule) {
        return new TimetableCourseSeed(
                section,
                ECE_COURSE_PREFIX + "-" + section + "-" + shortCode,
                displayName,
                teacherName,
                schedule);
    }

    private record TimetableCourseSeed(
            String section,
            String code,
            String displayName,
            String teacherName,
            String schedule) {
    }
}
