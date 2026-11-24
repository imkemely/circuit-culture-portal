package com.circuitculture.portal.stock;

/** Thrown when a variant has fewer units than the order asks for. Maps to HTTP 409. */
public class InsufficientStockException extends RuntimeException {

    private final Long variantId;
    private final int available;
    private final int requested;

    public InsufficientStockException(Long variantId, int available, int requested) {
        super(available == 0
                ? "Sorry, that item is sold out."
                : "Only " + available + " left. Please lower the quantity.");
        this.variantId = variantId;
        this.available = available;
        this.requested = requested;
    }

    public Long getVariantId() { return variantId; }
    public int getAvailable() { return available; }
    public int getRequested() { return requested; }
}
