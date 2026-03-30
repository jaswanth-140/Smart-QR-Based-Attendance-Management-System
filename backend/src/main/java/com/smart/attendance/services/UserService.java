package com.smart.attendance.services;

import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser(User user) {
        return user;
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
}
