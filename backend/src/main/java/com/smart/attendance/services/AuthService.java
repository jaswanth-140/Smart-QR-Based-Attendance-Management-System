package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;
import com.smart.attendance.payload.JwtResponse;
import com.smart.attendance.payload.LoginRequest;
import com.smart.attendance.payload.RegisterRequest;
import com.smart.attendance.repositories.UserRepository;
import com.smart.attendance.security.JwtUtils;
import com.smart.attendance.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public JwtResponse login(LoginRequest loginRequest) {
        String identifier = loginRequest.getIdentifier().trim();

        if (!identifier.contains("@")) {
            User studentUser = userRepository.findByStudentId(identifier)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid user ID or password"));
            identifier = studentUser.getEmail();
        } else {
            identifier = identifier.toLowerCase();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .build();
    }

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        throw new ApiException(HttpStatus.FORBIDDEN, "Self-registration is disabled");
    }
}
