import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import ProductList from './pages/ProductList.jsx'
import ProductPage from './pages/ProductPage.jsx'
import Confirmation from './pages/Confirmation.jsx'

// All the pages of the prototype are registered here.
// When you add your page, import it above and add a <Route> below.
//   Arnold: "/" (product list) and "/products/:id" (product page)
//   Luis:   "/cart" and "/checkout" (after a successful order, navigate to /confirmation/<orderNumber>)
//   Shreya: wrap <Routes> in the shared layout (header + footer)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/confirmation/:orderNumber" element={<Confirmation />} />
          {/* Teammates: add /cart and /checkout routes here */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
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
