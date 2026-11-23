package com.circuitculture.portal.stock;

import com.circuitculture.portal.catalog.ProductVariant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Stock check for placing an order (D2: "reduce stock automatically on order placement").
 *
 * HOW TO CALL (Kemely): inside the @Transactional method that places the order,
 * call reserveStock(...) BEFORE the mock payment and before saving the order.
 * If anything after it fails (payment declined, etc.) throw a RuntimeException:
 * the whole transaction rolls back and the stock goes back automatically.
 */
@Service
public class StockService {

    private final VariantLockRepository variants;

    public StockService(VariantLockRepository variants) {
        this.variants = variants;
    }

    /**
     * Checks every line and reduces the stock. All-or-nothing:
     * if any line is short, an exception is thrown and no stock is changed.
     *
     * MANDATORY = this must run inside the order's transaction. If it is called without one,
     * Spring throws IllegalTransactionStateException (so stock can never be reduced "on its own").
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void reserveStock(List<StockLine> lines) {
        if (lines == null || lines.isEmpty()) {
            throw new InvalidStockRequestException("The order has no items.");
        }

        // Combine duplicate lines (same variant twice) so the check uses the real total.
        // TreeMap sorts by variant id: every order locks rows in the same order,
        // so two simultaneous orders can't deadlock each other.
        Map<Long, Integer> totals = new TreeMap<>();
        for (StockLine line : lines) {
            if (line == null || line.variantId() == null) {
                throw new InvalidStockRequestException("Every order line needs a variant.");
            }
            if (line.quantity() < 1) {
                throw new InvalidStockRequestException("Quantity must be at least 1.");
            }
            totals.merge(line.variantId(), line.quantity(), Integer::sum);
        }

        for (Map.Entry<Long, Integer> entry : totals.entrySet()) {
            Long variantId = entry.getKey();
            int requested = entry.getValue();

            ProductVariant variant = variants.findByIdForUpdate(variantId)   // row is now locked
                    .orElseThrow(() -> new InvalidStockRequestException("Unknown item: " + variantId));

            int available = variant.getStock();
            if (available < requested) {
                throw new InsufficientStockException(variantId, available, requested);
            }
            variant.setStock(available - requested);
            variants.save(variant);
        }
        variants.flush();   // write the changes now, inside the transaction
    }

    /** Convenience overload: variantId -> quantity. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void reserveStock(Map<Long, Integer> quantityByVariantId) {
        reserveStock(quantityByVariantId.entrySet().stream()
                .map(e -> new StockLine(e.getKey(), e.getValue()))
                .toList());
    }
}
