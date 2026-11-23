import { useEffect, useState } from "react";

// Arnold's product page saves the cart in localStorage under this key:
// [{ productId, variantId, name, size, color, price, quantity }]
const CART_KEY = "cart";
const CART_EVENT = "cart-updated";

/** Total number of items in the cart (adds up quantity, not number of lines). */
function readCount() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const qty = Number(item && item.quantity);
      return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
    }, 0);
  } catch {
    return 0; // missing, corrupt or blocked storage -> show 0 instead of crashing the page
  }
}

// Browsers only fire the "storage" event in OTHER tabs, so the header would not update
// when Add to Cart is clicked in this tab. To avoid asking anyone to remember to fire an
// event, we make setItem/removeItem/clear announce changes to the "cart" key themselves.
let storagePatched = false;
function announceCartChanges() {
  if (storagePatched || typeof window === "undefined" || !window.Storage) return;
  storagePatched = true;

  const notify = () => window.dispatchEvent(new Event(CART_EVENT));
  const proto = window.Storage.prototype;
  const originalSet = proto.setItem;
  const originalRemove = proto.removeItem;
  const originalClear = proto.clear;

  proto.setItem = function (key, value) {
    originalSet.call(this, key, value);
    if (key === CART_KEY) notify();
  };
  proto.removeItem = function (key) {
    originalRemove.call(this, key);
    if (key === CART_KEY) notify();
  };
  proto.clear = function () {
    originalClear.call(this);
    notify();
  };
}

/** Live item count for the header's cart badge. */
export default function useCartCount() {
  const [count, setCount] = useState(readCount);

  useEffect(() => {
    announceCartChanges();
    const update = () => setCount(readCount());
    window.addEventListener(CART_EVENT, update);   // changes made in this tab
    window.addEventListener("storage", update);    // changes made in another tab
    update();                                      // catch anything saved before we mounted
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return count;
}
