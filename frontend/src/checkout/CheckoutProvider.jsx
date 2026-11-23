import { useEffect, useMemo, useState } from 'react'
import { CheckoutContext } from './checkoutContext'
import { EMPTY_DETAILS, EMPTY_PAYMENT } from './checkoutDefaults'

const STORAGE_KEY = 'cc.checkout.v1'

function loadDetails() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (!saved) return EMPTY_DETAILS
    return { ...EMPTY_DETAILS, ...saved, shipping: { ...EMPTY_DETAILS.shipping, ...saved.shipping } }
  } catch {
    return EMPTY_DETAILS
  }
}

export function CheckoutProvider({ children }) {
  const [details, setDetails] = useState(loadDetails)
  const [payment, setPayment] = useState(EMPTY_PAYMENT)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details))
    } catch {
      // Storage blocked: details still last for this page view.
    }
  }, [details])

  const actions = useMemo(
    () => ({
      updateDetails: (patch) => setDetails((d) => ({ ...d, ...patch })),
      updateShippingAddress: (field, value) =>
        setDetails((d) => ({ ...d, shipping: { ...d.shipping, [field]: value } })),
      markShippingSubmitted: () => setDetails((d) => ({ ...d, shippingSubmitted: true })),
      updatePayment: (patch) => setPayment((p) => ({ ...p, ...patch })),
      updateBillingAddress: (field, value) =>
        setPayment((p) => ({ ...p, billing: { ...p.billing, [field]: value } })),
      markPaymentSubmitted: () => setPayment((p) => ({ ...p, submitted: true })),
      // D2 SCR-03: "Return to shipping" discards the card.
      clearCard: () =>
        setPayment((p) => ({ ...p, cardNumber: '', expiry: '', cvc: '', submitted: false })),
      resetCheckout: () => {
        setDetails(EMPTY_DETAILS)
        setPayment(EMPTY_PAYMENT)
      },
    }),
    [],
  )

  const value = useMemo(() => ({ ...actions, details, payment }), [actions, details, payment])
  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}
