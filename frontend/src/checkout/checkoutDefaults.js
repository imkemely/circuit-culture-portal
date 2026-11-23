export const EMPTY_ADDRESS = {
  firstName: '',
  lastName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  phone: '',
}

// Contact + shipping details. Saved to sessionStorage so "Return to cart" and a
// page refresh keep what the shopper typed.
export const EMPTY_DETAILS = {
  email: '',
  newsletterOptIn: false,
  shipping: EMPTY_ADDRESS,
  shippingMethod: 'STANDARD',
  shippingSubmitted: false,
}

// Payment details live in memory only and are never written to storage.
export const EMPTY_PAYMENT = {
  method: 'CARD',
  cardNumber: '', // digits only
  expiry: '', // MM/YY
  cvc: '',
  nameOnCard: '',
  sameAsShipping: true,
  billing: { ...EMPTY_ADDRESS, phone: undefined },
  submitted: false,
}
