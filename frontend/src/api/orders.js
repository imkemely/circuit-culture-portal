import { USE_FAKE_API, delay } from './config'
import { findFakeVariant } from './fakeData'

// Mock gateway rule from the README: this card is approved, any other is declined.
export const APPROVED_TEST_CARD = '4242424242424242'

export class PaymentDeclinedError extends Error {}
export class PaymentUnavailableError extends Error {}
export class OutOfStockError extends Error {
  constructor(variantId, available) {
    super(`Variant ${variantId} has only ${available} left`)
    this.variantId = variantId
    this.available = available
  }
}

// POST /api/orders. Proposed contract (see buildOrderRequest for the body):
//   201 { orderNumber, ... }
//   402 { error: "PAYMENT_DECLINED", message }
//   409 { error: "OUT_OF_STOCK", variantId, available }
//   503 payment processor unreachable
// The server recalculates prices and totals; the client never sends them.
export async function placeOrder(request) {
  if (USE_FAKE_API) return fakePlaceOrder(request)

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toBackendOrder(request)),
  })
  if (res.ok) return res.json()

  const body = await res.json().catch(() => ({}))
  // The orders API answers a declined card with 400 { error: "Payment declined..." }.
  if (res.status === 402 || (res.status === 400 && /declined/i.test(body.error ?? ''))) {
    throw new PaymentDeclinedError(body.message ?? body.error)
  }
  if (res.status === 409) throw new OutOfStockError(body.variantId, body.available)
  if (res.status === 503) throw new PaymentUnavailableError(body.message)
  throw new Error(body.message || `POST /api/orders failed (${res.status})`)
}

// Translates the checkout request into the body the Spring orders API expects
// (PlaceOrderRequest): one name, one address string, a flat card number and
// product-level items.
function toBackendOrder(request) {
  const a = request.shippingAddress
  const address = [a.line1, a.line2, `${a.city}, ${a.state} ${a.zip}`, a.country].filter(Boolean).join(', ')
  return {
    customerName: `${a.firstName} ${a.lastName}`.trim(),
    email: request.email,
    shippingAddress: address,
    cardNumber: request.payment.cardNumber,
    items: request.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  }
}

let fakeOrderSeq = 0

async function fakePlaceOrder(request) {
  await delay(800)
  for (const item of request.items) {
    const available = findFakeVariant(item.variantId)?.variant.stock ?? 0
    if (item.quantity > available) throw new OutOfStockError(item.variantId, available)
  }
  if (request.payment.cardNumber !== APPROVED_TEST_CARD) throw new PaymentDeclinedError()

  for (const item of request.items) {
    findFakeVariant(item.variantId).variant.stock -= item.quantity
  }
  fakeOrderSeq += 1
  const year = new Date().getFullYear()
  return { orderNumber: `CC-${year}-${String(fakeOrderSeq).padStart(6, '0')}` }
}
