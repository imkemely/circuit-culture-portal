// Field rules from D2 SCR-02 (Contact & Shipping) and SCR-03 (Payment).
// Every validator returns an object of { field: message } for invalid fields only.
import { SHIPPING_METHODS } from '../lib/pricing'
import { COUNTRIES, US_STATES } from '../lib/usStates'

// RFC 5322 in full is impractical to match with a regex; this catches typos and
// the server validates again.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PERSON_NAME_RE = /^[\p{L} '-]{1,40}$/u
const ZIP_RE = /^\d{5}(-\d{4})?$/
const CARD_NAME_RE = /^[\p{L} ]{2,60}$/u
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/(\d{2})$/

export function isValid(errors) {
  return Object.values(errors).every((e) => (typeof e === 'object' ? isValid(e) : !e))
}

function lengthError(value, min, max, label) {
  const len = value.trim().length
  if (min > 0 && len === 0) return `${label} is required`
  if (len < min || len > max) return `${label} must be ${min}-${max} characters`
  return null
}

function put(errors, field, message) {
  if (message) errors[field] = message
}

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (email.length > 254 || !EMAIL_RE.test(email.trim())) return 'Enter a valid email address'
  return null
}

export function validateAddress(a, { includePhone }) {
  const errors = {}
  for (const [field, label] of [['firstName', 'First name'], ['lastName', 'Last name']]) {
    const value = a[field].trim()
    if (!value) put(errors, field, `${label} is required`)
    else if (!PERSON_NAME_RE.test(value) || !/\p{L}/u.test(value)) {
      put(errors, field, `${label} can use letters, spaces, hyphens and apostrophes (up to 40)`)
    }
  }
  put(errors, 'line1', lengthError(a.line1, 1, 100, 'Address'))
  put(errors, 'line2', lengthError(a.line2, 0, 100, 'Apartment or suite'))
  put(errors, 'city', lengthError(a.city, 1, 50, 'City'))
  if (!US_STATES.some((s) => s.code === a.state)) put(errors, 'state', 'Select a state')
  if (!ZIP_RE.test(a.zip.trim())) put(errors, 'zip', 'Enter a 5-digit ZIP code (or ZIP+4, like 33136-1234)')
  if (!COUNTRIES.some((c) => c.code === a.country)) put(errors, 'country', 'Select a country')
  if (includePhone) {
    const digits = a.phone.replace(/[\s().+-]/g, '')
    if (!/^\d{10,15}$/.test(digits)) put(errors, 'phone', 'Enter a phone number with 10-15 digits')
  }
  return errors
}

export function validateShipping(details) {
  const errors = { shipping: validateAddress(details.shipping, { includePhone: true }) }
  put(errors, 'email', validateEmail(details.email))
  if (!SHIPPING_METHODS[details.shippingMethod]) put(errors, 'shippingMethod', 'Choose a shipping method')
  return errors
}

export function detectCardBrand(digits) {
  if (/^4/.test(digits)) return 'Visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'American Express'
  if (/^(6011|65|64[4-9])/.test(digits)) return 'Discover'
  return 'Card'
}

export function validatePayment(payment, now = new Date()) {
  const errors = {}
  if (payment.method !== 'CARD') {
    errors.method = 'PayPal is not available in this prototype. Please pay by card.'
    return errors
  }
  const digits = payment.cardNumber
  if (!/^\d{13,19}$/.test(digits)) put(errors, 'cardNumber', 'Card number must be 13-19 digits')

  const match = EXPIRY_RE.exec(payment.expiry)
  if (!match) {
    put(errors, 'expiry', 'Enter the expiry date as MM/YY')
  } else {
    const month = Number(match[1])
    const year = 2000 + Number(match[2])
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth() + 1
    if (year < thisYear || (year === thisYear && month < thisMonth)) put(errors, 'expiry', 'This card has expired')
  }

  const cvcLength = detectCardBrand(digits) === 'American Express' ? 4 : 3
  if (!new RegExp(`^\\d{${cvcLength}}$`).test(payment.cvc)) put(errors, 'cvc', `CVC must be ${cvcLength} digits`)

  if (!CARD_NAME_RE.test(payment.nameOnCard.trim())) {
    put(errors, 'nameOnCard', 'Name on card must be 2-60 letters and spaces')
  }
  if (!payment.sameAsShipping) errors.billing = validateAddress(payment.billing, { includePhone: false })
  return errors
}
