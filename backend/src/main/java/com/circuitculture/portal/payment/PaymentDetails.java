package com.circuitculture.portal.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Card details sent as the {@code payment} object of {@code POST /api/orders}.
 *
 * <p>Only the mock gateway uses raw card data. In the full design (D2) the card is
 * tokenized by Stripe-hosted fields and never reaches our server. Even here, never
 * log or persist this object: {@link #toString()} is masked for that reason.
 */
public record PaymentDetails(
        @NotBlank
        @Pattern(regexp = "^[0-9 -]{13,23}$", message = "must be 13-19 digits")
        String cardNumber,

        @NotBlank
        @Pattern(regexp = "^(0[1-9]|1[0-2])/[0-9]{2}$", message = "must be MM/YY")
        String expiry,

        @NotBlank
        @Pattern(regexp = "^[0-9]{3,4}$", message = "must be 3 or 4 digits")
        String cvc,

        @NotBlank
        @Pattern(regexp = "^[\\p{L} ]{2,60}$", message = "must be 2-60 letters and spaces")
        String nameOnCard) {

    /** Card number with spaces and dashes removed. */
    public String digits() {
        return cardNumber == null ? "" : cardNumber.replaceAll("[^0-9]", "");
    }

    /** Last four digits, safe to store and display. */
    public String last4() {
        String digits = digits();
        return digits.length() <= 4 ? digits : digits.substring(digits.length() - 4);
    }

    @Override
    public String toString() {
        return "PaymentDetails[card=****" + last4() + ", expiry=" + expiry + "]";
    }
}
