import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './cart/CartProvider'
import { CheckoutProvider } from './checkout/CheckoutProvider'
import CartPage from './pages/CartPage'
import CheckoutLayout from './checkout/CheckoutLayout'
import ShippingStep from './checkout/ShippingStep'
import PaymentStep from './checkout/PaymentStep'
import ReviewStep from './checkout/ReviewStep'
import OrderConfirmationPlaceholder from './pages/OrderConfirmationPlaceholder'

// Temporary home until the product list page exists.
function HomePlaceholder() {
  return (
    <main className="cc-page">
      <h1 className="cc-title">Circuit Culture</h1>
      <p>The catalog is coming soon.</p>
      <p><Link to="/cart">Go to cart</Link></p>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CheckoutProvider>
          <Routes>
            <Route path="/" element={<HomePlaceholder />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutLayout />}>
              <Route index element={<Navigate to="shipping" replace />} />
              <Route path="shipping" element={<ShippingStep />} />
              <Route path="payment" element={<PaymentStep />} />
              <Route path="review" element={<ReviewStep />} />
            </Route>
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPlaceholder />} />
          </Routes>
        </CheckoutProvider>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
