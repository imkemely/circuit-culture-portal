import { MAX_QTY_PER_LINE, maxQuantityFor } from '../lib/pricing'
import { dollarsToCents } from '../lib/money'

// A cart line:
//   { variantId, productId, name, color, size, priceCents, imageUrl, stock, quantity }
// `stock` is undefined until the line has been checked against the API, and 0 when
// the variant is sold out. Sold-out lines stay visible but are excluded from totals.

// Builds a cart item from a product + variant as returned by GET /api/products/{id}.
// The product page passes the result to useCart().addItem(item, quantity).
export function toCartItem(product, variant) {
  return {
    variantId: variant.id,
    productId: product.id,
    name: product.name,
    color: variant.color,
    size: variant.size,
    priceCents: dollarsToCents(variant.price ?? product.price),
    imageUrl: variant.imageUrl ?? product.imageUrl ?? null,
    stock: variant.stock,
  }
}

// Screen messages, D2 SCR-01 / section 2.1.3.
const limitedStockNotice = (line, n) => ({
  id: `limited-${line.variantId}`,
  kind: 'warning',
  text: `Only ${n} left in ${line.size} / ${line.color}. Quantity set to ${n}`,
})

// D2 MSG 3 says the item "was removed from your cart", but the D2 wireframe and
// use case 2a keep the line visible as Sold out and only drop it from the total,
// so the wording follows what actually happens.
const soldOutNotice = (line) => ({
  id: `soldout-${line.variantId}`,
  kind: 'error',
  text: `${line.name} in ${line.size} / ${line.color} sold out and was removed from your order total`,
})

const removedNotice = (line, index) => ({
  id: `removed-${line.variantId}`,
  kind: 'confirmation',
  text: `${line.name} removed from your cart`,
  line,
  index,
})

function upsertNotice(notices, notice) {
  return [...notices.filter((n) => n.id !== notice.id), notice]
}

function withoutNotice(notices, id) {
  return notices.filter((n) => n.id !== id)
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.lines.find((l) => l.variantId === action.item.variantId)
      const merged = { ...existing, ...action.item }
      const quantity = Math.min((existing?.quantity ?? 0) + action.quantity, maxQuantityFor(merged.stock))
      if (quantity < 1) return state
      const line = { ...merged, quantity }
      const lines = existing
        ? state.lines.map((l) => (l.variantId === line.variantId ? line : l))
        : [...state.lines, line]
      return { ...state, lines }
    }

    case 'setQuantity': {
      const line = state.lines.find((l) => l.variantId === action.variantId)
      if (!line || line.stock === 0) return state
      const cap = maxQuantityFor(line.stock)
      const quantity = Math.max(1, Math.min(action.quantity, cap))
      // D2 use case 4a: asking for more than is in stock caps the line and shows MSG 2.
      const overStock = action.quantity > cap && line.stock !== undefined && line.stock < MAX_QTY_PER_LINE
      return {
        lines: state.lines.map((l) => (l.variantId === line.variantId ? { ...l, quantity } : l)),
        notices: overStock ? upsertNotice(state.notices, limitedStockNotice(line, cap)) : state.notices,
      }
    }

    case 'remove': {
      const index = state.lines.findIndex((l) => l.variantId === action.variantId)
      if (index === -1) return state
      const line = state.lines[index]
      const otherNotices = state.notices.filter(
        (n) => !n.id.endsWith(`-${line.variantId}`),
      )
      return {
        lines: state.lines.filter((_, i) => i !== index),
        notices: [...otherNotices, removedNotice(line, index)],
      }
    }

    case 'undoRemove': {
      const notice = state.notices.find((n) => n.id === action.noticeId)
      if (!notice?.line) return state
      if (state.lines.some((l) => l.variantId === notice.line.variantId)) {
        return { ...state, notices: withoutNotice(state.notices, notice.id) }
      }
      const lines = [...state.lines]
      lines.splice(Math.min(notice.index, lines.length), 0, notice.line)
      return { lines, notices: withoutNotice(state.notices, notice.id) }
    }

    // action: { checkedProductIds, info: { [variantId]: { stock, priceCents? } } }
    // Lines whose product was checked but whose variant is missing are sold out.
    case 'availabilityLoaded': {
      const checked = new Set(action.checkedProductIds)
      let notices = state.notices
      const lines = state.lines.map((line) => {
        const info = action.info[line.variantId] ?? (checked.has(line.productId) ? { stock: 0 } : null)
        if (!info) return line
        const updated = { ...line, stock: info.stock, priceCents: info.priceCents ?? line.priceCents }
        if (info.stock === 0) {
          if (line.stock !== 0) notices = upsertNotice(notices, soldOutNotice(line))
          return updated
        }
        if (line.quantity > info.stock) {
          notices = upsertNotice(notices, limitedStockNotice(line, info.stock))
          return { ...updated, quantity: info.stock }
        }
        return updated
      })
      return { lines, notices }
    }

    case 'dismissNotice':
      return { ...state, notices: withoutNotice(state.notices, action.noticeId) }

    case 'clear':
      return { lines: [], notices: [] }

    default:
      throw new Error(`Unknown cart action: ${action.type}`)
  }
}
