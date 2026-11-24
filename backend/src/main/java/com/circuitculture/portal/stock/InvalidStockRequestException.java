package com.circuitculture.portal.stock;

/** Thrown for a bad request: empty order, quantity below 1, or a variant id that doesn't exist. Maps to HTTP 400. */
public class InvalidStockRequestException extends RuntimeException {

    public InvalidStockRequestException(String message) {
        super(message);
    }
}
