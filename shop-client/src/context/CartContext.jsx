import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { combos, products } from '../data/catalog';

const CartContext = createContext(null);
const STORAGE_KEY = 'ntc-cart-v1';

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const currentItems = new Map([...products, ...combos].map((item) => [item.id, item]));
    return saved.map((item) => currentItems.has(item.id) ? { ...item, ...currentItems.get(item.id), quantity: item.quantity } : item);
  }
  catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [cartPulse, setCartPulse] = useState(0);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { ...product, quantity }];
    });
    setCartPulse((value) => value + 1);
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const increaseQuantity = useCallback((id) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)), []);
  const decreaseQuantity = useCallback((id) => setItems((current) => current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [])), []);
  const clearCart = useCallback(() => setItems([]), []);
  const getTotal = useCallback(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const getCartCount = useCallback(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const value = useMemo(() => ({ items, cartPulse, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getTotal, getCartCount }), [items, cartPulse, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getTotal, getCartCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
