package com.srptraders.backend.service;

import com.srptraders.backend.entity.PasswordResetOtp;
import com.srptraders.backend.entity.User;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.PasswordResetOtpRepository;
import com.srptraders.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void sendOtp(String email) {
        // Check user exists
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email!"));

        // Delete old OTPs
        otpRepository.deleteByEmail(email);

        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Save OTP
        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();
        otpRepository.save(resetOtp);

        // Send Email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset OTP - SRP Traders");
            message.setText(
                    "Dear Customer,\n\n" +
                            "Your OTP for password reset is:\n\n" +
                            "🔐 " + otp + "\n\n" +
                            "This OTP is valid for 10 minutes only.\n" +
                            "Do not share this OTP with anyone.\n\n" +
                            "If you did not request this, please ignore this email.\n\n" +
                            "Regards,\n" +
                            "SRP Traders Team\n" +
                            "Mumbai, Chembur"
            );
            mailSender.send(message);
            log.info("OTP sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
            throw new RuntimeException("Failed to send OTP. Please try again!");
        }
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        // Find OTP
        PasswordResetOtp resetOtp = otpRepository
                .findByEmailAndOtpAndUsedFalse(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP!"));

        // Check expiry
        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired! Please request a new one.");
        }

        // Update password
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used
        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);
    }
}