package com.circuitculture.portal.stock;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns stock errors into JSON the checkout page can show.
 *   409 Conflict   -> not enough stock  { message, variantId, available, requested }
 *   400 Bad Request -> invalid order     { message }
 * Handles only our two exceptions, so it won't interfere with anyone else's error handling.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)   // so a catch-all handler elsewhere can't swallow our two exceptions
@RestControllerAdvice
public class StockExceptionHandler {

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, Object>> insufficient(InsufficientStockException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", e.getMessage());
        body.put("variantId", e.getVariantId());
        body.put("available", e.getAvailable());
        body.put("requested", e.getRequested());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(InvalidStockRequestException.class)
    public ResponseEntity<Map<String, Object>> invalid(InvalidStockRequestException e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
