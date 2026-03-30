package com.smart.attendance.repositories;

import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByStudentId(String studentId);

    Optional<User> findByNameIgnoreCase(String name);

    List<User> findByRole(Role role);

    List<User> findByRoleAndDepartment(Role role, String department);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);
}
