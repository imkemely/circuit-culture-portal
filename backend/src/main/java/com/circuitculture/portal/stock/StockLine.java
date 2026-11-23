package com.circuitculture.portal.stock;

/** One line of an order: which variant (size + color) and how many units. */
public record StockLine(Long variantId, int quantity) {
}
