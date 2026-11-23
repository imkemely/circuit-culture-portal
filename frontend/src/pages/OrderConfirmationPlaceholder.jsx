import { Link, useParams } from 'react-router-dom'

// Stand-in so the checkout flow has somewhere to land. The real Order Confirmation
// page belongs to the orders/confirmation owner and should replace this route.
// Checkout navigates here with the order number in the URL and the POST /api/orders
// response in location.state.order.
export default function OrderConfirmationPlaceholder() {
  const { orderNumber } = useParams()
  return (
    <main className="cc-page">
      <div className="cc-empty" role="status">
        <p>Thank you! Order {orderNumber} was placed.</p>
        <p className="cc-muted">(Placeholder until the Order Confirmation page is built.)</p>
        <Link to="/" className="cc-button-primary">Continue shopping</Link>
      </div>
    </main>
  )
}
