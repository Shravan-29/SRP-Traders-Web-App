//package com.srptraders.backend.service;
//
//import com.srptraders.backend.dto.ApiResponse;
//import com.srptraders.backend.dto.OrderDTO;
//import com.srptraders.backend.dto.OrderRequest;
//import com.srptraders.backend.entity.*;
//import com.srptraders.backend.exception.ResourceNotFoundException;
//import com.srptraders.backend.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class OrderService {
//
//    private final OrderRepository orderRepository;
//    private final OrderItemRepository orderItemRepository;
//    private final ProductRepository productRepository;
//    private final UserRepository userRepository;
//    private final EmailService emailService;
//
//    @Transactional
//    public OrderDTO createOrder(OrderRequest request, String email) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException("User not found!"));
//
//        List<OrderItem> orderItems = new ArrayList<>();
//        double totalAmount = 0;
//
//        Order order = Order.builder()
//                .user(user)
//                .paymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()))
//                .paymentId(request.getPaymentId())
//                .deliveryAddress(request.getDeliveryAddress())
//                .deliveryCity(request.getDeliveryCity())
//                .deliveryPincode(request.getDeliveryPincode())
//                .deliveryPhone(request.getDeliveryPhone())
//                .status(Order.OrderStatus.PENDING)
//                .build();
//
//        Order savedOrder = orderRepository.save(order);
//
//        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
//            Product product = productRepository.findById(itemReq.getProductId())
//                    .orElseThrow(() ->
//                            new ResourceNotFoundException("Product not found!"));
//
//            double itemTotal = product.getPrice() * itemReq.getQuantity();
//            totalAmount += itemTotal;
//
//            OrderItem item = OrderItem.builder()
//                    .order(savedOrder)
//                    .product(product)
//                    .quantity(itemReq.getQuantity())
//                    .price(product.getPrice())
//                    .totalPrice(itemTotal)
//                    .build();
//
//            orderItems.add(orderItemRepository.save(item));
//        }
//
//        double deliveryCharge = totalAmount >= 2000 ? 0 : 99;
//        double grandTotal = totalAmount + deliveryCharge;
//
//        savedOrder.setOrderItems(orderItems);
//        savedOrder.setTotalAmount(totalAmount);
//        savedOrder.setDeliveryCharge(deliveryCharge);
//        savedOrder.setGrandTotal(grandTotal);
//
//        if (request.getPaymentMethod().equals("ONLINE") &&
//                request.getPaymentId() != null) {
//            savedOrder.setPaymentStatus(Order.PaymentStatus.PAID);
//        }
//
//        orderRepository.save(savedOrder);
//        emailService.sendOrderStatusEmail(user,
//                savedOrder.getId().toString(), "CONFIRMED");
//
//        return toDTO(savedOrder);
//    }
//
//    public List<OrderDTO> getUserOrders(String email) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException("User not found!"));
//        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
//                .stream().map(this::toDTO).collect(Collectors.toList());
//    }
//
//    public List<OrderDTO> getAllOrders() {
//        return orderRepository.findAll()
//                .stream().map(this::toDTO).collect(Collectors.toList());
//    }
//
//    public ApiResponse updateOrderStatus(Long orderId, String status) {
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException("Order not found!"));
//        order.setStatus(Order.OrderStatus.valueOf(status));
//        orderRepository.save(order);
//        emailService.sendOrderStatusEmail(
//                order.getUser(), orderId.toString(), status);
//        return ApiResponse.success("Order status updated!", null);
//    }
//
//    private OrderDTO toDTO(Order order) {
//        List<OrderDTO.OrderItemDTO> itemDTOs = order.getOrderItems() != null ?
//                order.getOrderItems().stream().map(item ->
//                        OrderDTO.OrderItemDTO.builder()
//                                .productId(item.getProduct().getId())
//                                .productName(item.getProduct().getName())
//                                .productImage(item.getProduct().getImage())
//                                .quantity(item.getQuantity())
//                                .price(item.getPrice())
//                                .totalPrice(item.getTotalPrice())
//                                .build()
//                ).collect(Collectors.toList()) : new ArrayList<>();
//
//        return OrderDTO.builder()
//                .id(order.getId())
//                .userName(order.getUser().getFullName())
//                .userEmail(order.getUser().getEmail())
//                .orderItems(itemDTOs)
//                .totalAmount(order.getTotalAmount())
//                .deliveryCharge(order.getDeliveryCharge())
//                .grandTotal(order.getGrandTotal())
//                .status(order.getStatus().name())
//                .paymentMethod(order.getPaymentMethod().name())
//                .paymentStatus(order.getPaymentStatus().name())
//                .deliveryAddress(order.getDeliveryAddress())
//                .deliveryCity(order.getDeliveryCity())
//                .deliveryPincode(order.getDeliveryPincode())
//                .deliveryPhone(order.getDeliveryPhone())
//                .createdAt(order.getCreatedAt())
//                .build();
//    }
//}

