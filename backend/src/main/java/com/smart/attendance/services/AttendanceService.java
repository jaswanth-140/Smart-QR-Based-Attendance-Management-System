package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.AttendanceRecord;
import com.smart.attendance.models.AttendanceStatus;
import com.smart.attendance.models.Device;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.Session;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.AttendanceOverrideRequest;
import com.smart.attendance.payload.AttendanceScanRequest;
import com.smart.attendance.repositories.AttendanceRecordRepository;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.DeviceRepository;
import com.smart.attendance.repositories.EnrollmentRepository;
import com.smart.attendance.repositories.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    // Earth radius in meters
    private static final double EARTH_RADIUS = 6371000;

    private final AttendanceRecordRepository attendanceRepository;
    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final DeviceRepository deviceRepository;
    private final CourseRosterService courseRosterService;

    @Transactional
    public AttendanceRecord scanQrCode(User student, AttendanceScanRequest request) {
        if (student.getRole() != Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can scan QR codes");
        }

        Session matchedSession = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Session not found"));

        if (!matchedSession.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This attendance session is no longer active");
        }

        if (!isQrTokenValid(matchedSession, request.getQrToken(), LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "QR code expired. Please scan the latest code");
        }

        if (!courseRosterService.isStudentEligibleForCourse(student, matchedSession.getCourse())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not enrolled in this class");
        }

        Device device = deviceRepository.findByHardwareIdentifier(request.getDeviceHardwareId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Scanned from an unregistered device"));

        if (!device.getUser().getId().equals(student.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Scanned from a device that is not yours");
        }

        AttendanceRecord existingRecord = attendanceRepository.findBySessionAndStudent(matchedSession, student)
                .orElse(null);

        if (existingRecord != null && existingRecord.getStatus() != AttendanceStatus.ABSENT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Attendance already recorded for this session");
        }

        double distance = calculateDistanceInMeters(
                matchedSession.getLatitude(), matchedSession.getLongitude(),
                request.getLatitude(), request.getLongitude());

        int confidence = 100;
        AttendanceStatus status = AttendanceStatus.PRESENT;

        if (distance > 50) {
            confidence = Math.max(0, 100 - (int) (distance - 50));
            status = AttendanceStatus.REVIEW;
        }

        device.setLastActiveAt(LocalDateTime.now());

        AttendanceRecord record;
        if (existingRecord != null) {
            record = existingRecord;
            record.setDevice(device);
            record.setTimestamp(LocalDateTime.now());
            record.setStatus(status);
            record.setConfidenceScore(confidence);
            record.setDistanceMeters(distance);
        } else {
            record = AttendanceRecord.builder()
                    .session(matchedSession)
                    .student(student)
                    .device(device)
                    .timestamp(LocalDateTime.now())
                    .status(status)
                    .confidenceScore(confidence)
                    .distanceMeters(distance)
                    .build();
        }

        return attendanceRepository.save(record);
    }

    private boolean isQrTokenValid(Session session, String qrToken, LocalDateTime now) {
        if (session.getCurrentQrToken() != null
                && session.getCurrentQrExpiresAt() != null
                && session.getCurrentQrToken().equals(qrToken)
                && !now.isAfter(session.getCurrentQrExpiresAt())) {
            return true;
        }

        return session.getPreviousQrToken() != null
                && session.getPreviousQrGraceUntil() != null
                && session.getPreviousQrToken().equals(qrToken)
                && !now.isAfter(session.getPreviousQrGraceUntil());
    }

    public List<AttendanceRecord> getStudentAttendance(User student) {
        if (student.getRole() != Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only students can fetch personal attendance history");
        }
        return attendanceRepository.findByStudent(student);
    }

    @Transactional
    public AttendanceRecord overrideAttendance(User actor, Long recordId, AttendanceOverrideRequest request) {
        AttendanceRecord record = attendanceRepository.findById(recordId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attendance record not found"));

        if (actor.getRole() != Role.ADMIN) {
            if (actor.getRole() != Role.TEACHER ||
                    !TeacherCourseAccessPolicy.canActorAccessCourse(actor, record.getSession().getCourse())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to override this attendance record");
            }
        }

        record.setStatus(request.getStatus());
        record.setOverrideReason(request.getReason().trim());
        record.setOverriddenBy(actor);
        record.setOverriddenAt(LocalDateTime.now());

        return attendanceRepository.save(record);
    }

    public List<AttendanceRecord> getSessionAttendance(User actor, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (actor.getRole() == Role.TEACHER && !TeacherCourseAccessPolicy.canActorAccessCourse(actor, session.getCourse())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to view this session attendance");
        }

        if (actor.getRole() == Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Students cannot view session attendance lists");
        }

        return attendanceRepository.findBySessionId(sessionId);
    }

    public List<AttendanceRecord> getCourseAttendance(User actor, Long courseId) {
        if (actor.getRole() == Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Students cannot view full course attendance reports");
        }

        if (actor.getRole() == Role.TEACHER) {
            var course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));
            if (!TeacherCourseAccessPolicy.canActorAccessCourse(actor, course)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to view this course report");
            }
        }

        return attendanceRepository.findBySession_Course_Id(courseId);
    }

    private double calculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }
}
