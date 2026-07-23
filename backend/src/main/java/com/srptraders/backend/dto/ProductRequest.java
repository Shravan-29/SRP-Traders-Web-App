package com.srptraders.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    private Double price;

    private Double originalPrice;

    private Integer discount;

    private String image;

    private Integer stock;

    private Boolean featured = false;

    private String warrantyPeriod;
    private String warrantyType;

    @NotNull(message = "Category is required")
    private Long categoryId;
}