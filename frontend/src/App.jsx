import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import ProductList from './pages/ProductList.jsx'
import ProductPage from './pages/ProductPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductPage />} />
          {/* Teammates: add /cart, /checkout and /order/:orderNumber routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
