package com.smart.attendance.services;

import com.smart.attendance.exceptions.ApiException;
import com.smart.attendance.models.Role;
import com.smart.attendance.payload.RegisterRequest;
import com.smart.attendance.repositories.UserRepository;
import com.smart.attendance.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerShouldBeDisabledForSelfService() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Student User");
        request.setEmail("student@example.com");
        request.setPassword("password123");
        request.setRole(Role.STUDENT);

        assertThrows(ApiException.class, () -> authService.register(request));
    }
}
