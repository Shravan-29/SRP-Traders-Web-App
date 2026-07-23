package com.srptraders.backend.controller;

import com.srptraders.backend.entity.Order;
import com.srptraders.backend.entity.User;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.OrderRepository;
import com.srptraders.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/invoice")
@RequiredArgsConstructor
public class InvoiceController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @GetMapping("/{orderId}")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable Long orderId,
            Authentication auth) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found!"));

        User user = getUser(auth, order);
        String html = generateInvoiceHtml(order, user);
        byte[] bytes = html.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        headers.setContentDispositionFormData("attachment",
                "SRP-Invoice-" + orderId + ".html");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    @GetMapping("/{orderId}/view")
    public ResponseEntity<String> viewInvoice(
            @PathVariable Long orderId,
            Authentication auth) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found!"));

        User user = getUser(auth, order);
        String html = generateInvoiceHtml(order, user);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    private User getUser(Authentication auth, Order order) {
        if (auth != null && auth.getName() != null) {
            return userRepository.findByEmail(auth.getName())
                    .orElse(order.getUser());
        }
        return order.getUser();
    }

    private String generateInvoiceHtml(Order order, User user) {
        StringBuilder items = new StringBuilder();
        double subtotal = 0;

        if (order.getOrderItems() != null) {
            for (var item : order.getOrderItems()) {
                double total = item.getPrice() * item.getQuantity();
                subtotal += total;
                items.append(String.format(
                        "<tr>" +
                                "<td style='padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;'>%s</td>" +
                                "<td style='padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:14px;color:#64748b;'>%d</td>" +
                                "<td style='padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;color:#64748b;'>&#8377;%s</td>" +
                                "<td style='padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:700;color:#0f172a;'>&#8377;%s</td>" +
                                "</tr>",
                        item.getProduct().getName(),
                        item.getQuantity(),
                        String.format("%,.0f", item.getPrice()),
                        String.format("%,.0f", total)
                ));
            }
        }

        String date = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "N/A";

        double delivery = order.getDeliveryCharge() != null ? order.getDeliveryCharge() : 0;
        double grand = order.getGrandTotal() != null ? order.getGrandTotal() : subtotal + delivery;
        boolean isCOD = order.getPaymentMethod() == Order.PaymentMethod.CASH_ON_DELIVERY;

        String gst = (user.getGstNumber() != null && !user.getGstNumber().isEmpty())
                ? "<br/>GST: " + user.getGstNumber()
                : "";

        String deliveryHtml = (delivery == 0)
                ? "<span style='color:#16a34a;font-weight:600;'>FREE</span>"
                : "&#8377;" + String.format("%,.0f", delivery);

        String html = "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "<meta charset='UTF-8'/>" +
                "<meta name='viewport' content='width=device-width,initial-scale=1'/>" +
                "<title>Invoice #" + order.getId() + " - SRP Traders</title>" +
                "<style>" +
                "* { margin:0; padding:0; box-sizing:border-box; }" +
                "body { font-family:'Segoe UI',Tahoma,Arial,sans-serif; background:#f0f4f8; color:#1e293b; }" +
                ".wrapper { max-width:820px; margin:30px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.10); }" +
                ".header { background:linear-gradient(135deg,#0369a1 0%,#0ea5e9 60%,#38bdf8 100%); padding:40px 48px; color:#fff; position:relative; overflow:hidden; }" +
                ".header::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; background:rgba(255,255,255,0.07); border-radius:50%; }" +
                ".header::after { content:''; position:absolute; bottom:-80px; right:80px; width:160px; height:160px; background:rgba(255,255,255,0.05); border-radius:50%; }" +
                ".header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }" +
                ".brand { display:flex; align-items:center; gap:14px; }" +
                ".brand-icon { width:56px; height:56px; background:rgba(255,255,255,0.15); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:28px; border:1px solid rgba(255,255,255,0.25); }" +
                ".brand-name { font-size:26px; font-weight:800; letter-spacing:0.5px; }" +
                ".brand-tagline { font-size:12px; opacity:0.75; margin-top:3px; letter-spacing:0.5px; }" +
                ".invoice-label { text-align:right; }" +
                ".invoice-label .title { font-size:13px; opacity:0.7; text-transform:uppercase; letter-spacing:2px; }" +
                ".invoice-label .num { font-size:32px; font-weight:800; line-height:1.1; }" +
                ".header-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }" +
                ".hcard { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:14px 16px; }" +
                ".hcard-label { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; opacity:0.7; margin-bottom:6px; }" +
                ".hcard-value { font-size:13px; font-weight:600; line-height:1.6; }" +
                ".body { padding:40px 48px; }" +
                ".section-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin-bottom:14px; padding-bottom:10px; border-bottom:2px solid #f1f5f9; }" +
                ".bill-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:36px; }" +
                ".bill-card { background:#f8fafc; border-radius:12px; padding:20px; }" +
                ".bill-name { font-size:17px; font-weight:700; color:#0f172a; margin-bottom:6px; }" +
                ".bill-detail { font-size:13px; color:#64748b; line-height:1.8; }" +
                ".status-pill { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:30px; font-size:13px; font-weight:700; margin-top:10px; }" +
                ".pill-paid { background:#dcfce7; color:#15803d; }" +
                ".pill-cod { background:#fef3c7; color:#b45309; }" +
                "table { width:100%; border-collapse:collapse; margin-bottom:32px; border-radius:12px; overflow:hidden; border:1px solid #f1f5f9; }" +
                "thead tr { background:#f8fafc; }" +
                "th { padding:14px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; }" +
                "tbody tr:hover { background:#fafbfc; }" +
                ".totals-wrap { display:flex; justify-content:flex-end; margin-bottom:36px; }" +
                ".totals { width:300px; background:#f8fafc; border-radius:12px; padding:20px; }" +
                ".t-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0; font-size:14px; color:#64748b; border-bottom:1px solid #f1f5f9; }" +
                ".t-row:last-child { border-bottom:none; }" +
                ".t-grand { font-size:18px; font-weight:800; color:#0f172a; padding-top:12px; margin-top:4px; }" +
                ".t-grand span:last-child { color:#0284c7; }" +
                ".thankyou { background:linear-gradient(135deg,#f0f9ff,#e0f2fe); border:1px solid #bae6fd; border-radius:14px; padding:24px 28px; text-align:center; margin-bottom:36px; }" +
                ".thankyou h3 { font-size:20px; font-weight:800; color:#0284c7; margin-bottom:6px; }" +
                ".thankyou p { font-size:13px; color:#475569; }" +
                ".footer { background:#0f172a; padding:24px 48px; display:flex; justify-content:space-between; align-items:center; }" +
                ".footer-brand { color:#38bdf8; font-size:16px; font-weight:800; }" +
                ".footer-sub { color:#64748b; font-size:12px; margin-top:3px; }" +
                ".footer-contact { text-align:right; color:#64748b; font-size:12px; line-height:1.8; }" +
                ".btn-row { display:flex; gap:12px; justify-content:center; margin-bottom:32px; }" +
                ".btn-print { background:#0284c7; color:#fff; border:none; padding:14px 36px; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; }" +
                ".btn-close { background:#f1f5f9; color:#475569; border:none; padding:14px 36px; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; }" +
                ".btn-print:hover { background:#0369a1; }" +
                ".btn-close:hover { background:#e2e8f0; }" +
                "@media print { body { background:#fff; } .no-print { display:none !important; } .wrapper { box-shadow:none; margin:0; border-radius:0; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='wrapper'>" +

                "<div class='header'>" +
                "<div class='header-top'>" +
                "<div class='brand'>" +
                "<div class='brand-icon' style='background:rgba(255,255,255,0.95);padding:4px;'>" +
                "<img src='http://localhost:5173/logo.png' alt='SRP' style='width:75px;height:75px;object-fit:contain;'/>" +
                "</div>" +
                "<div>" +
                "<div class='brand-name'>SRP Traders</div>" +
                "<div class='brand-tagline'>Hardware &amp; Industrial Tools &bull; Mumbai</div>" +
                "</div>" +
                "</div>" +
                "<div class='invoice-label'>" +
                "<div class='title'>Tax Invoice</div>" +
                "<div class='num'>#" + order.getId() + "</div>" +
                "</div>" +
                "</div>" +
                "<div class='header-grid'>" +
                "<div class='hcard'><div class='hcard-label'>Invoice Date</div><div class='hcard-value'>" + date + "</div></div>" +
                "<div class='hcard'><div class='hcard-label'>Order Status</div><div class='hcard-value'>" + (order.getStatus() != null ? order.getStatus().name() : "PENDING") + "</div></div>" +
                "<div class='hcard'><div class='hcard-label'>Payment</div><div class='hcard-value'>" + (isCOD ? "Cash on Delivery" : "Online Paid") + "</div></div>" +
                "</div>" +
                "</div>" +

                "<div class='body'>" +
                "<div class='bill-grid'>" +

                "<div class='bill-card'>" +
                "<div class='section-label'>Bill From</div>" +
                "<div class='bill-name'>SRP Traders</div>" +
                "<div class='bill-detail'>" +
                "Shop No. 12, Chembur Market<br/>" +
                "Chembur East, Mumbai - 400071<br/>" +
                "Maharashtra, India<br/>" +
                "GST: 27XXXXX1234X1ZX<br/>" +
                "Phone: +91 98765 43210<br/>" +
                "Email: info@srptraders.in" +
                "</div>" +
                "</div>" +

                "<div class='bill-card'>" +
                "<div class='section-label'>Bill To</div>" +
                "<div class='bill-name'>" + user.getFullName() + "</div>" +
                "<div class='bill-detail'>" +
                (order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "") + "<br/>" +
                (order.getDeliveryCity() != null ? order.getDeliveryCity() : "") + " - " +
                (order.getDeliveryPincode() != null ? order.getDeliveryPincode() : "") + "<br/>" +
                "Phone: " + (order.getDeliveryPhone() != null ? order.getDeliveryPhone() : "") + "<br/>" +
                "Email: " + user.getEmail() +
                gst +
                "</div>" +
                "<span class='status-pill " + (isCOD ? "pill-cod" : "pill-paid") + "'>" +
                (isCOD ? "Cash on Delivery" : "Payment Received") +
                "</span>" +
                "</div>" +
                "</div>" +

                "<div class='section-label'>Order Items</div>" +
                "<table>" +
                "<thead><tr>" +
                "<th style='width:50%'>Product Description</th>" +
                "<th style='width:12%;text-align:center'>Qty</th>" +
                "<th style='width:19%;text-align:right'>Unit Price</th>" +
                "<th style='width:19%;text-align:right'>Amount</th>" +
                "</tr></thead>" +
                "<tbody>" + items + "</tbody>" +
                "</table>" +

                "<div class='totals-wrap'>" +
                "<div class='totals'>" +
                "<div class='t-row'><span>Subtotal</span><span>&#8377;" + String.format("%,.0f", subtotal) + "</span></div>" +
                "<div class='t-row'><span>Delivery Charges</span><span>" + deliveryHtml + "</span></div>" +
                "<div class='t-row t-grand'><span>Grand Total</span><span>&#8377;" + String.format("%,.0f", grand) + "</span></div>" +
                "</div>" +
                "</div>" +

                "<div class='thankyou'>" +
                "<h3>Thank You for Your Order!</h3>" +
                "<p>We appreciate your business with SRP Traders.<br/>" +
                "For support: <strong>info@srptraders.in</strong> | <strong>+91 98765 43210</strong></p>" +
                "</div>" +

                "<div class='btn-row no-print'>" +
                "<button class='btn-print' onclick='window.print()'>Print Invoice</button>" +
                "<button class='btn-close' onclick='window.close()'>Close</button>" +
                "</div>" +

                "</div>" +

                "<div class='footer'>" +
                "<div>" +
                "<div class='footer-brand'>SRP Traders</div>" +
                "<div class='footer-sub'>Mumbai's Trusted Hardware Store Since 2010</div>" +
                "</div>" +
                "<div class='footer-contact'>" +
                "info@srptraders.in | +91 98765 43210<br/>" +
                "Chembur East, Mumbai - 400071, Maharashtra<br/>" +
                "GST: 27XXXXX1234X1ZX" +
                "</div>" +
                "</div>" +

                "</div>" +
                "</body>" +
                "</html>";

        return html;
    }
}