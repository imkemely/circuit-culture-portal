import { USE_FAKE_API, delay } from './config'
import { fakeProducts } from './fakeData'
import { dollarsToCents } from '../lib/money'

async function fetchProduct(productId) {
  if (USE_FAKE_API) {
    await delay(200)
    const product = fakeProducts.find((p) => p.id === productId)
    return product ? structuredClone(product) : null
  }
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET /api/products/${productId} failed (${res.status})`)
  return res.json()
}

// Current stock and price for every variant of the given products, used to
// re-validate the cart. A product that no longer exists is still listed in
// checkedProductIds, so the cart can mark its lines as unavailable.
export async function fetchAvailability(productIds) {
  const products = await Promise.all(productIds.map(fetchProduct))
  const info = {}
  for (const product of products) {
    if (!product) continue
    for (const variant of product.variants) {
      info[variant.id] = {
        stock: variant.stock,
        priceCents: dollarsToCents(variant.price ?? product.price),
      }
    }
  }
  return { checkedProductIds: productIds, info }
}
