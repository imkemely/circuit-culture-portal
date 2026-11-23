package com.circuitculture.portal.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Database access for orders. Spring Data writes the queries from the method names.
 */
public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);
}
