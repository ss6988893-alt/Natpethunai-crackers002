import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiX } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { flyProductToCart } from '../../utils/cartVfx';

export default function ProductQuickView({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { if (!product) return undefined; const close = (event) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [product, onClose]);
  return <AnimatePresence>{product && <motion.div className="modal-backdrop quick-view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
    <motion.article role="dialog" aria-modal="true" aria-label={`${product.name} quick view`} className="quick-view" layoutId={`product-${product.id}`} initial={{ scale: .88, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 30 }} transition={{ type: 'spring', damping: 26, stiffness: 230 }} onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close quick view"><FiX /></button>
      <motion.div className="quick-view__visual" layoutId={`product-image-${product.id}`}><img src={product.image} alt={product.name} /><span>{product.priceAvailable !== false ? 'PDF price + 70%' : 'Price pending'}</span></motion.div>
      <div className="quick-view__copy"><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><p>{product.description}</p><div className="quick-view__price">{product.priceAvailable !== false ? <><strong>₹{product.price.toLocaleString('en-IN')}</strong><small>PDF base ₹{product.basePrice.toLocaleString('en-IN')} + 70%</small></> : <strong>Price on request</strong>}</div>{product.priceAvailable !== false && <div className="quick-view__actions"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><FiMinus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><FiPlus /></button></div><button className="button button--gold" onClick={(event) => { flyProductToCart(event.currentTarget.closest('article').querySelector('img')); onAdd(product, quantity); onClose(); }}><FiShoppingBag /> Add to cart</button></div>}</div>
    </motion.article>
  </motion.div>}</AnimatePresence>;
}
