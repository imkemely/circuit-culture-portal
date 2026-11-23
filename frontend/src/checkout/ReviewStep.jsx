import { startTransition, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/useCart'
import ProductThumb from '../cart/ProductThumb'
import { useCheckout, useCheckoutProgress } from './useCheckout'
import { detectCardBrand } from './validation'
import { buildOrderRequest } from './orderRequest'
import { OutOfStockError, PaymentDeclinedError, PaymentUnavailableError, placeOrder } from '../api/orders'
import { formatCents } from '../lib/money'
import { SHIPPING_METHODS, calcTotals } from '../lib/pricing'

const ERRORS = {
  // D2 MSG 6
  declined: { text: 'Your card was declined. Try another card or payment method.', link: '/checkout/payment', linkText: 'Change payment' },
  // D2 MSG 7
  unavailable: { text: "We can't reach the payment processor right now. Please try again later." },
  stock: {
    text: 'Some items in your cart just sold out or are running low, so your cart was updated. Please check it before placing your order.',
    link: '/cart',
    linkText: 'Review cart',
  },
  unknown: { text: "We couldn't place your order. Check your connection and try again." },
}

// SCR-04 Checkout - Review & Place Order. Discount codes are out of prototype scope.
export default function ReviewStep() {
  const navigate = useNavigate()
  const { inStockLines, applyAvailability, clearCart } = useCart()
  const { details, payment, resetCheckout } = useCheckout()
  const { shippingReady, paymentReady } = useCheckoutProgress()
  const [status, setStatus] = useState({ state: 'idle' })
  const placingRef = useRef(false)

  if (!shippingReady) return <Navigate to="/checkout/shipping" replace />
  if (!paymentReady) return <Navigate to="/checkout/payment" replace />

  const totals = calcTotals(inStockLines, details.shippingMethod)
  const method = SHIPPING_METHODS[details.shippingMethod]
  const ship = details.shipping
  const placing = status.state === 'placing'
  const error = status.state === 'error' ? ERRORS[status.kind] : null

  async function handlePlaceOrder() {
    // Guards against double clicks before the disabled state renders (no double charge).
    if (placingRef.current) return
    placingRef.current = true
    setStatus({ state: 'placing' })
    try {
      const order = await placeOrder(buildOrderRequest({ details, payment, lines: inStockLines }))
      // One transition so the navigation and the emptied cart render together.
      startTransition(() => {
        navigate(`/order-confirmation/${encodeURIComponent(order.orderNumber)}`, { replace: true, state: { order } })
        clearCart()
        resetCheckout()
      })
    } catch (err) {
      placingRef.current = false
      if (err instanceof PaymentDeclinedError) {
        setStatus({ state: 'error', kind: 'declined' })
      } else if (err instanceof PaymentUnavailableError) {
        setStatus({ state: 'error', kind: 'unavailable' })
      } else if (err instanceof OutOfStockError) {
        applyAvailability({ checkedProductIds: [], info: { [err.variantId]: { stock: err.available } } })
        setStatus({ state: 'error', kind: 'stock' })
      } else {
        setStatus({ state: 'error', kind: 'unknown' })
      }
    }
  }

  return (
    <div className="cc-form">
      <section className="cc-review-block" aria-labelledby="review-items">
        <header>
          <h2 id="review-items">Items ({inStockLines.reduce((s, l) => s + l.quantity, 0)})</h2>
          <Link to="/cart">Change</Link>
        </header>
        <ul className="cc-review-items">
          {inStockLines.map((line) => (
            <li key={line.variantId}>
              <ProductThumb line={line} size={48} />
              <span>{line.name} - {line.color} / {line.size} x{line.quantity}</span>
              <span>{formatCents(line.priceCents * line.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cc-review-block" aria-labelledby="review-ship">
        <header>
          <h2 id="review-ship">Ship to</h2>
          <Link to="/checkout/shipping">Change</Link>
        </header>
        <address>
          {ship.firstName} {ship.lastName}<br />
          {ship.line1}{ship.line2 && `, ${ship.line2}`}<br />
          {ship.city}, {ship.state} {ship.zip}
        </address>
        <p className="cc-muted">{method.label} ({method.window}) · {details.email}</p>
      </section>

      <section className="cc-review-block" aria-labelledby="review-pay">
        <header>
          <h2 id="review-pay">Payment</h2>
          <Link to="/checkout/payment">Change</Link>
        </header>
        <p>
          {detectCardBrand(payment.cardNumber)} ****{payment.cardNumber.slice(-4)} exp {payment.expiry}
        </p>
      </section>

      {error && (
        <p className="cc-notice cc-notice-error" role="alert">
          <span>{error.text}</span>
          {error.link && <Link to={error.link}>{error.linkText}</Link>}
        </p>
      )}
      {placing && (
        // D2 MSG 8
        <p className="cc-notice cc-notice-info" role="status">
          Placing your order. Do not refresh or close this tab.
        </p>
      )}

      <div className="cc-actions">
        <p className="cc-muted cc-small">By placing this order you agree to the Terms and Privacy Policy.</p>
        <button type="button" className="cc-button-primary" disabled={placing} onClick={handlePlaceOrder}>
          {placing ? 'Placing order…' : `Place order · ${formatCents(totals.total)}`}
        </button>
      </div>
    </div>
  )
}
