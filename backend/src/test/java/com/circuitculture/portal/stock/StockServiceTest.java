package com.circuitculture.portal.stock;

import com.circuitculture.portal.catalog.ProductVariant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Tests for the stock check. Uses the seeded variants (Arnold's seed data), sets known stock
 * values, and puts the original values back after each test.
 * Each call runs in its own transaction (like Kemely's place-order method), so a thrown
 * exception really rolls back, which is the behavior we want to prove.
 */
@SpringBootTest
class StockServiceTest {

    @Autowired StockService stockService;
    @Autowired VariantLockRepository variants;
    @Autowired PlatformTransactionManager txManager;

    private TransactionTemplate tx;
    private final Map<Long, Integer> originalStock = new HashMap<>();
    private Long firstId;    // lowest variant id
    private Long secondId;   // next lowest

    @BeforeEach
    void setUp() {
        tx = new TransactionTemplate(txManager);
        List<ProductVariant> all = variants.findAll();
        assumeTrue(all.size() >= 2, "Needs at least 2 seeded variants");
        all.forEach(v -> originalStock.put(v.getId(), v.getStock()));
        List<ProductVariant> sorted = all.stream().sorted(Comparator.comparing(ProductVariant::getId)).toList();
        firstId = sorted.get(0).getId();
        secondId = sorted.get(1).getId();
    }

    @AfterEach
    void restoreStock() {
        variants.findAll().forEach(v -> {
            Integer original = originalStock.get(v.getId());
            if (original != null) {
                v.setStock(original);
                variants.save(v);
            }
        });
    }

    private void setStock(Long id, int stock) {
        ProductVariant v = variants.findById(id).orElseThrow();
        v.setStock(stock);
        variants.save(v);
    }

    private int stockOf(Long id) {
        return variants.findById(id).orElseThrow().getStock();
    }

    private void placeOrder(StockLine... lines) {
        tx.executeWithoutResult(status -> stockService.reserveStock(List.of(lines)));
    }

    // TC-S1
    @Test
    void reducesStock_whenThereIsEnough() {
        setStock(firstId, 10);
        placeOrder(new StockLine(firstId, 3));
        assertThat(stockOf(firstId)).isEqualTo(7);
    }

    // TC-S2
    @Test
    void rejectsOrder_whenNotEnoughStock_andLeavesStockUnchanged() {
        setStock(firstId, 2);
        assertThatThrownBy(() -> placeOrder(new StockLine(firstId, 3)))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Only 2 left");
        assertThat(stockOf(firstId)).isEqualTo(2);
    }

    @Test
    void allowsBuyingTheLastUnits_stockGoesToZero() {
        setStock(firstId, 4);
        placeOrder(new StockLine(firstId, 4));
        assertThat(stockOf(firstId)).isZero();
    }

    @Test
    void soldOutVariant_isRejectedWithSoldOutMessage() {
        setStock(firstId, 0);
        assertThatThrownBy(() -> placeOrder(new StockLine(firstId, 1)))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("sold out");
    }

    // extra: all-or-nothing across lines
    @Test
    void rollsBackEarlierLines_whenALaterLineIsShort() {
        setStock(firstId, 10);
        setStock(secondId, 1);
        assertThatThrownBy(() -> placeOrder(new StockLine(firstId, 2), new StockLine(secondId, 5)))
                .isInstanceOf(InsufficientStockException.class);
        assertThat(stockOf(firstId)).isEqualTo(10);   // first line was NOT kept
        assertThat(stockOf(secondId)).isEqualTo(1);
    }

    @Test
    void combinesDuplicateLines_beforeChecking() {
        setStock(firstId, 5);
        assertThatThrownBy(() -> placeOrder(new StockLine(firstId, 3), new StockLine(firstId, 3)))
                .isInstanceOf(InsufficientStockException.class);
        assertThat(stockOf(firstId)).isEqualTo(5);
    }

    // TC-S5: simulates a declined card after the stock was reserved
    @Test
    void stockIsGivenBack_whenSomethingFailsAfterReserving() {
        setStock(firstId, 10);
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> {
            stockService.reserveStock(List.of(new StockLine(firstId, 4)));
            throw new IllegalStateException("payment declined");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(stockOf(firstId)).isEqualTo(10);
    }

    @Test
    void rejectsBadRequests() {
        assertThatThrownBy(() -> placeOrder(new StockLine(firstId, 0)))
                .isInstanceOf(InvalidStockRequestException.class);
        assertThatThrownBy(() -> placeOrder(new StockLine(-999L, 1)))
                .isInstanceOf(InvalidStockRequestException.class);
        assertThatThrownBy(() -> tx.executeWithoutResult(s -> stockService.reserveStock(List.<StockLine>of())))
                .isInstanceOf(InvalidStockRequestException.class);
    }

    @Test
    void mustBeCalledInsideATransaction() {
        assertThatThrownBy(() -> stockService.reserveStock(List.of(new StockLine(firstId, 1))))
                .isInstanceOf(IllegalTransactionStateException.class);
    }
}
