package com.srptraders.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String userName;
    private String userEmail;
    private List<OrderItemDTO> orderItems;
    private Double totalAmount;
    private Double deliveryCharge;
    private Double grandTotal;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPincode;
    private String deliveryPhone;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double price;
        private Double totalPrice;
    }
}