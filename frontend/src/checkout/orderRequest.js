// Body for POST /api/orders (proposed contract, to agree with the orders API owner).
// Prices and totals are deliberately not sent: the server recalculates them and
// rechecks stock inside the order transaction (D2 SCR-04 assumption).
export function buildOrderRequest({ details, payment, lines }) {
  const trimAddress = (a) => ({
    firstName: a.firstName.trim(),
    lastName: a.lastName.trim(),
    line1: a.line1.trim(),
    line2: a.line2.trim() || null,
    city: a.city.trim(),
    state: a.state,
    zip: a.zip.trim(),
    country: a.country,
  })

  return {
    email: details.email.trim(),
    newsletterOptIn: details.newsletterOptIn,
    shippingAddress: { ...trimAddress(details.shipping), phone: details.shipping.phone.trim() },
    shippingMethod: details.shippingMethod,
    billingAddress: payment.sameAsShipping ? null : trimAddress(payment.billing),
    payment: {
      cardNumber: payment.cardNumber,
      expiry: payment.expiry,
      cvc: payment.cvc,
      nameOnCard: payment.nameOnCard.trim(),
    },
    // variantId + quantity is what matters. The extra fields are needed by the orders
    // API (see toBackendOrder in api/orders.js).
    items: lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
      productId: l.productId,
      productName: l.name,
      size: l.size,
      color: l.color,
      unitPrice: l.priceCents / 100,
    })),
  }
}
