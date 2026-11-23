// All cart and checkout math is done in integer cents so totals never pick up
// floating-point drift. Convert only at the edges (API responses, display).

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatCents(cents) {
  return usd.format(cents / 100)
}

export function dollarsToCents(dollars) {
  return Math.round(Number(dollars) * 100)
}
