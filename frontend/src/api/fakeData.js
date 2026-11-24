// Fake catalog used while USE_FAKE_API is on. The shape is the proposed response
// of GET /api/products/{id}: prices in dollars (like a Java BigDecimal), one entry
// per size/color variant with its own stock. `variant.price` may override the
// product price. Stock is mutated in memory by fake orders and resets on reload.
export const fakeProducts = [
  {
    id: 1,
    name: 'Endurance Hoodie',
    collection: 'Endurance',
    price: 78.0,
    imageUrl: null,
    variants: [
      { id: 101, color: 'Black', size: 'M', stock: 12 },
      { id: 102, color: 'Black', size: 'L', stock: 4 },
      { id: 103, color: 'Heather Grey', size: 'L', stock: 9 },
    ],
  },
  {
    id: 2,
    name: 'Miami Mango Tee',
    collection: 'Miami Mango',
    price: 50.0,
    imageUrl: null,
    variants: [
      { id: 201, color: 'Mango', size: 'M', stock: 0 },
      { id: 202, color: 'Mango', size: 'L', stock: 6 },
    ],
  },
  {
    id: 3,
    name: 'Design District Cap',
    collection: 'Design District',
    price: 35.0,
    imageUrl: null,
    variants: [{ id: 301, color: 'Sand', size: 'One Size', stock: 2 }],
  },
]

// [variantId, quantity] pairs that exercise every cart state: a normal line,
// a sold-out line (MSG 3) and a line above its stock (MSG 2).
export const sampleCart = [
  [102, 2],
  [201, 1],
  [301, 3],
]

export function findFakeVariant(variantId) {
  for (const product of fakeProducts) {
    const variant = product.variants.find((v) => v.id === variantId)
    if (variant) return { product, variant }
  }
  return null
}
