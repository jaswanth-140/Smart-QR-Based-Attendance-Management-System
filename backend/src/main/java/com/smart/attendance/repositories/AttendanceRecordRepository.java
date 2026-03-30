package com.smart.attendance.repositories;

import com.smart.attendance.models.AttendanceRecord;
import com.smart.attendance.models.Session;
import com.smart.attendance.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySession(Session session);

    List<AttendanceRecord> findBySessionId(Long sessionId);

    List<AttendanceRecord> findByStudent(User student);

    List<AttendanceRecord> findBySession_Course_Id(Long courseId);

    Optional<AttendanceRecord> findBySessionAndStudent(Session session, User student);
}
