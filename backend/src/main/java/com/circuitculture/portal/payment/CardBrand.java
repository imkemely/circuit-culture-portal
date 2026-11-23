package com.circuitculture.portal.payment;

public enum CardBrand {
    VISA("Visa"),
    MASTERCARD("Mastercard"),
    AMEX("American Express"),
    DISCOVER("Discover"),
    UNKNOWN("Card");

    private final String displayName;

    CardBrand(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }

    /** Detects the brand from the card number prefix (digits only). */
    public static CardBrand detect(String digits) {
        if (digits.startsWith("4")) {
            return VISA;
        }
        if (digits.matches("^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]|720)).*")) {
            return MASTERCARD;
        }
        if (digits.matches("^3[47].*")) {
            return AMEX;
        }
        if (digits.matches("^(6011|65|64[4-9]).*")) {
            return DISCOVER;
        }
        return UNKNOWN;
    }
}
