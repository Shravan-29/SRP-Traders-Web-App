package com.srptraders.backend.repository;

import com.srptraders.backend.entity.DeliveryOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DeliveryOtpRepository extends JpaRepository<DeliveryOtp, Long> {
    Optional<DeliveryOtp> findByOrderIdAndVerifiedFalse(Long orderId);
    void deleteByOrderId(Long orderId);
}