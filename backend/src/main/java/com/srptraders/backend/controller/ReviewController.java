package com.srptraders.backend.controller;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.ReviewRequest;
import com.srptraders.backend.service.ReviewResponseDTO;
import com.srptraders.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication auth) {
        return ResponseEntity.ok(reviewService.createReview(request, auth.getName()));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ReviewResponseDTO>> getRecentReviews(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(reviewService.getRecentReviews(limit));
    }

    @GetMapping("/can-review/{productId}")
    public ResponseEntity<Boolean> canUserReview(
            @PathVariable Long productId,
            Authentication auth) {
        return ResponseEntity.ok(reviewService.canUserReview(productId, auth.getName()));
    }
}