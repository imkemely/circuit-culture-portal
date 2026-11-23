import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './Confirmation.css'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/**
 * Order confirmation page: /confirmation/:orderNumber
 * Loads the order from GET /api/orders/{orderNumber} and shows a summary.
 */
function Confirmation() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .then((response) => {
        if (response.status === 404) {
          throw new Error(`We couldn't find order ${orderNumber}.`)
        }
        if (!response.ok) {
          throw new Error('Something went wrong loading your order. Please try again.')
        }
        return response.json()
      })
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
  }, [orderNumber])

  if (error) {
    return (
      <main className="confirmation">
        <h1>Order not found</h1>
        <p className="confirmation-error">{error}</p>
        <Link to="/" className="confirmation-button">Back to the shop</Link>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="confirmation">
        <p>Loading your order...</p>
      </main>
    )
  }

  return (
    <main className="confirmation">
      <h1>Thank you for your order!</h1>
      <p>
        Your order number is <strong data-testid="order-number">{order.orderNumber}</strong>.
        A confirmation will be sent to {order.email}.
      </p>

      <section className="confirmation-details">
        <div>
          <h2>Shipping to</h2>
          <p>{order.customerName}<br />{order.shippingAddress}</p>
        </div>
        <div>
          <h2>Order date</h2>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <h2>Status</h2>
          <p>{order.status}</p>
        </div>
      </section>

      <table className="confirmation-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Size / Color</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>{[item.size, item.color].filter(Boolean).join(' / ') || '-'}</td>
              <td>{item.quantity}</td>
              <td>{money.format(item.unitPrice)}</td>
              <td>{money.format(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Order total</td>
            <td>{money.format(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      <Link to="/" className="confirmation-button">Continue shopping</Link>
    </main>
  )
}

export default Confirmation
