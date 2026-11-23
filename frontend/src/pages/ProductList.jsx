import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductImage from './ProductImage.jsx'
import './catalog.css'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load products')
        return res.json()
      })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="catalog">
      <h1>Shop</h1>
      {loading && <p className="status-msg">Loading products...</p>}
      {error && <p className="status-msg">{error}. Is the backend running?</p>}
      <div className="catalog-grid">
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="product-card">
            <ProductImage product={p} />
            <div className="product-card-body">
              <h2>{p.name}</h2>
              <p className="product-category">{p.category}</p>
              <p className="product-price">${Number(p.price).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default ProductList
