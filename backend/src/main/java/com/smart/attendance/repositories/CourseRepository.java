package com.smart.attendance.repositories;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacher(User teacher);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Course> findById(Long id);

    List<Course> findByCodeIn(List<String> codes);

    List<Course> findByTeacherEmailContainingIgnoreCaseOrTeacherNameContainingIgnoreCase(String emailToken, String nameToken);

    Optional<Course> findByCode(String code);

    List<Course> findByCodeStartingWith(String codePrefix);
}
