package com.srptraders.backend.controller;

import com.srptraders.backend.dto.ProductDTO;
import com.srptraders.backend.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // Product Detail page — similar products
    @GetMapping("/similar/{productId}")
    public ResponseEntity<List<ProductDTO>> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(
                recommendationService.getSimilarProducts(productId, limit));
    }

    // Home page — personalized (login required)
    @GetMapping("/personalized")
    public ResponseEntity<List<ProductDTO>> getPersonalized(
            @RequestParam(defaultValue = "8") int limit,
            Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(
                recommendationService.getPersonalizedRecommendations(email, limit));
    }

    // Cart page — cart based recommendations
    @GetMapping("/cart")
    public ResponseEntity<List<ProductDTO>> getCartRecommendations(
            @RequestParam List<Long> productIds,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(
                recommendationService.getCartRecommendations(productIds, limit));
    }

    // Public — top rated (no login needed)
    @GetMapping("/top-rated")
    public ResponseEntity<List<ProductDTO>> getTopRated(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(
                recommendationService.getTopRatedProducts(limit));
    }
}