package com.circuitculture.portal.order;

/**
 * Thrown when the (mock) payment is declined. The controller turns it into a 400 response.
 */
public class PaymentDeclinedException extends RuntimeException {

    public PaymentDeclinedException(String message) {
        super(message);
    }
}
