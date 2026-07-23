package com.srptraders.backend.service;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.entity.DeliveryOtp;
import com.srptraders.backend.entity.Order;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.DeliveryOtpRepository;
import com.srptraders.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryOtpService {

    private final DeliveryOtpRepository deliveryOtpRepository;
    private final OrderRepository orderRepository;
    private final JavaMailSender mailSender;

    @Transactional
    public ApiResponse generateAndSendOtp(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found!"));

        if (order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new RuntimeException("OTP can only be generated when order is OUT FOR DELIVERY!");
        }

        // Old OTP must Be Delete
        deliveryOtpRepository.deleteByOrderId(orderId);

        // New 6-digit OTP generate
        String otp = String.format("%06d", new Random().nextInt(999999));

        DeliveryOtp deliveryOtp = DeliveryOtp.builder()
                .orderId(orderId)
                .otp(otp)
                .used(false)
                .verified(false)
                .build();

        deliveryOtpRepository.save(deliveryOtp);

        // Professional email will send
        sendDeliveryOtpEmail(order, otp);

        return ApiResponse.success("Delivery OTP sent to customer!", null);
    }

    @Transactional
    public ApiResponse verifyOtp(Long orderId, String enteredOtp) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found!"));

        DeliveryOtp deliveryOtp = deliveryOtpRepository
                .findByOrderIdAndVerifiedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("No active OTP found for this order!"));

        if (!deliveryOtp.getOtp().equals(enteredOtp.trim())) {
            throw new RuntimeException("Invalid OTP! Please check and try again.");
        }

        // Here OTP verified
        deliveryOtp.setVerified(true);
        deliveryOtp.setUsed(true);
        deliveryOtp.setVerifiedAt(java.time.LocalDateTime.now());
        deliveryOtpRepository.save(deliveryOtp);

        // Here Order DELIVERED Marked
        order.setStatus(Order.OrderStatus.DELIVERED);
        orderRepository.save(order);

        // Delivery confirmation email
        sendDeliveryConfirmationEmail(order);

        return ApiResponse.success("OTP verified! Order marked as DELIVERED.", null);
    }

    private void sendDeliveryOtpEmail(Order order, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Your Delivery OTP for Order #" + order.getId() + " - SRP Traders");

            String orderDate = order.getCreatedAt() != null
                    ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                    : "N/A";

            //items list
            StringBuilder itemsHtml = new StringBuilder();
            if (order.getOrderItems() != null) {
                order.getOrderItems().forEach(item ->
                        itemsHtml.append("<tr>")
                                .append("<td style='padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;'>")
                                .append(item.getProduct().getName())
                                .append("</td>")
                                .append("<td style='padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;text-align:center;'>")
                                .append(item.getQuantity())
                                .append("</td>")
                                .append("<td style='padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;text-align:right;'>")
                                .append("Rs.").append(String.format("%.0f", item.getTotalPrice()))
                                .append("</td>")
                                .append("</tr>")
                );
            }

            String html = "<!DOCTYPE html>"
                    + "<html><head><meta charset='UTF-8'>"
                    + "<meta name='viewport' content='width=device-width,initial-scale=1.0'>"
                    + "</head><body style='margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;'>"

                    // Header
                    + "<div style='max-width:600px;margin:0 auto;background:#ffffff;'>"
                    + "<div style='background:#0ea5e9;padding:24px 32px;text-align:center;'>"
                    + "<img src='https://placehold.co/60x60/ffffff/0ea5e9?text=SRP' alt='SRP Traders' style='width:60px;height:60px;border-radius:12px;margin-bottom:12px;'/>"
                    + "<h1 style='color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;'>SRP Traders</h1>"
                    + "<p style='color:#bae6fd;margin:4px 0 0;font-size:13px;'>Hardware & Industrial Tools — Chembur, Mumbai</p>"
                    + "</div>"

                    // Main Content
                    + "<div style='padding:32px;'>"

                    // Greeting
                    + "<p style='color:#374151;font-size:16px;margin:0 0 8px;'>Dear <strong>" + order.getUser().getFullName() + "</strong>,</p>"
                    + "<p style='color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;'>"
                    + "Your order is out for delivery today! Please share the OTP below with our delivery executive to receive your package."
                    + "</p>"

                    // OTP Box
                    + "<div style='background:#f0f9ff;border:2px dashed #0ea5e9;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;'>"
                    + "<p style='color:#0369a1;font-size:13px;font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;'>Your Delivery OTP</p>"
                    + "<p style='color:#0c4a6e;font-size:42px;font-weight:700;margin:0 0 8px;letter-spacing:10px;font-family:monospace;'>" + otp + "</p>"
                    + "<p style='color:#6b7280;font-size:12px;margin:0;'>Share this OTP only with the SRP Traders delivery executive</p>"
                    + "</div>"

                    // Security Warning
                    + "<div style='background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 24px;'>"
                    + "<p style='color:#92400e;font-size:13px;margin:0;font-weight:600;'>Security Notice</p>"
                    + "<p style='color:#92400e;font-size:13px;margin:4px 0 0;'>Do NOT share this OTP with anyone over phone or email. Our team will NEVER ask for your OTP via call.</p>"
                    + "</div>"

                    // Order Details
                    + "<div style='background:#f9fafb;border-radius:12px;padding:20px;margin:0 0 24px;'>"
                    + "<h3 style='color:#111827;font-size:15px;font-weight:700;margin:0 0 16px;'>Order Details</h3>"
                    + "<table style='width:100%;border-collapse:collapse;'>"
                    + "<tr>"
                    + "<td style='color:#6b7280;font-size:13px;padding:4px 0;'>Order ID</td>"
                    + "<td style='color:#111827;font-size:13px;font-weight:600;text-align:right;'>#" + order.getId() + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='color:#6b7280;font-size:13px;padding:4px 0;'>Order Date</td>"
                    + "<td style='color:#111827;font-size:13px;text-align:right;'>" + orderDate + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='color:#6b7280;font-size:13px;padding:4px 0;'>Total Amount</td>"
                    + "<td style='color:#111827;font-size:13px;font-weight:700;text-align:right;'>Rs." + String.format("%.0f", order.getGrandTotal()) + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='color:#6b7280;font-size:13px;padding:4px 0;'>Payment</td>"
                    + "<td style='color:#111827;font-size:13px;text-align:right;'>" + (order.getPaymentMethod() == Order.PaymentMethod.ONLINE ? "Online (Paid)" : "Cash on Delivery") + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='color:#6b7280;font-size:13px;padding:4px 0;'>Delivery Address</td>"
                    + "<td style='color:#111827;font-size:13px;text-align:right;'>" + order.getDeliveryAddress() + ", " + order.getDeliveryCity() + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>"

                    // Items
                    + "<div style='margin:0 0 24px;'>"
                    + "<h3 style='color:#111827;font-size:15px;font-weight:700;margin:0 0 12px;'>Items in this Order</h3>"
                    + "<table style='width:100%;border-collapse:collapse;'>"
                    + "<tr style='border-bottom:2px solid #e5e7eb;'>"
                    + "<th style='text-align:left;padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;'>Product</th>"
                    + "<th style='text-align:center;padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;'>Qty</th>"
                    + "<th style='text-align:right;padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;'>Amount</th>"
                    + "</tr>"
                    + itemsHtml
                    + "</table>"
                    + "</div>"

                    // Footer note
                    + "<p style='color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 8px;'>"
                    + "If you have any questions or need help, contact us at "
                    + "<a href='mailto:info@srptraders.in' style='color:#0ea5e9;'>info@srptraders.in</a> "
                    + "or call <a href='tel:+919876543210' style='color:#0ea5e9;'>+91 98765 43210</a>."
                    + "</p>"
                    + "<p style='color:#6b7280;font-size:13px;margin:0;'>Thank you for shopping with <strong>SRP Traders</strong>!</p>"
                    + "</div>"

                    // Footer
                    + "<div style='background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;'>"
                    + "<p style='color:#9ca3af;font-size:12px;margin:0 0 4px;'>SRP Traders | Shop No. 12, Chembur Market, Chembur East, Mumbai - 400071</p>"
                    + "<p style='color:#9ca3af;font-size:12px;margin:0;'>GST: 27XXXXX1234X1ZX | © 2025 SRP Traders. All rights reserved.</p>"
                    + "</div>"
                    + "</div>"
                    + "</body></html>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Delivery OTP email sent to: {}", order.getUser().getEmail());

        } catch (Exception e) {
            log.error("Failed to send delivery OTP email: {}", e.getMessage());
        }
    }

    private void sendDeliveryConfirmationEmail(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Delivered Successfully! #" + order.getId() + " - SRP Traders");

            String html = "<!DOCTYPE html>"
                    + "<html><body style='margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;'>"
                    + "<div style='max-width:600px;margin:0 auto;background:#ffffff;'>"
                    + "<div style='background:#0ea5e9;padding:24px 32px;text-align:center;'>"
                    + "<h1 style='color:#ffffff;margin:0;font-size:22px;'>SRP Traders</h1>"
                    + "<p style='color:#bae6fd;margin:4px 0 0;font-size:13px;'>Hardware & Industrial Tools</p>"
                    + "</div>"
                    + "<div style='padding:32px;text-align:center;'>"
                    + "<div style='width:64px;height:64px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;'>"
                    + "<span style='font-size:32px;'>✓</span>"
                    + "</div>"
                    + "<h2 style='color:#065f46;font-size:22px;margin:0 0 8px;'>Order Delivered!</h2>"
                    + "<p style='color:#6b7280;font-size:15px;margin:0 0 24px;'>Your order #" + order.getId() + " has been successfully delivered.</p>"
                    + "<p style='color:#6b7280;font-size:14px;margin:0 0 8px;'>We hope you love your purchase!</p>"
                    + "<p style='color:#6b7280;font-size:14px;margin:0;'>Please leave a review to help other customers.</p>"
                    + "</div>"
                    + "<div style='background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;'>"
                    + "<p style='color:#9ca3af;font-size:12px;margin:0;'>SRP Traders | Chembur, Mumbai | info@srptraders.in</p>"
                    + "</div>"
                    + "</div>"
                    + "</body></html>";

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send delivery confirmation email: {}", e.getMessage());
        }
    }
}