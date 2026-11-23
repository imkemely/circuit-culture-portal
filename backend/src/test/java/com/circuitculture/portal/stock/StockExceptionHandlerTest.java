package com.circuitculture.portal.stock;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** Plain unit test (no Spring): checks the HTTP status and JSON the checkout page will receive. */
class StockExceptionHandlerTest {

    private final StockExceptionHandler handler = new StockExceptionHandler();

    @Test
    void notEnoughStock_returns409WithMessageAndNumbers() {
        ResponseEntity<Map<String, Object>> response =
                handler.insufficient(new InsufficientStockException(7L, 2, 5));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("message", "Only 2 left. Please lower the quantity.")
                .containsEntry("variantId", 7L)
                .containsEntry("available", 2)
                .containsEntry("requested", 5);
    }

    @Test
    void badRequest_returns400() {
        ResponseEntity<Map<String, Object>> response =
                handler.invalid(new InvalidStockRequestException("Quantity must be at least 1."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Quantity must be at least 1.");
    }
}
