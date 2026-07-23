package com.srptraders.backend.controller;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.OrderDTO;
import com.srptraders.backend.dto.OrderRequest;
import com.srptraders.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication auth) {
        return ResponseEntity.ok(
                orderService.createOrder(request, auth.getName()));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Authentication auth) {
        return ResponseEntity.ok(
                orderService.getUserOrders(auth.getName()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(
                orderService.updateOrderStatus(orderId, status));
    }
    @GetMapping("/delivery/assigned")
    @PreAuthorize("hasAnyRole('DELIVERY','ADMIN')")
    public ResponseEntity<List<OrderDTO>> getShippedOrders() {
        return ResponseEntity.ok(orderService.getShippedOrders());
    }

    @GetMapping("/delivery/{orderId}")
    public ResponseEntity<OrderDTO> getOrderForDelivery(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderForDelivery(orderId));
    }
}