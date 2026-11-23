// Pricing rules from D2 (SCR-01 Shopping Cart, SCR-02 Checkout - Contact & Shipping).

// Florida default rate. D2 uses it "until ZIP is known"; per-ZIP rates are out of
// prototype scope, so it applies to every order for now.
export const TAX_RATE = 0.07

export const MAX_QTY_PER_LINE = 10

export const SHIPPING_METHODS = {
  STANDARD: { id: 'STANDARD', label: 'Standard', window: '5-7 business days', cents: 895 },
  EXPEDITED: { id: 'EXPEDITED', label: 'Expedited', window: '2-3 business days', cents: 1995 },
}

// A line can hold 1..min(10, stock). Stock is undefined until it has been checked.
export function maxQuantityFor(stock) {
  return stock === undefined ? MAX_QTY_PER_LINE : Math.min(MAX_QTY_PER_LINE, stock)
}

// Tax is charged on the merchandise subtotal only, not on shipping
// (D2 example: $206.00 subtotal -> $14.42 tax, $8.95 shipping, $229.37 total).
export function calcTotals(lines, shippingMethodId = 'STANDARD') {
  const subtotal = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0)
  const shipping = subtotal > 0 ? SHIPPING_METHODS[shippingMethodId].cents : 0
  const tax = Math.round(subtotal * TAX_RATE)
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}
