package com.srptraders.backend.controller;

import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.entity.User;
import com.srptraders.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.UserDTO;
import com.srptraders.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.srptraders.backend.dto.RegisterRequest;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @GetMapping("/user/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication auth) {
        return ResponseEntity.ok(
                userService.getCurrentUser(auth.getName()));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/users/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PutMapping("/admin/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PutMapping("/admin/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }

    @PutMapping("/admin/users/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.banUser(id));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }

    @PutMapping("/user/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestBody UserDTO updateRequest,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
        user.setFullName(updateRequest.getFullName());
        user.setMobile(updateRequest.getMobile());
        user.setAddress(updateRequest.getAddress());
        user.setGstNumber(updateRequest.getGstNumber());
        userRepository.save(user);
        return ResponseEntity.ok(UserDTO.fromUser(user));
    }

    @PutMapping("/user/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @RequestBody java.util.Map<String, String> request,
            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
        if (!passwordEncoder.matches(request.get("oldPassword"), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect!");
        }
        user.setPassword(passwordEncoder.encode(request.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully!", null));
    }

    // ─── Approve via Email ──
    @GetMapping(value = "/admin/users/{id}/approve-email", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> approveUserViaEmail(@PathVariable Long id) {
        try {
            userService.approveUser(id);
            return ResponseEntity.ok("""
                <html>
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #f8fafc;">
                    <div style="max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                        <h2 style="color: #22c55e;">User Approved!</h2>
                        <p style="color: #64748b;">User has been approved and notified via email.</p>
                        <a href="http://localhost:5173/admin/users"
                           style="background: #0ea5e9; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 15px;">
                            Go to Admin Panel
                        </a>
                    </div>
                </body>
                </html>
                """);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body("<h2>Error: " + e.getMessage() + "</h2>");
        }
    }

    // ─── Reject through Email ───
    @GetMapping(value = "/admin/users/{id}/reject-email", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> rejectUserViaEmail(@PathVariable Long id) {
        try {
            userService.rejectUser(id);
            return ResponseEntity.ok("""
                <html>
                <body style="font-family: Arial; text-align: center; padding: 50px; background: #f8fafc;">
                    <div style="max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="font-size: 60px; margin-bottom: 20px;">❌</div>
                        <h2 style="color: #ef4444;">User Rejected!</h2>
                        <p style="color: #64748b;">User has been rejected and notified via email.</p>
                        <a href="http://localhost:5173/admin/users"
                           style="background: #0ea5e9; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 15px;">
                            Go to Admin Panel
                        </a>
                    </div>
                </body>
                </html>
                """);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body("<h2>Error: " + e.getMessage() + "</h2>");
        }

    }
    //delievery code
    @PostMapping("/admin/delivery-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> addDeliveryStaff(
            @RequestBody RegisterRequest request) {
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobile(request.getMobile())
                .address(request.getAddress() != null ? request.getAddress() : "Mumbai")
                .role(User.Role.DELIVERY)
                .status(User.UserStatus.APPROVED)
                .build();
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Delivery staff added!", null));
    }
}