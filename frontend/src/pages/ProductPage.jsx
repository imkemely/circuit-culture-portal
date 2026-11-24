import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductImage from './ProductImage.jsx'
import { useCart } from '../cart/useCart'
import { toCartItem } from '../cart/cartReducer'
import './catalog.css'

function ProductPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Product not found' : 'Could not load product')
        }
        return res.json()
      })
      .then(setProduct)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <main className="catalog">
        <Link to="/">&larr; Back to shop</Link>
        <p className="status-msg">{error}</p>
      </main>
    )
  }
  if (!product) {
    return (
      <main className="catalog">
        <p className="status-msg">Loading...</p>
      </main>
    )
  }

  const sizes = [...new Set(product.variants.map((v) => v.size))]
  const colors = [...new Set(product.variants.map((v) => v.color))]
  const variantFor = (s, c) => product.variants.find((v) => v.size === s && v.color === c)
  const variant = variantFor(size, color)

  // Disable a color that doesn't exist for the chosen size, or is sold out in it.
  const colorUnavailable = (c) => {
    if (size === null) return false
    const v = variantFor(size, c)
    return !v || v.stock === 0
  }

  const handleAdd = () => {
    addItem(toCartItem(product, variant), 1)
    setAdded(true)
  }

  let note = 'Select a size and color.'
  if (size && color && !variant) note = 'That combination is not available.'
  else if (variant) {
    if (variant.stock === 0) note = 'Out of stock.'
    else if (variant.stock <= 5) note = `Only ${variant.stock} left!`
    else note = 'In stock.'
  }

  return (
    <main className="catalog">
      <Link to="/" className="back-link">&larr; Back to shop</Link>
      <div className="product-detail">
        <ProductImage product={product} />
        <div>
          <h1>{product.name}</h1>
          <p className="product-category">{product.collection} · {product.category}</p>
          <p className="product-price">${Number(product.price).toFixed(2)}</p>
          <p>{product.description}</p>

          <div className="option-label">Size</div>
          <div className="option-row">
            {sizes.map((s) => (
              <button
                key={s}
                className={`option-btn${s === size ? ' selected' : ''}`}
                onClick={() => {
                  setSize(s)
                  setAdded(false)
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="option-label">Color</div>
          <div className="option-row">
            {colors.map((c) => (
              <button
                key={c}
                className={`option-btn${c === color ? ' selected' : ''}`}
                disabled={colorUnavailable(c)}
                onClick={() => {
                  setColor(c)
                  setAdded(false)
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="stock-note">{note}</p>
          <button
            className="add-btn"
            disabled={!variant || variant.stock === 0}
            onClick={handleAdd}
          >
            Add to cart
          </button>
          {added && <p className="stock-note">Added to cart!</p>}
        </div>
      </div>
    </main>
  )
}

export default ProductPage
