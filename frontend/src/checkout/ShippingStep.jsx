import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCheckout } from './useCheckout'
import { TextField } from './fields'
import AddressFields from './AddressFields'
import { isValid, validateShipping } from './validation'
import { formatCents } from '../lib/money'
import { SHIPPING_METHODS } from '../lib/pricing'

// SCR-02 Checkout - Contact & Shipping. Guest checkout only: the prototype has no
// accounts, so the sign-in prompt and "save this address" checkbox are left out.
export default function ShippingStep() {
  const navigate = useNavigate()
  const { details, updateDetails, updateShippingAddress, markShippingSubmitted } = useCheckout()
  const [touched, setTouched] = useState({})
  const errors = validateShipping(details)
  const valid = isValid(errors)
  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    markShippingSubmitted()
    navigate('/checkout/payment')
  }

  return (
    <form className="cc-form" noValidate onSubmit={handleSubmit}>
      <p className="cc-muted">Checking out as a guest.</p>

      <fieldset>
        <legend>Contact</legend>
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
          value={details.email}
          error={errors.email}
          showError={touched.email}
          onChange={(e) => updateDetails({ email: e.target.value })}
          onBlur={() => touch('email')}
        />
        <label className="cc-check">
          <input
            type="checkbox"
            checked={details.newsletterOptIn}
            onChange={(e) => updateDetails({ newsletterOptIn: e.target.checked })}
          />
          Email me about new drops and offers
        </label>
      </fieldset>

      <fieldset>
        <legend>Shipping address</legend>
        <AddressFields
          section="shipping"
          values={details.shipping}
          errors={errors.shipping}
          touched={touched}
          onChange={updateShippingAddress}
          onBlur={touch}
          includePhone
        />
      </fieldset>

      <fieldset>
        <legend>Shipping method</legend>
        <div className="cc-options">
          {Object.values(SHIPPING_METHODS).map((method) => (
            <label key={method.id} className="cc-option">
              <input
                type="radio"
                name="shippingMethod"
                value={method.id}
                checked={details.shippingMethod === method.id}
                onChange={() => updateDetails({ shippingMethod: method.id })}
              />
              <span>{method.label} ({method.window})</span>
              <span>{formatCents(method.cents)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="cc-actions">
        <Link to="/cart" className="cc-back-link">&lt; Return to cart</Link>
        <button type="submit" className="cc-button-primary" disabled={!valid}>
          Continue to payment
        </button>
      </div>
    </form>
  )
}
