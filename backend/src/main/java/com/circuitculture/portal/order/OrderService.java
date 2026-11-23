package com.circuitculture.portal.order;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;

/**
 * Business logic for placing and looking up orders.
 */
@Service
public class OrderService {

    /** The prototype uses a mock payment: only this test card is approved. */
    static final String APPROVED_TEST_CARD = "4242424242424242";

    private final OrderRepository orderRepository;
    private final Random random = new Random();

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Places an order: checks stock, takes the mock payment, then saves the order.
     * If anything fails, an exception is thrown and nothing is saved.
     */
    @Transactional
    public CustomerOrder placeOrder(PlaceOrderRequest request) {
        // 1. Stock check (Shreya, inventory): check each item is in stock and reduce
        //    the stock here. Throw an exception if an item is out of stock.

        // 2. Mock payment. Spaces and dashes are allowed, e.g. "4242 4242 4242 4242".
        String card = request.cardNumber().replaceAll("[\\s-]", "");
        if (!APPROVED_TEST_CARD.equals(card)) {
            throw new PaymentDeclinedException("Payment declined. Use the test card 4242 4242 4242 4242.");
        }

        // 3. Build and save the order. Card details are never stored.
        //    TODO once the catalog is merged: look up each price from the product
        //    table instead of trusting the price sent by the browser.
        CustomerOrder order = new CustomerOrder(
                generateOrderNumber(),
                request.customerName(),
                request.email(),
                request.shippingAddress());

        for (PlaceOrderRequest.Item item : request.items()) {
            order.addItem(new OrderItem(
                    item.productId(),
                    item.productName(),
                    item.size(),
                    item.color(),
                    item.quantity(),
                    item.unitPrice()));
        }

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Optional<CustomerOrder> findByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    /** Creates a unique, customer-friendly order number like CC-482913. */
    private String generateOrderNumber() {
        String orderNumber;
        do {
            orderNumber = "CC-" + (100000 + random.nextInt(900000));
        } while (orderRepository.existsByOrderNumber(orderNumber));
        return orderNumber;
    }
}
