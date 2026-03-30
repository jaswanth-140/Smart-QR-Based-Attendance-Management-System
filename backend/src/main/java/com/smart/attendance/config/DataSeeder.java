package com.smart.attendance.config;

import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;
    private final CseTimetableSeeder cseTimetableSeeder;
    private final AidsTimetableSeeder aidsTimetableSeeder;
    private final EceTimetableSeeder eceTimetableSeeder;

    @Value("${app.seed.reset-students:false}")
    private boolean resetStudents;

    @Value("${app.seed.students:false}")
    private boolean seedStudents;

    @Value("${app.seed.sync-timetable:false}")
    private boolean syncTimetable;

    @Override
    @Transactional
    public void run(String... args) {
        if (resetStudents) {
            resetStudentAccounts();
        }

        if (seedStudents) {
            List<User> existingStudents = userRepository.findByRole(Role.STUDENT);
            Set<String> existingStudentIds = new HashSet<>();
            Set<String> existingEmails = new HashSet<>();

            for (User student : existingStudents) {
                if (student.getStudentId() != null) {
                    existingStudentIds.add(student.getStudentId());
                }
                if (student.getEmail() != null) {
                    existingEmails.add(student.getEmail());
                }
            }

            seedStudents("CSE", "241003", 1, 533, 123, existingStudentIds, existingEmails);
            seedStudents("ECE", "241004", 1, 143, 123, existingStudentIds, existingEmails);
            seedStudents("AI&DS", "241008", 1, 140, 123, existingStudentIds, existingEmails);
        } else {
            log.info("Skipping student account seeding on startup (app.seed.students=false)");
        }

        if (syncTimetable) {
            cseTimetableSeeder.syncCseTimetableAndEnrollments();
            eceTimetableSeeder.syncEceTimetableAndEnrollments();
            aidsTimetableSeeder.syncAidsTimetableAndEnrollments();
            reassignMadhukarCoursesToDedicatedAccount();
        } else {
            log.info("Skipping timetable sync on startup (app.seed.sync-timetable=false)");
        }
    }

    private void reassignMadhukarCoursesToDedicatedAccount() {
        Number teacherId;
        try {
            teacherId = (Number) entityManager.createNativeQuery(
                    "select id from users where lower(email) = 'madhukarrao@gmail.com' limit 1")
                    .getSingleResult();
        } catch (NoResultException ex) {
                        log.warn("Madhukar account not found. Skipping post-sync course reassignment.");
                        return;
                }

                int byCode = entityManager.createNativeQuery(
                                """
                                update courses
                                set teacher_id = :teacherId
                                where code in ('CSE-A4-FSAD', 'CSE-A6-FSAD')
                                    and teacher_id <> :teacherId
                                """)
                                .setParameter("teacherId", teacherId.longValue())
                                .executeUpdate();

                int byNameOrEmail = entityManager.createNativeQuery(
                                """
                                update courses
                                set teacher_id = :teacherId
                                where teacher_id in (
                                        select id
                                        from users
                                        where lower(name) like '%madhukar%'
                                             or lower(email) like '%madhukar%'
                                )
                                    and teacher_id <> :teacherId
                                """)
                                .setParameter("teacherId", teacherId.longValue())
                                .executeUpdate();

                int totalUpdated = byCode + byNameOrEmail;
                if (totalUpdated > 0) {
                        log.info("Post-sync reassignment mapped {} course(s) to madhukarrao@gmail.com", totalUpdated);
                }
    }

    private void resetStudentAccounts() {
        int attendanceOverridesRemoved = entityManager.createNativeQuery(
                        "DELETE FROM attendance_records WHERE overridden_by IN (SELECT id FROM users WHERE role = 'STUDENT')")
                .executeUpdate();
        int attendanceRemoved = entityManager.createNativeQuery(
                        "DELETE FROM attendance_records WHERE student_id IN (SELECT id FROM users WHERE role = 'STUDENT')")
                .executeUpdate();
        int enrollmentsRemoved = entityManager.createNativeQuery(
                        "DELETE FROM enrollments WHERE student_id IN (SELECT id FROM users WHERE role = 'STUDENT')")
                .executeUpdate();
        int devicesRemoved = entityManager.createNativeQuery(
                        "DELETE FROM devices WHERE user_id IN (SELECT id FROM users WHERE role = 'STUDENT')")
                .executeUpdate();
        int usersRemoved = entityManager.createNativeQuery("DELETE FROM users WHERE role = 'STUDENT'")
                .executeUpdate();

        log.info(
                "Reset student accounts: {} users, {} devices, {} enrollments, {} attendance rows, {} override rows removed",
                usersRemoved,
                devicesRemoved,
                enrollmentsRemoved,
                attendanceRemoved,
                attendanceOverridesRemoved);
    }

    private void seedStudents(
            String department,
            String prefix,
            int start,
            int end,
            int passwordOffset,
            Set<String> existingStudentIds,
            Set<String> existingEmails) {
        int created = 0;
        List<User> newUsers = new ArrayList<>();

        for (int i = start; i <= end; i++) {
            String studentId = prefix + String.format("%04d", i);
            String password = prefix + String.format("%03d", passwordOffset + (i - start));
            String email = studentId + "@smart.edu";
            String name = department + " Student " + i;

            if (existingStudentIds.contains(studentId)) {
                continue;
            }
            if (existingEmails.contains(email)) {
                continue;
            }

            User user = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(Role.STUDENT)
                    .studentId(studentId)
                    .department(department)
                    .build();

            newUsers.add(user);
            existingStudentIds.add(studentId);
            existingEmails.add(email);
            created++;
        }

        if (!newUsers.isEmpty()) {
            userRepository.saveAll(newUsers);
        }

        if (created > 0) {
            log.info("Seeded {} {} students", created, department);
        } else {
            log.info("{} students already seeded, skipping", department);
        }
    }
}
