/** Product photo, or a letter placeholder when the product has no imageUrl. */
function ProductImage({ product }) {
  if (product.imageUrl) {
    return <img className="product-image" src={product.imageUrl} alt={product.name} />
  }
  return (
    <div className="product-image" aria-hidden="true">
      {product.name.charAt(0)}
    </div>
  )
}

export default ProductImage
