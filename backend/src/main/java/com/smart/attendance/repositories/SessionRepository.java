package com.smart.attendance.repositories;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCourse(Course course);

    List<Session> findByIsActiveTrue();

    List<Session> findByCourseAndIsActiveTrue(Course course);
}
