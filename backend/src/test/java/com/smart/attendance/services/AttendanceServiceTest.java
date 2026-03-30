package com.smart.attendance.services;

import com.smart.attendance.models.AttendanceRecord;
import com.smart.attendance.models.AttendanceStatus;
import com.smart.attendance.models.Course;
import com.smart.attendance.models.Device;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.Session;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.AttendanceScanRequest;
import com.smart.attendance.repositories.AttendanceRecordRepository;
import com.smart.attendance.repositories.CourseRepository;
import com.smart.attendance.repositories.DeviceRepository;
import com.smart.attendance.repositories.SessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseRosterService courseRosterService;

    @InjectMocks
    private AttendanceService attendanceService;

    @Test
    void farDistanceShouldMarkRecordAsReview() {
        User teacher = User.builder().id(2L).role(Role.TEACHER).build();
        Course course = Course.builder().id(10L).teacher(teacher).build();
        Session session = Session.builder()
                .id(11L)
                .course(course)
                .qrSecret("secret")
                .currentQrToken("live-token")
                .currentQrExpiresAt(LocalDateTime.now().plusSeconds(5))
                .latitude(12.9716)
                .longitude(77.5946)
                .isActive(true)
                .build();

        User student = User.builder().id(1L).role(Role.STUDENT).build();
        Device device = Device.builder().id(3L).user(student).hardwareIdentifier("device-1").build();

        AttendanceScanRequest request = new AttendanceScanRequest();
        request.setSessionId(11L);
        request.setQrToken("live-token");
        request.setDeviceHardwareId("device-1");
        request.setLatitude(13.0500);
        request.setLongitude(77.8000);

        when(sessionRepository.findById(11L)).thenReturn(Optional.of(session));
        when(courseRosterService.isStudentEligibleForCourse(student, course)).thenReturn(true);
        when(deviceRepository.findByHardwareIdentifier("device-1")).thenReturn(Optional.of(device));
        when(attendanceRecordRepository.findBySessionAndStudent(session, student)).thenReturn(Optional.empty());
        when(attendanceRecordRepository.save(any(AttendanceRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceRecord result = attendanceService.scanQrCode(student, request);

        assertEquals(AttendanceStatus.REVIEW, result.getStatus());
    }
}
