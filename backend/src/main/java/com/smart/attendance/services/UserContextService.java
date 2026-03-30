package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.User;
import com.smart.attendance.repositories.UserRepository;
import com.smart.attendance.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserContextService {

    private final UserRepository userRepository;

    public User requireCurrentUser(UserDetailsImpl userDetails) {
        if (userDetails == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User account is no longer available"));
    }
}
