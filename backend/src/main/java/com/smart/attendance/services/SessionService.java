package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.AttendanceRecord;
import com.smart.attendance.models.AttendanceStatus;
import com.smart.attendance.models.Course;
import com.smart.attendance.models.Enrollment;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.Session;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.SessionQrCodeResponse;
import com.smart.attendance.payload.SessionCreateRequest;
import com.smart.attendance.repositories.AttendanceRecordRepository;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {
    private static final int QR_REFRESH_INTERVAL_SECONDS = 5;
    private static final int QR_GRACE_WINDOW_SECONDS = 5;

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CourseRosterService courseRosterService;

    @Transactional
    public Session createSession(User actor, SessionCreateRequest request) {
        if (actor.getRole() != Role.TEACHER && actor.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only teachers and admins can create sessions");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Course not found"));

        if (actor.getRole() == Role.TEACHER && !TeacherCourseAccessPolicy.canActorAccessCourse(actor, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Teachers can only create sessions for their own courses");
        }

        // Ensure one active session per course at a time.
        if (!sessionRepository.findByCourseAndIsActiveTrue(course).isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "An active session already exists for this course");
        }

        LocalDateTime now = LocalDateTime.now();

        Session session = Session.builder()
                .course(course)
            .startTime(now)
                .qrSecret(UUID.randomUUID().toString())
                .currentQrToken(generateQrToken())
            .currentQrExpiresAt(now.plusSeconds(QR_REFRESH_INTERVAL_SECONDS))
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isActive(true)
                .build();

        Session savedSession = sessionRepository.save(session);

        List<User> eligibleStudents = courseRosterService.getEligibleStudentsForCourse(course);
        if (!eligibleStudents.isEmpty()) {
            List<AttendanceRecord> seededRecords = new ArrayList<>();
            for (User student : eligibleStudents) {
                seededRecords.add(AttendanceRecord.builder()
                        .session(savedSession)
                        .student(student)
                        .timestamp(now)
                        .status(AttendanceStatus.ABSENT)
                        .confidenceScore(0)
                        .distanceMeters(null)
                        .build());
            }
            attendanceRecordRepository.saveAll(seededRecords);
        }

        return savedSession;
    }

    public List<Session> getActiveSessions(User actor) {
        if (actor.getRole() == Role.TEACHER) {
            return sessionRepository.findByIsActiveTrue().stream()
                    .filter(session -> TeacherCourseAccessPolicy.canActorAccessCourse(actor, session.getCourse()))
                    .toList();
        }

        if (actor.getRole() == Role.STUDENT) {
            return sessionRepository.findByIsActiveTrue().stream()
                    .filter(session -> courseRosterService.isStudentEligibleForCourse(actor, session.getCourse()))
                    .toList();
        }

        return sessionRepository.findByIsActiveTrue();
    }

    @Transactional
    public Session endSession(User actor, Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!TeacherCourseAccessPolicy.canActorAccessCourse(actor, session.getCourse())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to end this session");
        }

        if (!session.isActive()) {
            return session;
        }

        session.setActive(false);
        session.setEndTime(LocalDateTime.now());
        session.setCurrentQrToken(null);
        session.setCurrentQrExpiresAt(null);
        session.setPreviousQrToken(null);
        session.setPreviousQrGraceUntil(null);
        return sessionRepository.save(session);
    }

    public List<Session> getSessionsByCourse(User actor, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (actor.getRole() == Role.TEACHER && !TeacherCourseAccessPolicy.canActorAccessCourse(actor, course)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to view sessions for this course");
        }

        if (actor.getRole() == Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Students cannot view full session lists");
        }

        return sessionRepository.findByCourse(course);
    }

    @Transactional
    public SessionQrCodeResponse rotateQrToken(User actor, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!TeacherCourseAccessPolicy.canActorAccessCourse(actor, session.getCourse())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to manage this session QR");
        }

        if (!session.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Session is no longer active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (session.getCurrentQrToken() != null) {
            session.setPreviousQrToken(session.getCurrentQrToken());
            session.setPreviousQrGraceUntil(now.plusSeconds(QR_GRACE_WINDOW_SECONDS));
        }

        session.setCurrentQrToken(generateQrToken());
        session.setCurrentQrExpiresAt(now.plusSeconds(QR_REFRESH_INTERVAL_SECONDS));

        Session saved = sessionRepository.save(session);

        return SessionQrCodeResponse.builder()
                .sessionId(saved.getId())
                .qrToken(saved.getCurrentQrToken())
                .expiresAt(saved.getCurrentQrExpiresAt())
                .refreshIntervalSeconds(QR_REFRESH_INTERVAL_SECONDS)
                .build();
    }

    private String generateQrToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
