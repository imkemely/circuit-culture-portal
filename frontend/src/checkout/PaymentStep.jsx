import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCheckout, useCheckoutProgress } from './useCheckout'
import { TextField } from './fields'
import AddressFields from './AddressFields'
import { detectCardBrand, isValid, validatePayment } from './validation'
import { SHIPPING_METHODS } from '../lib/pricing'

const formatCardNumber = (digits) => digits.replace(/(\d{4})(?=\d)/g, '$1 ')

function formatExpiry(input) {
  const digits = input.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

// SCR-03 Checkout - Payment. In the full design (D2) these card fields are hosted
// by Stripe and only a token reaches our server. For the prototype the card goes
// to the mock gateway in the backend: 4242 4242 4242 4242 is approved, any other
// number is declined when the order is placed.
export default function PaymentStep() {
  const navigate = useNavigate()
  const { details, payment, updatePayment, updateBillingAddress, markPaymentSubmitted, clearCard } = useCheckout()
  const { shippingReady } = useCheckoutProgress()
  const [touched, setTouched] = useState({})

  if (!shippingReady) return <Navigate to="/checkout/shipping" replace />

  const errors = validatePayment(payment)
  const valid = isValid(errors)
  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))
  const brand = detectCardBrand(payment.cardNumber)
  const ship = details.shipping

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    markPaymentSubmitted()
    navigate('/checkout/review')
  }

  function returnToShipping() {
    clearCard()
    navigate('/checkout/shipping')
  }

  const cardField = (name) => ({
    id: `card-${name}`,
    value: payment[name],
    error: errors[name],
    showError: touched[name],
    onBlur: () => touch(name),
  })

  return (
    <form className="cc-form" noValidate onSubmit={handleSubmit}>
      <div className="cc-recap">
        <div>
          <span className="cc-muted">Ship to: </span>
          {ship.line1}, {ship.city}, {ship.state} {ship.zip}
          <Link to="/checkout/shipping">Change</Link>
        </div>
        <div>
          <span className="cc-muted">Method: </span>
          {SHIPPING_METHODS[details.shippingMethod].label} ({SHIPPING_METHODS[details.shippingMethod].window})
          <Link to="/checkout/shipping">Change</Link>
        </div>
      </div>

      <fieldset>
        <legend>Payment</legend>
        <div className="cc-options">
          <label className="cc-option">
            <input
              type="radio"
              name="paymentMethod"
              checked={payment.method === 'CARD'}
              onChange={() => updatePayment({ method: 'CARD' })}
            />
            <span>Credit / debit card</span>
          </label>
          <label className="cc-option">
            <input
              type="radio"
              name="paymentMethod"
              checked={payment.method === 'PAYPAL'}
              onChange={() => updatePayment({ method: 'PAYPAL' })}
            />
            <span>PayPal</span>
          </label>
        </div>

        {payment.method === 'PAYPAL' ? (
          <p className="cc-notice cc-notice-info" role="status">{errors.method}</p>
        ) : (
          <>
            <p className="cc-muted cc-small">
              Prototype payment: use 4242 4242 4242 4242 to be approved. Any other card number is declined.
            </p>
            <div className="cc-grid">
              <TextField
                className="cc-span-2"
                label={brand === 'Card' ? 'Card number' : `Card number (${brand})`}
                required
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 1234 1234 1234"
                {...cardField('cardNumber')}
                value={formatCardNumber(payment.cardNumber)}
                onChange={(e) => updatePayment({ cardNumber: e.target.value.replace(/\D/g, '').slice(0, 19) })}
              />
              <TextField
                label="Expiry (MM/YY)"
                required
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                {...cardField('expiry')}
                onChange={(e) => updatePayment({ expiry: formatExpiry(e.target.value) })}
              />
              <TextField
                label="CVC"
                required
                inputMode="numeric"
                autoComplete="cc-csc"
                title="The 3-digit code on the back of the card (4 digits on the front for American Express)"
                {...cardField('cvc')}
                onChange={(e) => updatePayment({ cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
              <TextField
                className="cc-span-2"
                label="Name on card"
                required
                autoComplete="cc-name"
                maxLength={60}
                {...cardField('nameOnCard')}
                onChange={(e) => updatePayment({ nameOnCard: e.target.value })}
              />
            </div>
          </>
        )}
      </fieldset>

      {payment.method === 'CARD' && (
        <fieldset>
          <legend>Billing address</legend>
          <label className="cc-check">
            <input
              type="checkbox"
              checked={payment.sameAsShipping}
              onChange={(e) => updatePayment({ sameAsShipping: e.target.checked })}
            />
            Same as shipping address
          </label>
          {!payment.sameAsShipping && (
            <AddressFields
              section="billing"
              values={payment.billing}
              errors={errors.billing ?? {}}
              touched={touched}
              onChange={updateBillingAddress}
              onBlur={touch}
            />
          )}
        </fieldset>
      )}

      <div className="cc-actions">
        <button type="button" className="cc-link-button cc-back-link" onClick={returnToShipping}>
          &lt; Return to shipping
        </button>
        <button type="submit" className="cc-button-primary" disabled={!valid}>
          Review order
        </button>
      </div>
    </form>
  )
}
