package com.srptraders.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {

    @NotNull(message = "Items are required")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String paymentId;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotBlank(message = "Delivery city is required")
    private String deliveryCity;

    @NotBlank(message = "Pincode is required")
    private String deliveryPincode;

    @NotBlank(message = "Phone is required")
    private String deliveryPhone;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}