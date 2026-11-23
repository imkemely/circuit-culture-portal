import { Link, Route, Routes } from 'react-router-dom'
import Confirmation from './pages/Confirmation.jsx'

// All the pages of the prototype are registered here.
// When you add your page, import it above and add a <Route> below.
//   Arnold: "/" (product list) and "/products/:id" (product page)
//   Luis:   "/cart" and "/checkout" (after a successful order, navigate to /confirmation/<orderNumber>)
//   Shreya: wrap <Routes> in the shared layout (header + footer)
function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder />} />
      <Route path="/confirmation/:orderNumber" element={<Confirmation />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// Temporary home page until the product list is merged.
function Placeholder() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Circuit Culture</h1>
      <p>Product list coming soon.</p>
    </main>
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
