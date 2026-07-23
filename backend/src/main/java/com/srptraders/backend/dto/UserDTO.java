package com.srptraders.backend.dto;

import com.srptraders.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String fullName;
    private String email;
    private String mobile;
    private String address;
    private String gstNumber;
    private String role;
    private String status;

    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .address(user.getAddress())
                .gstNumber(user.getGstNumber())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }
}