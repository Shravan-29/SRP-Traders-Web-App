package com.srptraders.backend.service;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.ReviewRequest;
import com.srptraders.backend.entity.Product;
import com.srptraders.backend.entity.Review;
import com.srptraders.backend.entity.User;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.ProductRepository;
import com.srptraders.backend.repository.ReviewRepository;
import com.srptraders.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse createReview(ReviewRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found!"));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new RuntimeException("You have already reviewed this product!");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .image(request.getImage())
                .build();

        reviewRepository.save(review);

        // Product ka average rating aur review count update karo
        Double avgRating = reviewRepository.getAverageRatingByProductId(product.getId());
        Long count = (long) reviewRepository.findByProductId(product.getId()).size();

        product.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        product.setReviewCount(count.intValue());
        productRepository.save(product);

        return ApiResponse.success("Review submitted successfully!", null);
    }

    public List<ReviewResponseDTO> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewResponseDTO> getRecentReviews(int limit) {
        return reviewRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Boolean canUserReview(Long productId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
        return !reviewRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private ReviewResponseDTO toDTO(Review review) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .userName(review.getUser().getFullName())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .productImage(review.getProduct().getImage())
                .rating(review.getRating())
                .comment(review.getComment())
                .image(review.getImage())
                .createdAt(review.getCreatedAt())
                .build();
    }
}