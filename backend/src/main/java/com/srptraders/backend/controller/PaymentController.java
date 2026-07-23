package com.srptraders.backend.controller;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.PaymentVerifyRequest;
import com.srptraders.backend.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, Double> request) {
        try {
            Double amount = request.get("amount");
            Map<String, Object> order = razorpayService.createOrder(amount);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyPayment(
            @RequestBody PaymentVerifyRequest request) {
        boolean isValid = razorpayService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        if (isValid) {
            return ResponseEntity.ok(
                    ApiResponse.success("Payment verified!",
                            Map.of("paymentId", request.getRazorpayPaymentId()))
            );
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment verification failed!"));
        }
    }
}