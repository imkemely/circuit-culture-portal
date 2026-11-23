// Until the product and order endpoints exist, the cart and checkout run against
// in-memory fake data. Set VITE_USE_FAKE_API=false (e.g. in frontend/.env.local)
// to call the real backend through the Vite proxy instead.
export const USE_FAKE_API = import.meta.env.VITE_USE_FAKE_API !== 'false'

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
