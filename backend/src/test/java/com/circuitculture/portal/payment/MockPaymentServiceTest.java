package com.circuitculture.portal.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import com.circuitculture.portal.payment.PaymentResult.DeclineReason;

class MockPaymentServiceTest {

    // Fixed "today" of 11/22/2026, so expiry checks don't depend on when tests run.
    private final MockPaymentService service =
            new MockPaymentService(Clock.fixed(Instant.parse("2026-11-22T12:00:00Z"), ZoneOffset.UTC));

    private static final BigDecimal AMOUNT = new BigDecimal("229.37");

    private static PaymentDetails card(String number, String expiry, String cvc) {
        return new PaymentDetails(number, expiry, cvc, "Test Shopper");
    }

    @Test
    void approvesTestCardWithSpaces() {
        PaymentResult result = service.charge(card("4242 4242 4242 4242", "08/29", "123"), AMOUNT);

        assertTrue(result.approved());
        assertEquals(CardBrand.VISA, result.brand());
        assertEquals("4242", result.last4());
        assertNull(result.declineReason());
    }

    @Test
    void declinesAnyOtherWellFormedCard() {
        PaymentResult result = service.charge(card("5555 5555 5555 4444", "08/29", "123"), AMOUNT);

        assertFalse(result.approved());
        assertEquals(DeclineReason.CARD_DECLINED, result.declineReason());
        assertEquals(CardBrand.MASTERCARD, result.brand());
        assertEquals("4444", result.last4());
    }

    @Test
    void cardIsValidThroughItsExpiryMonth() {
        assertTrue(service.charge(card("4242424242424242", "11/26", "123"), AMOUNT).approved());

        PaymentResult expired = service.charge(card("4242424242424242", "10/26", "123"), AMOUNT);
        assertEquals(DeclineReason.EXPIRED_CARD, expired.declineReason());
    }

    @Test
    void amexNeedsFourDigitCvc() {
        PaymentResult threeDigits = service.charge(card("378282246310005", "08/29", "123"), AMOUNT);
        assertEquals(DeclineReason.INVALID_CVC, threeDigits.declineReason());

        PaymentResult fourDigits = service.charge(card("378282246310005", "08/29", "1234"), AMOUNT);
        assertEquals(CardBrand.AMEX, fourDigits.brand());
        assertEquals(DeclineReason.CARD_DECLINED, fourDigits.declineReason());
    }

    @Test
    void declinesWrongLengthCardNumber() {
        PaymentResult result = service.charge(card("4242 4242", "08/29", "123"), AMOUNT);
        assertEquals(DeclineReason.INVALID_CARD_NUMBER, result.declineReason());
    }

    @Test
    void rejectsNonPositiveAmount() {
        PaymentDetails details = card("4242424242424242", "08/29", "123");
        assertThrows(IllegalArgumentException.class, () -> service.charge(details, BigDecimal.ZERO));
    }

    @Test
    void toStringNeverShowsFullCardNumber() {
        String text = card("4242 4242 4242 4242", "08/29", "123").toString();

        assertFalse(text.contains("4242 4242 4242 4242"));
        assertFalse(text.contains("4242424242424242"));
        assertFalse(text.contains("123"));
        assertTrue(text.contains("****4242"));
    }
}
