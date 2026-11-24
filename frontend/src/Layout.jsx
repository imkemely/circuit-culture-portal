import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "./cart/useCart";
import "./Layout.css";

/**
 * Shared page frame for every screen in the journey (header, footer, page area).
 * Used once in App.jsx as a layout route, so nobody has to wrap their own page.
 */
export default function Layout() {
  const { itemCount: cartCount } = useCart();

  return (
    <div className="layout">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header">
        <Link to="/" className="wordmark">CIRCUIT CULTURE</Link>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end>Catalog</NavLink>
          <NavLink to="/cart" className="cart-link" aria-label={`Cart, ${cartCount} items`}>
            Cart <span className="cart-badge">{cartCount}</span>
          </NavLink>
        </nav>
      </header>

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>&copy; 2026 Circuit Culture</span>
        {/* About and FAQ pages are not part of this prototype, so they are text, not links */}
        <span className="footer-links">About &middot; FAQ</span>
      </footer>
    </div>
  );
}
