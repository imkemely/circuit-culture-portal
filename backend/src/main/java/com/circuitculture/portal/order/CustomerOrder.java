package com.circuitculture.portal.order;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * A placed order.
 *
 * Named CustomerOrder instead of Order because ORDER is a reserved word in SQL,
 * and a table called "order" breaks the database.
 */
@Entity
@Table(name = "customer_orders")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    private String customerName;
    private String email;
    private String shippingAddress;
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;

    // The order owns its items: saving the order saves its items too.
    // EAGER so the items are always loaded when the order is returned as JSON.
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    protected CustomerOrder() {
        // required by JPA
    }

    public CustomerOrder(String orderNumber, String customerName, String email, String shippingAddress) {
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.email = email;
        this.shippingAddress = shippingAddress;
        this.total = BigDecimal.ZERO;
        this.status = OrderStatus.CONFIRMED;
        this.createdAt = LocalDateTime.now();
    }

    /** Adds a line to the order and keeps the total in sync. */
    public void addItem(OrderItem item) {
        items.add(item);
        total = total.add(item.getLineTotal());
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getEmail() {
        return email;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /** Read-only view, so items can only be added through addItem(). */
    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }
}
