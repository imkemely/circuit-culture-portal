// The product and order endpoints exist now, so the cart and checkout call the real
// backend through the Vite proxy. Set VITE_USE_FAKE_API=true (e.g. in
// frontend/.env.local) to use the in-memory fake data instead.
export const USE_FAKE_API = import.meta.env.VITE_USE_FAKE_API === 'true'

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
