package com.srptraders.backend.service;

import com.srptraders.backend.dto.ProductDTO;
import com.srptraders.backend.dto.ProductRequest;
import com.srptraders.backend.entity.Category;
import com.srptraders.backend.entity.Product;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.CategoryRepository;
import com.srptraders.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductDTO> getAllProducts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, sortBy));
        return productRepository.findByActiveTrue(pageable)
                .map(this::toDTO);
    }

    public Page<ProductDTO> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(keyword, pageable)
                .map(this::toDTO);
    }

    public Page<ProductDTO> getProductsByCategory(
            Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable)
                .map(this::toDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found!"));
        return toDTO(product);
    }

    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getLatestProducts() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getTopRatedProducts() {
        return productRepository.findTop8ByActiveTrueOrderByRatingDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProductDTO createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found!"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .discount(request.getDiscount())
                .image(request.getImage())
                .stock(request.getStock())
                .featured(request.getFeatured())
                .category(category)
                .active(true)
                .warrantyPeriod(request.getWarrantyPeriod())
                .warrantyType(request.getWarrantyType())
                .build();

        return toDTO(productRepository.save(product));
    }

    public ProductDTO updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found!"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found!"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscount(request.getDiscount());
        product.setImage(request.getImage());
        product.setStock(request.getStock());
        product.setFeatured(request.getFeatured());
        product.setWarrantyPeriod(request.getWarrantyPeriod());
        product.setWarrantyType(request.getWarrantyType());
        product.setCategory(category);

        return toDTO(productRepository.save(product));

    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found!"));
        product.setActive(false);
        productRepository.save(product);
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
                .category(product.getCategory() != null ?
                        product.getCategory().getName() : null)
                .categoryId(product.getCategory() != null ?
                        product.getCategory().getId() : null)
                .build();
    }
}