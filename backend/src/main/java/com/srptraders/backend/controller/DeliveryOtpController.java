//package com.srptraders.backend.controller;
//
//import com.srptraders.backend.dto.ApiResponse;
//import com.srptraders.backend.service.DeliveryOtpService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/delivery-otp")
//@RequiredArgsConstructor
//public class DeliveryOtpController {
//
//    private final DeliveryOtpService deliveryOtpService;
//
//    // Admin: Order SHIPPED karne ke baad OTP generate karo
//    @PostMapping("/generate/{orderId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse> generateOtp(@PathVariable Long orderId) {
//        return ResponseEntity.ok(deliveryOtpService.generateAndSendOtp(orderId));
//    }
//
//    // Admin: Delivery boy ne OTP liya — verify karo
//    @PostMapping("/verify/{orderId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse> verifyOtp(
//            @PathVariable Long orderId,
//            @RequestBody Map<String, String> request) {
//        String otp = request.get("otp");
//        if (otp == null || otp.trim().isEmpty()) {
//            return ResponseEntity.badRequest()
//                    .body(ApiResponse.error("OTP is required!"));
//        }
//        return ResponseEntity.ok(deliveryOtpService.verifyOtp(orderId, otp));
//    }
//}

//new code with delievery boy page for verify OTP of that product

package com.srptraders.backend.controller;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.service.DeliveryOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-otp")
@RequiredArgsConstructor
public class DeliveryOtpController {

    private final DeliveryOtpService deliveryOtpService;

    // Admin: SHIPPED karne ke baad OTP generate karo
    @PostMapping("/generate/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> generateOtp(@PathVariable Long orderId) {
        return ResponseEntity.ok(deliveryOtpService.generateAndSendOtp(orderId));
    }

    // Public: Delivery boy verify kare — no login needed
    @PostMapping("/verify/{orderId}")
    public ResponseEntity<ApiResponse> verifyOtp(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String otp = request.get("otp");
        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("OTP is required!"));
        }
        return ResponseEntity.ok(deliveryOtpService.verifyOtp(orderId, otp));
    }
}