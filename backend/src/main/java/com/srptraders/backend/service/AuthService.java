package com.srptraders.backend.service;

import com.srptraders.backend.dto.*;
import com.srptraders.backend.entity.User;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.UserRepository;
import com.srptraders.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobile(request.getMobile())
                .address(request.getAddress())
                .gstNumber(request.getGstNumber())
                .role(User.Role.USER)
                .status(User.UserStatus.PENDING_APPROVAL)
                .build();

        userRepository.save(user);

        emailService.sendAdminNotification(user);

        return ApiResponse.success(
                "Registration successful! Awaiting admin approval.", null);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password!"));

        if (user.getStatus() == User.UserStatus.PENDING_APPROVAL) {
            throw new RuntimeException(
                    "Your account is pending admin approval!");
        }

        if (user.getStatus() == User.UserStatus.REJECTED) {
            throw new RuntimeException(
                    "Your account has been rejected!");
        }

        if (user.getStatus() == User.UserStatus.BANNED) {
            throw new RuntimeException(
                    "Your account has been banned!");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password! Please try again.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(UserDTO.fromUser(user))
                .build();
    }
}