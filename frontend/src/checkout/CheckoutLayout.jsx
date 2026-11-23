import { Link, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../cart/useCart'
import { useCheckout, useCheckoutProgress } from './useCheckout'
import { formatCents } from '../lib/money'
import { SHIPPING_METHODS, calcTotals } from '../lib/pricing'
import '../cart-checkout.css'

const STEPS = [
  { path: 'shipping', label: 'Shipping' },
  { path: 'payment', label: 'Payment' },
  { path: 'review', label: 'Review' },
]

// Wraps the three checkout steps: progress bar on top, order summary on the side.
export default function CheckoutLayout() {
  const { inStockLines } = useCart()

  // Not a redirect: right after an order is placed the cart is emptied in the same
  // update that navigates to the confirmation page, and a redirect here could race it.
  if (inStockLines.length === 0) {
    return (
      <main className="cc-page">
        <div className="cc-empty" role="status">
          <p>Your cart has no items to check out.</p>
          <Link to="/cart" className="cc-button-primary">Return to cart</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="cc-page">
      <ProgressBar />
      <div className="cc-two-col">
        <section>
          <Outlet />
        </section>
        <CheckoutSummary />
      </div>
    </main>
  )
}

function ProgressBar() {
  const { pathname } = useLocation()
  const { shippingReady, paymentReady } = useCheckoutProgress()
  const reachable = { shipping: true, payment: shippingReady, review: paymentReady }
  const current = pathname.split('/').pop()

  return (
    <nav aria-label="Checkout progress">
      <ol className="cc-progress">
        {STEPS.map((step, i) => {
          const label = `${i + 1} ${step.label}`
          let content = <span>{label}</span>
          if (step.path === current) content = <span aria-current="step">{label}</span>
          else if (reachable[step.path]) content = <Link to={`/checkout/${step.path}`}>{label}</Link>
          return (
            <li key={step.path} className={step.path === current ? 'is-current' : undefined}>
              {content}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function CheckoutSummary() {
  const { inStockLines } = useCart()
  const { details } = useCheckout()
  const totals = calcTotals(inStockLines, details.shippingMethod)
  const units = inStockLines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <aside className="cc-summary" aria-label="Order summary">
      <h2 className="cc-summary-title">Order summary</h2>
      <dl className="cc-totals">
        <dt>{units} {units === 1 ? 'item' : 'items'}</dt>
        <dd>{formatCents(totals.subtotal)}</dd>
        <dt>Shipping ({SHIPPING_METHODS[details.shippingMethod].label})</dt>
        <dd>{formatCents(totals.shipping)}</dd>
        <dt>Tax</dt>
        <dd>{formatCents(totals.tax)}</dd>
        <dt className="cc-total">Total</dt>
        <dd className="cc-total">{formatCents(totals.total)}</dd>
      </dl>
    </aside>
  )
}
