package com.circuitculture.portal.payment;

/**
 * Outcome of a mock charge. Holds only what is safe to store and show on the order
 * (brand and last four digits), never the full card number.
 *
 * @param declineReason null when approved
 */
public record PaymentResult(boolean approved, CardBrand brand, String last4, DeclineReason declineReason) {

    public enum DeclineReason {
        /** A well-formed card that the mock gateway refuses (anything but the test card). */
        CARD_DECLINED,
        INVALID_CARD_NUMBER,
        EXPIRED_CARD,
        INVALID_CVC
    }

    static PaymentResult approved(CardBrand brand, String last4) {
        return new PaymentResult(true, brand, last4, null);
    }

    static PaymentResult declined(CardBrand brand, String last4, DeclineReason reason) {
        return new PaymentResult(false, brand, last4, reason);
    }
}
