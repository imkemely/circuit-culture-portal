package com.circuitculture.portal.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

/**
 * What the checkout page sends to POST /api/orders.
 * The validation annotations reject incomplete orders with a 400 before any logic runs.
 */
public record PlaceOrderRequest(
        @NotBlank String customerName,
        @NotBlank @Email String email,
        @NotBlank String shippingAddress,
        @NotBlank String cardNumber,
        @NotEmpty List<@Valid Item> items) {

    /** One cart line being ordered. */
    public record Item(
            @NotNull Long productId,
            @NotBlank String productName,
            String size,
            String color,
            @Positive int quantity,
            @NotNull @Positive BigDecimal unitPrice) {
    }
}
