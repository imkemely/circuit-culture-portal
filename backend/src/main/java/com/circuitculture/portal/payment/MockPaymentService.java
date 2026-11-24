package com.circuitculture.portal.payment;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.YearMonth;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.circuitculture.portal.payment.PaymentResult.DeclineReason;

/**
 * Stand-in for the Stripe gateway in the prototype. The test card
 * 4242 4242 4242 4242 is approved; any other well-formed card is declined.
 *
 * <p>Call {@link #charge} from the order placement transaction after stock has been
 * checked. If the result is not approved, roll back and answer {@code 402}.
 */
@Service
public class MockPaymentService {

    public static final String APPROVED_TEST_CARD = "4242424242424242";

    private final Clock clock;

    public MockPaymentService() {
        this(Clock.systemDefaultZone());
    }

    MockPaymentService(Clock clock) {
        this.clock = clock;
    }

    public PaymentResult charge(PaymentDetails details, BigDecimal amount) {
        Objects.requireNonNull(details, "details");
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }

        String digits = details.digits();
        CardBrand brand = CardBrand.detect(digits);
        String last4 = details.last4();

        if (digits.length() < 13 || digits.length() > 19) {
            return PaymentResult.declined(brand, last4, DeclineReason.INVALID_CARD_NUMBER);
        }
        if (isExpired(details.expiry())) {
            return PaymentResult.declined(brand, last4, DeclineReason.EXPIRED_CARD);
        }
        int cvcLength = brand == CardBrand.AMEX ? 4 : 3;
        if (details.cvc() == null || !details.cvc().matches("[0-9]{" + cvcLength + "}")) {
            return PaymentResult.declined(brand, last4, DeclineReason.INVALID_CVC);
        }
        if (!APPROVED_TEST_CARD.equals(digits)) {
            return PaymentResult.declined(brand, last4, DeclineReason.CARD_DECLINED);
        }
        return PaymentResult.approved(brand, last4);
    }

    /** A card is valid through the last day of its expiry month. */
    private boolean isExpired(String expiry) {
        if (expiry == null || !expiry.matches("(0[1-9]|1[0-2])/[0-9]{2}")) {
            return true;
        }
        int month = Integer.parseInt(expiry.substring(0, 2));
        int year = 2000 + Integer.parseInt(expiry.substring(3));
        return YearMonth.of(year, month).isBefore(YearMonth.now(clock));
    }
}
