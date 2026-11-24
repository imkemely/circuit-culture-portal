import { useContext } from 'react'
import { CheckoutContext } from './checkoutContext'
import { isValid, validatePayment, validateShipping } from './validation'

export function useCheckout() {
  const checkout = useContext(CheckoutContext)
  if (!checkout) throw new Error('useCheckout must be used inside <CheckoutProvider>')
  return checkout
}

// A step is reachable once every earlier step was submitted and is still valid.
export function useCheckoutProgress() {
  const { details, payment } = useCheckout()
  const shippingReady = details.shippingSubmitted && isValid(validateShipping(details))
  const paymentReady = shippingReady && payment.submitted && isValid(validatePayment(payment))
  return { shippingReady, paymentReady }
}
