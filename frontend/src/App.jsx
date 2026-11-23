import { BrowserRouter, Route, Routes } from 'react-router-dom'
<<<<<<< HEAD
=======
import Layout from './Layout.jsx'
>>>>>>> origin/feature/layout-styling
import ProductList from './pages/ProductList.jsx'
import ProductPage from './pages/ProductPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductPage />} />
        {/* Teammates: add /cart, /checkout and /order/:orderNumber routes here */}
=======
        <Route element={<Layout />}>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductPage />} />
          {/* Teammates: add /cart, /checkout and /order/:orderNumber routes here */}
        </Route>
>>>>>>> origin/feature/layout-styling
      </Routes>
    </BrowserRouter>
  )
}

export default App
