package com.srptraders.backend.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private String userName;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer rating;
    private String comment;
    private String image;
    private LocalDateTime createdAt;
}