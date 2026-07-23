package com.srptraders.backend.service;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.UserDTO;
import com.srptraders.backend.entity.User;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getPendingUsers() {
        return userRepository.findByStatus(User.UserStatus.PENDING_APPROVAL)
                .stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        return UserDTO.fromUser(user);
    }

    public ApiResponse approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        user.setStatus(User.UserStatus.APPROVED);
        userRepository.save(user);
        emailService.sendApprovalEmail(user);
        return ApiResponse.success("User approved successfully!", null);
    }

    public ApiResponse rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        user.setStatus(User.UserStatus.REJECTED);
        userRepository.save(user);
        emailService.sendRejectionEmail(user);
        return ApiResponse.success("User rejected!", null);
    }

    public ApiResponse banUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        user.setStatus(User.UserStatus.BANNED);
        userRepository.save(user);
        return ApiResponse.success("User banned!", null);
    }

    public ApiResponse deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        userRepository.delete(user);
        return ApiResponse.success("User deleted!", null);
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        return UserDTO.fromUser(user);
    }
}