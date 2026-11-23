import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/useCart'
import { toCartItem } from '../cart/cartReducer'
import CartNotices from '../cart/CartNotices'
import ProductThumb from '../cart/ProductThumb'
import { fetchAvailability } from '../api/products'
import { USE_FAKE_API } from '../api/config'
import { fakeProducts, sampleCart } from '../api/fakeData'
import { formatCents } from '../lib/money'
import { MAX_QTY_PER_LINE, calcTotals } from '../lib/pricing'
import '../cart-checkout.css'

// SCR-01 Shopping Cart (D2 2.1.1, D4 4.3 step 3).
export default function CartPage() {
  const navigate = useNavigate()
  const { lines, inStockLines, itemCount, setQuantity, removeItem, applyAvailability } = useCart()
  const [stockCheck, setStockCheck] = useState({ key: null, failed: false })

  // Re-check price and stock whenever the set of products in the cart changes.
  const productKey = useMemo(
    () => JSON.stringify([...new Set(lines.map((l) => l.productId))].sort()),
    [lines],
  )
  useEffect(() => {
    const productIds = JSON.parse(productKey)
    if (productIds.length === 0) return
    let cancelled = false
    fetchAvailability(productIds)
      .then((result) => {
        if (cancelled) return
        applyAvailability(result)
        setStockCheck({ key: productKey, failed: false })
      })
      .catch(() => {
        if (!cancelled) setStockCheck({ key: productKey, failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [productKey, applyAvailability])

  const checking = lines.length > 0 && stockCheck.key !== productKey
  const totals = calcTotals(inStockLines)

  return (
    <main className="cc-page">
      <h1 className="cc-title">Your cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
      <CartNotices />

      {lines.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="cc-two-col">
          <section aria-label="Cart items">
            {stockCheck.failed && stockCheck.key === productKey && (
              <p className="cc-notice cc-notice-warning" role="status">
                We couldn't check stock right now. Availability will be confirmed when you place your order.
              </p>
            )}
            <ul className="cc-lines">
              {lines.map((line) => (
                <CartLine
                  key={line.variantId}
                  line={line}
                  onQuantity={(q) => setQuantity(line.variantId, q)}
                  onRemove={() => removeItem(line.variantId)}
                />
              ))}
            </ul>
            <Link to="/" className="cc-back-link">&lt; Continue shopping</Link>
          </section>

          <aside className="cc-summary" aria-label="Order summary">
            <h2 className="cc-summary-title">Order summary</h2>
            <dl className="cc-totals">
              <dt>Subtotal</dt>
              <dd>{formatCents(totals.subtotal)}</dd>
              <dt>Estimated tax</dt>
              <dd>{formatCents(totals.tax)}</dd>
              <dt>Estimated shipping</dt>
              <dd>{formatCents(totals.shipping)}</dd>
              <dt className="cc-total">Total</dt>
              <dd className="cc-total">{formatCents(totals.total)}</dd>
            </dl>
            <button
              type="button"
              className="cc-button-primary cc-block"
              disabled={inStockLines.length === 0 || checking}
              onClick={() => navigate('/checkout/shipping')}
            >
              {checking ? 'Checking stock…' : 'Checkout'}
            </button>
            <Link to="/" className="cc-button-secondary cc-block">Continue shopping</Link>
          </aside>
        </div>
      )}
    </main>
  )
}

function CartLine({ line, onQuantity, onRemove }) {
  const soldOut = line.stock === 0
  return (
    <li className={`cc-line${soldOut ? ' is-sold-out' : ''}`}>
      <ProductThumb line={line} />
      <div className="cc-line-info">
        <Link to={`/products/${line.productId}`} className="cc-line-name">{line.name}</Link>
        <div className="cc-muted">{line.color} / {line.size}</div>
        <div>{formatCents(line.priceCents)}</div>
        {soldOut && <span className="cc-badge-soldout">Sold out</span>}
        <button type="button" className="cc-link-button" onClick={onRemove}>Remove</button>
      </div>
      <QuantityStepper
        name={line.name}
        value={line.quantity}
        disabled={soldOut}
        onChange={onQuantity}
      />
      <div className="cc-line-total">
        {soldOut ? '—' : formatCents(line.priceCents * line.quantity)}
      </div>
    </li>
  )
}

// The + button stays enabled up to 10 even when stock is lower, so asking for more
// than is available shows MSG 2 (D2 use case 4a) instead of silently stopping.
function QuantityStepper({ name, value, disabled, onChange }) {
  return (
    <div className="cc-stepper" role="group" aria-label={`Quantity of ${name}`}>
      <button
        type="button"
        aria-label={`Decrease quantity of ${name}`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label={`Increase quantity of ${name}`}
        disabled={disabled || value >= MAX_QTY_PER_LINE}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}

function EmptyCart() {
  const { addItem } = useCart()

  function addSampleItems() {
    for (const [variantId, quantity] of sampleCart) {
      const product = fakeProducts.find((p) => p.variants.some((v) => v.id === variantId))
      const variant = product.variants.find((v) => v.id === variantId)
      // Leave stock unknown so the stock check runs and shows its messages.
      addItem({ ...toCartItem(product, variant), stock: undefined }, quantity)
    }
  }

  return (
    <div className="cc-empty" role="status">
      <p>Nothing here yet. Browse collections to get started.</p>
      <Link to="/" className="cc-button-primary">Browse collections</Link>
      {USE_FAKE_API && (
        <button type="button" className="cc-link-button" onClick={addSampleItems}>
          Add sample items (fake data)
        </button>
      )}
    </div>
  )
}
