import { useEffect, useMemo, useReducer } from 'react'
import { CartContext } from './cartContext'
import { cartReducer } from './cartReducer'

// Guest carts persist for 30 days (D2 "Session"). The prototype has no accounts,
// so localStorage stands in for both the guest cookie and the cart table.
const STORAGE_KEY = 'cc.cart.v1'
const TTL_MS = 30 * 24 * 60 * 60 * 1000

function loadLines() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || !Array.isArray(saved.lines)) return []
    if (Date.now() - saved.savedAt > TTL_MS) return []
    return saved.lines
  } catch {
    return []
  }
}

function initCart() {
  return { lines: loadLines(), notices: [] }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), lines: state.lines }))
    } catch {
      // Storage full or blocked: the cart still works for this tab.
    }
  }, [state.lines])

  // Stable across renders so effects can depend on them.
  const actions = useMemo(
    () => ({
      addItem: (item, quantity = 1) => dispatch({ type: 'add', item, quantity }),
      setQuantity: (variantId, quantity) => dispatch({ type: 'setQuantity', variantId, quantity }),
      removeItem: (variantId) => dispatch({ type: 'remove', variantId }),
      undoRemove: (noticeId) => dispatch({ type: 'undoRemove', noticeId }),
      dismissNotice: (noticeId) => dispatch({ type: 'dismissNotice', noticeId }),
      applyAvailability: ({ checkedProductIds, info }) =>
        dispatch({ type: 'availabilityLoaded', checkedProductIds, info }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [],
  )

  const value = useMemo(() => {
    const inStockLines = state.lines.filter((l) => l.stock !== 0)
    return {
      ...actions,
      lines: state.lines,
      notices: state.notices,
      inStockLines,
      // Header badge: D2 counts every unit in the cart, sold-out lines included.
      itemCount: state.lines.reduce((sum, l) => sum + l.quantity, 0),
    }
  }, [state, actions])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
