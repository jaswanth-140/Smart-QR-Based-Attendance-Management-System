package com.smart.attendance.config;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Enrollment;
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
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CseTimetableSeeder {

    private static final String CSE_DEPARTMENT = "CSE";
    private static final String FACULTY_PASSWORD = "Faculty@123";

    private static final List<TimetableCourseSeed> COURSE_SEEDS = List.of(
            course("A1", "MO", "Mathematical Optimization", "Dr Suhma Rani", "Section A1 timetable"),
            course("A1", "FSAD", "Full Stack Application Development", "Ms P Sree Lakshmi & Dr Anuradha", "Section A1 timetable"),
            course("A1", "DAA", "Design and Analysis of Algorithms", "Dr Saidireddy M", "Section A1 timetable"),
            course("A1", "CN", "Computer Networks", "Dr Pavan Kumar", "Section A1 timetable"),
            course("A1", "CTI", "Cyber Threat Intelligence", "Dr Lalitha", "Section A1 timetable"),
            course("A1", "PDNC", "Principles of Deep Neural Computation", "Dr A Mousmi Chaurasia & Dr Siva Krishna Reddy", "Section A1 timetable"),
            course("A1", "GLOBAL-LOGIC", "Global Logic", "Dr Sasidhar K", "Section A1 timetable"),
            course("A1", "GLOBAL-CERT", "Global Certification", "Training Cell", "Tuesday"),
            course("A1", "CRT", "Campus Recruitment Training", "Training Cell", "Wednesday"),

            course("A2", "MO", "Mathematical Optimization", "Mr Jaganmohan Rao", "Section A2 timetable"),
            course("A2", "FSAD", "Full Stack Application Development", "Dr Anuradha & Dr Bhaskar Reddy", "Section A2 timetable"),
            course("A2", "DAA", "Design and Analysis of Algorithms", "Dr Sumalakshmi", "Section A2 timetable"),
            course("A2", "CN", "Computer Networks", "Dr Pavan Kumar", "Section A2 timetable"),
            course("A2", "FCSHPC", "Foundation of Cloud Based Scientific & High Performance Computing", "Ms PNS Soumya", "Section A2 timetable"),
            course("A2", "PDNC", "Principles of Deep Neural Computation", "Dr A Mousmi Chaurasia", "Section A2 timetable"),
            course("A2", "GLOBAL-LOGIC", "Global Logic", "Dr Rafeeq", "Section A2 timetable"),
            course("A2", "GLOBAL-CERT", "Global Certification", "Training Cell", "Tuesday"),
            course("A2", "CRT", "Campus Recruitment Training", "Training Cell", "Wednesday"),

            course("A3", "MO", "Mathematical Optimization", "Dr Suhma Rani", "Section A3 timetable"),
            course("A3", "FSAD", "Full Stack Application Development", "Dr Anuradha & Dr Anantha Reddy", "Section A3 timetable"),
            course("A3", "DAA", "Design and Analysis of Algorithms", "Mr Aftab Yaseen", "Section A3 timetable"),
            course("A3", "CN", "Computer Networks", "Mr Narasimha", "Section A3 timetable"),
            course("A3", "FCSHPC", "Foundation of Cloud Based Scientific & High Performance Computing", "Ms PNS Soumya", "Section A3 timetable"),
            course("A3", "PDNC", "Principles of Deep Neural Computation", "Dr A Mousmi Chaurasia", "Section A3 timetable"),
            course("A3", "GLOBAL-LOGIC", "Global Logic", "Dr Bhaskar Reddy", "Section A3 timetable"),
            course("A3", "GLOBAL-CERT", "Global Certification", "Training Cell", "Tuesday"),
            course("A3", "CRT", "Campus Recruitment Training", "Training Cell", "Wednesday"),

            course("A4", "MO", "Mathematical Optimization", "Mr Jaganmohan Rao", "Section A4 timetable"),
            course("A4", "FSAD", "Full Stack Application Development", "Dr Madhukar Rao", "Section A4 timetable"),
            course("A4", "DAA", "Design and Analysis of Algorithms", "Mr Aftab Yaseen", "Section A4 timetable"),
            course("A4", "CN", "Computer Networks", "Dr Pavan Kumar", "Section A4 timetable"),
            course("A4", "FCSHPC", "Foundation of Cloud Based Scientific & High Performance Computing", "Ms PNS Soumya", "Section A4 timetable"),
            course("A4", "PDNC", "Principles of Deep Neural Computation", "Dr Siva Krishna Reddy", "Section A4 timetable"),
            course("A4", "GLOBAL-LOGIC", "Global Logic", "Dr Hari Prasad", "Section A4 timetable"),
            course("A4", "GLOBAL-CERT", "Global Certification", "Training Cell", "Tuesday"),
            course("A4", "CRT", "Campus Recruitment Training", "Training Cell", "Wednesday"),

            course("A5", "MO", "Mathematical Optimization", "Mr Jaganmohan Rao", "Section A5 timetable"),
            course("A5", "FSAD", "Full Stack Application Development", "Dr Ratnakumar & Dr N Ravinder", "Section A5 timetable"),
            course("A5", "DAA", "Design and Analysis of Algorithms", "Dr Sasidhar K & Dr Anitha Patil", "Section A5 timetable"),
            course("A5", "CN", "Computer Networks", "Mr Narasimha", "Section A5 timetable"),
            course("A5", "FCSHPC", "Foundation of Cloud Based Scientific & High Performance Computing", "Ms PNS Soumya", "Section A5 timetable"),
            course("A5", "PDNC", "Principles of Deep Neural Computation", "Dr Siva Krishna Reddy", "Section A5 timetable"),
            course("A5", "GLOBAL-LOGIC", "Global Logic", "Ms Soumya Bharadwaj", "Section A5 timetable"),
            course("A5", "GLOBAL-CERT", "Global Certification", "Training Cell", "Tuesday"),
            course("A5", "CRT", "Campus Recruitment Training", "Training Cell", "Wednesday"),

            course("A6", "MO", "Mathematical Optimization", "Dr Suhma Rani", "Section A6 timetable"),
            course("A6", "FSAD", "Full Stack Application Development", "Dr Madhukar Rao", "Section A6 timetable"),
            course("A6", "DAA", "Design and Analysis of Algorithms", "Mr Aftab Yaseen", "Section A6 timetable"),
            course("A6", "CN", "Computer Networks", "Dr Trinath Basu", "Section A6 timetable"),
            course("A6", "FCSHPC", "Foundation of Cloud Based Scientific & High Performance Computing", "Ms Mubeena Bagum", "Section A6 timetable"),
            course("A6", "PDNC", "Principles of Deep Neural Computation", "Dr Siva Krishna Reddy", "Section A6 timetable"),
            course("A6", "GLOBAL-LOGIC", "Global Logic", "Mr Chiranjeevi N", "Section A6 timetable"),
            course("A6", "GLOBAL-CERT", "Global Certification", "Training Cell", "Tuesday"),
            course("A6", "CRT", "Campus Recruitment Training", "Training Cell", "Wednesday"));

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final CseSectionAllocator cseSectionAllocator;

    @Value("${app.seed.replace-enrollments:false}")
    private boolean replaceEnrollments;

    @Transactional
    public void syncCseTimetableAndEnrollments() {
        Map<String, User> teachersByName = ensureFacultyAccounts();
        Map<String, List<Course>> coursesBySection = ensureSectionCourses(teachersByName);

        List<User> cseStudents = userRepository.findByRoleAndDepartment(Role.STUDENT, CSE_DEPARTMENT).stream()
                .filter(student -> student.getStudentId() != null)
                .sorted(Comparator.comparing(User::getStudentId))
                .toList();

        if (cseStudents.isEmpty()) {
            log.warn("No CSE students found. Synced faculty and courses only, skipping enrollments.");
            return;
        }

        Map<String, List<User>> studentsBySection = cseSectionAllocator.assignStudentsToSections(cseStudents);

        if (replaceEnrollments) {
            enrollmentRepository.deleteByStudentIn(cseStudents);
        }
        batchInsertEnrollments(studentsBySection, coursesBySection);

        Map<String, Integer> sectionCounts = studentsBySection.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().size(), (left, right) -> left, LinkedHashMap::new));

        log.info("Synced CSE timetable courses and enrollments. Section counts: {}", sectionCounts);
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
        String email = TeacherIdentity.buildTeacherEmail(teacherName);
        String password = TeacherIdentity.buildTeacherPassword(teacherName);
        return upsertTeacherAccount(teacherName, email, password);
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
                        .department(CSE_DEPARTMENT)
                        .build());

        user.setName(name);
        user.setEmail(normalizedEmail);
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(encodedPassword);
        }
        user.setRole(Role.TEACHER);
        user.setDepartment(CSE_DEPARTMENT);

        return userRepository.save(user);
    }

    private Map<String, List<Course>> ensureSectionCourses(Map<String, User> teachersByName) {
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

    private void batchInsertEnrollments(Map<String, List<User>> studentsBySection, Map<String, List<Course>> coursesBySection) {
        List<Object[]> batchArgs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<String, List<User>> entry : studentsBySection.entrySet()) {
            List<Course> sectionCourses = coursesBySection.getOrDefault(entry.getKey(), List.of());
            for (User student : entry.getValue()) {
                for (Course course : sectionCourses) {
                    batchArgs.add(new Object[] { course.getId(), java.sql.Timestamp.valueOf(now), student.getId() });
                }
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
                "CSE-" + section + "-" + shortCode,
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
