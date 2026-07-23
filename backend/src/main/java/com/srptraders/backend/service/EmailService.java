//package com.srptraders.backend.service;
//
//import com.srptraders.backend.entity.User;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class EmailService {
//
//    private final JavaMailSender mailSender;
//
//    public void sendAdminNotification(User user) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo("shravankumarbishnoi98@gmail.com");
//            message.setSubject("New User Registration - SRP Traders");
//            message.setText(
//                    "New user registration request:\n\n" +
//                            "Name: " + user.getFullName() + "\n" +
//                            "Email: " + user.getEmail() + "\n" +
//                            "Mobile: " + user.getMobile() + "\n" +
//                            "Address: " + user.getAddress() + "\n" +
//                            "GST: " + user.getGstNumber() + "\n\n" +
//                            "Please login to admin panel to approve or reject."
//            );
//            mailSender.send(message);
//        } catch (Exception e) {
//            log.error("Failed to send admin notification email: {}", e.getMessage());
//        }
//    }
//
//    public void sendApprovalEmail(User user) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(user.getEmail());
//            message.setSubject("Account Approved - SRP Traders");
//            message.setText(
//                    "Dear " + user.getFullName() + ",\n\n" +
//                            "Your account has been approved!\n" +
//                            "You can now login at: http://localhost:5173/login\n\n" +
//                            "Welcome to SRP Traders!\n" +
//                            "Mumbai's trusted hardware store."
//            );
//            mailSender.send(message);
//        } catch (Exception e) {
//            log.error("Failed to send approval email: {}", e.getMessage());
//        }
//    }
//
//    public void sendRejectionEmail(User user) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(user.getEmail());
//            message.setSubject("Account Status - SRP Traders");
//            message.setText(
//                    "Dear " + user.getFullName() + ",\n\n" +
//                            "Unfortunately your account registration has been rejected.\n" +
//                            "Please contact us at info@srptraders.in for more information.\n\n" +
//                            "SRP Traders Team"
//            );
//            mailSender.send(message);
//        } catch (Exception e) {
//            log.error("Failed to send rejection email: {}", e.getMessage());
//        }
//    }
//
//    public void sendOrderStatusEmail(User user, String orderId, String status) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(user.getEmail());
//            message.setSubject("Order Update - SRP Traders");
//            message.setText(
//                    "Dear " + user.getFullName() + ",\n\n" +
//                            "Your order #" + orderId + " status has been updated to: " + status + "\n\n" +
//                            "Thank you for shopping with SRP Traders!\n" +
//                            "Mumbai's trusted hardware store."
//            );
//            mailSender.send(message);
//        } catch (Exception e) {
//            log.error("Failed to send order status email: {}", e.getMessage());
//        }
//    }
//}

//new code
package com.srptraders.backend.service;

