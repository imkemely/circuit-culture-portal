package com.circuitculture.portal.order;

/**
 * Lifecycle states of an order. The prototype only creates CONFIRMED orders
 * (an order is saved after payment succeeds); the other states are here so
 * order tracking can use them later.
 */
public enum OrderStatus {
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