//new code

package com.srptraders.backend.service;

import com.srptraders.backend.dto.ApiResponse;
import com.srptraders.backend.dto.OrderDTO;
import com.srptraders.backend.dto.OrderRequest;
import com.srptraders.backend.entity.*;
import com.srptraders.backend.exception.ResourceNotFoundException;
import com.srptraders.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public OrderDTO createOrder(OrderRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));

        // Pehle total amount calculate karo (order save karne se PEHLE)
        double totalAmount = 0;
        List<Product> productsForOrder = new ArrayList<>();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            totalAmount += product.getPrice() * itemReq.getQuantity();
        }

        double deliveryCharge = totalAmount >= 2000 ? 0 : 99;
        double grandTotal = totalAmount + deliveryCharge;

        Order.PaymentStatus paymentStatus = Order.PaymentStatus.PENDING;
        if (request.getPaymentMethod().equals("ONLINE") && request.getPaymentId() != null) {
            paymentStatus = Order.PaymentStatus.PAID;
        }

        // Ab order banao SAARI required values ke saath - ek hi baar save hoga
        Order order = Order.builder()
                .user(user)
                .paymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()))
                .paymentId(request.getPaymentId())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryCity(request.getDeliveryCity())
                .deliveryPincode(request.getDeliveryPincode())
                .deliveryPhone(request.getDeliveryPhone())
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .deliveryCharge(deliveryCharge)
                .grandTotal(grandTotal)
                .paymentStatus(paymentStatus)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Ab order items banao aur save karo
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Product not found!"));

            double itemTotal = product.getPrice() * itemReq.getQuantity();

            OrderItem item = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItemRepository.save(item));
        }

        savedOrder.setOrderItems(orderItems);

        emailService.sendOrderStatusEmail(user,
                savedOrder.getId().toString(), "CONFIRMED");

        return toDTO(savedOrder);
    }

    public List<OrderDTO> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ApiResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found!"));
        order.setStatus(Order.OrderStatus.valueOf(status));
        orderRepository.save(order);
        emailService.sendOrderStatusEmail(
                order.getUser(), orderId.toString(), status);
        return ApiResponse.success("Order status updated!", null);
    }

    private OrderDTO toDTO(Order order) {
        List<OrderDTO.OrderItemDTO> itemDTOs = order.getOrderItems() != null ?
                order.getOrderItems().stream().map(item ->
                        OrderDTO.OrderItemDTO.builder()
                                .productId(item.getProduct().getId())
                                .productName(item.getProduct().getName())
                                .productImage(item.getProduct().getImage())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .totalPrice(item.getTotalPrice())
                                .build()
                ).collect(Collectors.toList()) : new ArrayList<>();

        return OrderDTO.builder()
                .id(order.getId())
                .userName(order.getUser().getFullName())
                .userEmail(order.getUser().getEmail())
                .orderItems(itemDTOs)
                .totalAmount(order.getTotalAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .grandTotal(order.getGrandTotal())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryCity(order.getDeliveryCity())
                .deliveryPincode(order.getDeliveryPincode())
                .deliveryPhone(order.getDeliveryPhone())
                .createdAt(order.getCreatedAt())
                .build();

    }
    public List<OrderDTO> getShippedOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.SHIPPED)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public OrderDTO getOrderForDelivery(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found!"));
        return toDTO(order);
    }
}