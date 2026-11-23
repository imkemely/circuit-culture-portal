import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProductList from './pages/ProductList.jsx'
import ProductPage from './pages/ProductPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductPage />} />
        {/* Teammates: add /cart, /checkout and /order/:orderNumber routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