import com.srptraders.backend.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    private static final String ADMIN_EMAIL = "shravanbshnoi8@gmail.com";
    private static final String ADMIN_URL = "http://localhost:5173/admin/users";
    private static final String BACKEND_URL = "http://localhost:8080/api";

    public void sendAdminNotification(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(ADMIN_EMAIL);
            helper.setSubject("New User Registration - SRP Traders");

            String approveUrl = BACKEND_URL + "/admin/users/" + user.getId() + "/approve-email";
            String rejectUrl = BACKEND_URL + "/admin/users/" + user.getId() + "/reject-email";

            String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: #0ea5e9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>"
                    + "<h1 style='color: white; margin: 0;'>SRP Traders</h1>"
                    + "<p style='color: #e0f2fe; margin: 5px 0 0;'>New User Registration Request</p>"
                    + "</div>"
                    + "<div style='background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;'>"
                    + "<h2 style='color: #1e293b;'>User Details:</h2>"
                    + "<table style='width: 100%; border-collapse: collapse;'>"
                    + "<tr style='border-bottom: 1px solid #e2e8f0;'>"
                    + "<td style='padding: 10px; color: #64748b; width: 40%;'>Name</td>"
                    + "<td style='padding: 10px; color: #1e293b; font-weight: bold;'>" + user.getFullName() + "</td>"
                    + "</tr>"
                    + "<tr style='border-bottom: 1px solid #e2e8f0;'>"
                    + "<td style='padding: 10px; color: #64748b;'>Email</td>"
                    + "<td style='padding: 10px; color: #1e293b;'>" + user.getEmail() + "</td>"
                    + "</tr>"
                    + "<tr style='border-bottom: 1px solid #e2e8f0;'>"
                    + "<td style='padding: 10px; color: #64748b;'>Mobile</td>"
                    + "<td style='padding: 10px; color: #1e293b;'>" + user.getMobile() + "</td>"
                    + "</tr>"
                    + "<tr style='border-bottom: 1px solid #e2e8f0;'>"
                    + "<td style='padding: 10px; color: #64748b;'>Address</td>"
                    + "<td style='padding: 10px; color: #1e293b;'>" + user.getAddress() + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 10px; color: #64748b;'>GST Number</td>"
                    + "<td style='padding: 10px; color: #1e293b;'>" + (user.getGstNumber() != null ? user.getGstNumber() : "Not provided") + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "<div style='margin-top: 30px; text-align: center;'>"
                    + "<p style='color: #64748b; margin-bottom: 20px;'>Do you want to approve this user?</p>"
                    + "<a href='" + approveUrl + "' style='background: #22c55e; color: white; padding: 14px 35px; "
                    + "text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-right: 15px; display: inline-block;'>"
                    + "YES - Approve</a>"
                    + "<a href='" + rejectUrl + "' style='background: #ef4444; color: white; padding: 14px 35px; "
                    + "text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;'>"
                    + "NO - Reject</a>"
                    + "</div>"
                    + "<p style='color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;'>"
                    + "Ya Admin Panel mein jaake manage karein: <a href='" + ADMIN_URL + "'>Admin Panel</a>"
                    + "</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Admin notification sent for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send admin notification email: {}", e.getMessage());
        }
    }

    public void sendApprovalEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Account Approved - SRP Traders");

            String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: #0ea5e9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>"
                    + "<h1 style='color: white; margin: 0;'>SRP Traders</h1>"
                    + "</div>"
                    + "<div style='background: #f8fafc; padding: 30px; text-align: center; border: 1px solid #e2e8f0;'>"
                    + "<div style='font-size: 50px; margin-bottom: 15px;'>🎉</div>"
                    + "<h2 style='color: #22c55e;'>Account Approved!</h2>"
                    + "<p style='color: #64748b;'>Dear " + user.getFullName() + ",</p>"
                    + "<p style='color: #64748b;'>Your account has been approved. You can now login!</p>"
                    + "<a href='http://localhost:5173/login' style='background: #0ea5e9; color: white; padding: 12px 30px; "
                    + "text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 15px;'>"
                    + "Login Now</a>"
                    + "<p style='color: #94a3b8; font-size: 12px; margin-top: 20px;'>Mumbai's Trusted Hardware Store - Chembur</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Approval email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send approval email: {}", e.getMessage());
        }
    }

    public void sendRejectionEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Account Status - SRP Traders");

            String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: #0ea5e9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>"
                    + "<h1 style='color: white; margin: 0;'>SRP Traders</h1>"
                    + "</div>"
                    + "<div style='background: #f8fafc; padding: 30px; text-align: center; border: 1px solid #e2e8f0;'>"
                    + "<p style='color: #64748b;'>Dear " + user.getFullName() + ",</p>"
                    + "<p style='color: #64748b;'>Unfortunately your registration has been rejected.</p>"
                    + "<p style='color: #64748b;'>Contact us at: info@srptraders.in</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Rejection email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send rejection email: {}", e.getMessage());
        }
    }

    public void sendOrderStatusEmail(User user, String orderId, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Order Update - SRP Traders #" + orderId);

            String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: #0ea5e9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>"
                    + "<h1 style='color: white; margin: 0;'>SRP Traders</h1>"
                    + "</div>"
                    + "<div style='background: #f8fafc; padding: 30px; text-align: center; border: 1px solid #e2e8f0;'>"
                    + "<p style='color: #64748b;'>Dear " + user.getFullName() + ",</p>"
                    + "<p style='color: #64748b;'>Your order <strong>#" + orderId + "</strong> status updated to:</p>"
                    + "<div style='background: #0ea5e9; color: white; padding: 10px 20px; "
                    + "border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;'>"
                    + status
                    + "</div>"
                    + "<p style='color: #94a3b8; font-size: 12px; margin-top: 20px;'>Thank you for shopping with SRP Traders!</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Order status email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send order status email: {}", e.getMessage());
        }
    }
}