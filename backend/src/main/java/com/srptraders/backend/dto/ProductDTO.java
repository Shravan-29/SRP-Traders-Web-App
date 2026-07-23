package com.srptraders.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double originalPrice;
    private Integer discount;
    private String image;
    private Integer stock;
    private Double rating;
    private Integer reviewCount;
    private Boolean featured;
    private String category;
    private Long categoryId;
    private String warrantyPeriod;
    private String warrantyType;
}