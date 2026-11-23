import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductImage from './ProductImage.jsx'
import './catalog.css'

// Live collections on the store. Miami Mango is coming soon (no products yet).
const COLLECTIONS = ['Endurance', 'Design District', 'Driven By', 'Miami Mango']

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [collection, setCollection] = useState('All')

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

  const collections = ['All', ...COLLECTIONS]
  const visible = collection === 'All' ? products : products.filter((p) => p.collection === collection)

  return (
    <main className="catalog">
      <h1>Circuit Culture</h1>
      <p className="tagline">Made to order. Quality garments and original designs.</p>
      <div className="filter-row">
        {collections.map((c) => (
          <button
            key={c}
            className={`filter-btn${c === collection ? ' active' : ''}`}
            onClick={() => setCollection(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {!loading && !error && visible.length === 0 && (
        <p className="status-msg"><em>coming soon...</em></p>
      )}
      {loading && <p className="status-msg">Loading products...</p>}
      {error && <p className="status-msg">{error}. Is the backend running?</p>}
      <div className="catalog-grid">
        {visible.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="product-card">
            <ProductImage product={p} />
            <div className="product-card-body">
              <h2>{p.name}</h2>
              <p className="product-category">{p.collection} · {p.category}</p>
              <p className="product-price">${Number(p.price).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default ProductList
