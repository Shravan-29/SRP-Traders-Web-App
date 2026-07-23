package com.srptraders.backend.service;

import com.srptraders.backend.dto.ProductDTO;
import com.srptraders.backend.entity.Product;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Product Detail page ke liye — same category ke top rated products
     * Current product exclude hoga
     */
    public List<ProductDTO> getSimilarProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found!"));

        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;

        List<Product> allProducts = productRepository.findByActiveTrue(
                        org.springframework.data.domain.PageRequest.of(0, 100,
                                org.springframework.data.domain.Sort.by(
                                        org.springframework.data.domain.Sort.Direction.DESC, "rating")))
                .getContent();

        return allProducts.stream()
                .filter(p -> !p.getId().equals(productId)) // current product exclude
                .filter(p -> categoryId != null && p.getCategory() != null
                        && p.getCategory().getId().equals(categoryId)) // same category
                .sorted((a, b) -> {
                    // Score: rating * 0.7 + discount * 0.3
                    double scoreA = (a.getRating() != null ? a.getRating() : 0) * 0.7
                            + (a.getDiscount() != null ? a.getDiscount() : 0) * 0.3;
                    double scoreB = (b.getRating() != null ? b.getRating() : 0) * 0.7
                            + (b.getDiscount() != null ? b.getDiscount() : 0) * 0.3;
                    return Double.compare(scoreB, scoreA);
                })
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Logged in user ke liye personalized recommendations
     * Purchase history + wishlist + cart dekh ke suggest karta hai
     */
    public List<ProductDTO> getPersonalizedRecommendations(String email, int limit) {
        try {
            var user = userRepository.findByEmail(email)
                    .orElse(null);
            if (user == null) return getTopRatedProducts(limit);

            // User ki purchased categories collect karo
            Set<Long> purchasedCategoryIds = new HashSet<>();
            Set<Long> excludeProductIds = new HashSet<>();

            // Orders se categories
            orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                    .forEach(order -> {
                        if (order.getOrderItems() != null) {
                            order.getOrderItems().forEach(item -> {
                                if (item.getProduct() != null) {
                                    excludeProductIds.add(item.getProduct().getId());
                                    if (item.getProduct().getCategory() != null) {
                                        purchasedCategoryIds.add(item.getProduct().getCategory().getId());
                                    }
                                }
                            });
                        }
                    });

            // Cart se categories
            cartRepository.findByUserId(user.getId())
                    .forEach(cart -> {
                        excludeProductIds.add(cart.getProduct().getId());
                        if (cart.getProduct().getCategory() != null) {
                            purchasedCategoryIds.add(cart.getProduct().getCategory().getId());
                        }
                    });

            // Wishlist se categories
            wishlistRepository.findByUserId(user.getId())
                    .forEach(wish -> {
                        excludeProductIds.add(wish.getProduct().getId());
                        if (wish.getProduct().getCategory() != null) {
                            purchasedCategoryIds.add(wish.getProduct().getCategory().getId());
                        }
                    });

            // User reviews se categories
            reviewRepository.findByUserId(user.getId())
                    .forEach(review -> {
                        if (review.getProduct() != null && review.getProduct().getCategory() != null) {
                            purchasedCategoryIds.add(review.getProduct().getCategory().getId());
                        }
                    });

            // Agar koi history nahi — top rated return karo
            if (purchasedCategoryIds.isEmpty()) {
                return getTopRatedProducts(limit);
            }

            List<Product> allProducts = productRepository.findByActiveTrue(
                            org.springframework.data.domain.PageRequest.of(0, 200,
                                    org.springframework.data.domain.Sort.by(
                                            org.springframework.data.domain.Sort.Direction.DESC, "rating")))
                    .getContent();

            // Score calculate karo har product ke liye
            return allProducts.stream()
                    .filter(p -> !excludeProductIds.contains(p.getId()))
                    .filter(p -> p.getCategory() != null)
                    .map(p -> {
                        double score = 0;

                        // Category match karta hai toh zyada score
                        if (purchasedCategoryIds.contains(p.getCategory().getId())) {
                            score += 50;
                        }

                        // Rating score (0-5 → 0-30 points)
                        score += (p.getRating() != null ? p.getRating() : 0) * 6;

                        // Discount score (0-100% → 0-15 points)
                        score += (p.getDiscount() != null ? p.getDiscount() : 0) * 0.15;

                        // Review count score (max 5 points)
                        score += Math.min(p.getReviewCount() != null ? p.getReviewCount() * 0.1 : 0, 5);

                        // Featured boost
                        if (Boolean.TRUE.equals(p.getFeatured())) score += 5;

                        return Map.entry(p, score);
                    })
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .limit(limit)
                    .map(entry -> toDTO(entry.getKey()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Recommendation error: {}", e.getMessage());
            return getTopRatedProducts(limit);
        }
    }

    /**
     * Cart page ke liye — cart mein jo products hain unki categories ke
     * other popular products suggest karo
     */
    public List<ProductDTO> getCartRecommendations(List<Long> cartProductIds, int limit) {
        if (cartProductIds == null || cartProductIds.isEmpty()) {
            return getTopRatedProducts(limit);
        }

        // Cart products ki categories collect karo
        Set<Long> cartCategoryIds = cartProductIds.stream()
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .filter(p -> p.getCategory() != null)
                .map(p -> p.getCategory().getId())
                .collect(Collectors.toSet());

        List<Product> allProducts = productRepository.findByActiveTrue(
                        org.springframework.data.domain.PageRequest.of(0, 100,
                                org.springframework.data.domain.Sort.by(
                                        org.springframework.data.domain.Sort.Direction.DESC, "rating")))
                .getContent();

        return allProducts.stream()
                .filter(p -> !cartProductIds.contains(p.getId())) // cart items exclude
                .filter(p -> p.getCategory() != null && cartCategoryIds.contains(p.getCategory().getId()))
                .sorted((a, b) -> {
                    double scoreA = (a.getRating() != null ? a.getRating() : 0) * 6
                            + (a.getDiscount() != null ? a.getDiscount() : 0) * 0.2;
                    double scoreB = (b.getRating() != null ? b.getRating() : 0) * 6
                            + (b.getDiscount() != null ? b.getDiscount() : 0) * 0.2;
                    return Double.compare(scoreB, scoreA);
                })
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Fallback — top rated products
     */
    public List<ProductDTO> getTopRatedProducts(int limit) {
        return productRepository.findTop8ByActiveTrueOrderByRatingDesc()
                .stream()
                .limit(limit)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO toDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discount(product.getDiscount())
                .image(product.getImage())
                .stock(product.getStock())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .featured(product.getFeatured())
                .warrantyPeriod(product.getWarrantyPeriod())
                .warrantyType(product.getWarrantyType())
                .category(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .build();
    }
}