import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import ProductList from './pages/ProductList.jsx'
import ProductPage from './pages/ProductPage.jsx'
import Confirmation from './pages/Confirmation.jsx'
import { CartProvider } from './cart/CartProvider'
import { CheckoutProvider } from './checkout/CheckoutProvider'
import CartPage from './pages/CartPage'
import CheckoutLayout from './checkout/CheckoutLayout'
import ShippingStep from './checkout/ShippingStep'
import PaymentStep from './checkout/PaymentStep'
import ReviewStep from './checkout/ReviewStep'

// All the pages of the prototype are registered here.
// When you add your page, import it above and add a <Route> below.
//   Arnold: "/" (product list) and "/products/:id" (product page)
//   Luis:   "/cart" and "/checkout" (after a successful order, navigate to /confirmation/<orderNumber>)
//   Shreya: wrap <Routes> in the shared layout (header + footer)
function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CheckoutProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutLayout />}>
                <Route index element={<Navigate to="shipping" replace />} />
                <Route path="shipping" element={<ShippingStep />} />
                <Route path="payment" element={<PaymentStep />} />
                <Route path="review" element={<ReviewStep />} />
              </Route>
              <Route path="/confirmation/:orderNumber" element={<Confirmation />} />
              <Route path="/order-confirmation/:orderNumber" element={<Confirmation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CheckoutProvider>
      </CartProvider>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Page not found</h1>
      <Link to="/">Back to the shop</Link>
    </main>
  )
}

export default App
