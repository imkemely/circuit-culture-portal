import { useContext } from 'react'
import { CartContext } from './cartContext'

// {
//   lines, inStockLines, itemCount, notices,
//   addItem(item, quantity), setQuantity(variantId, quantity), removeItem(variantId),
//   undoRemove(noticeId), dismissNotice(noticeId), applyAvailability(result), clearCart()
// }
// Build `item` for addItem with toCartItem() from ./cartReducer.
export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
