import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiX } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { flyProductToCart } from '../../utils/cartVfx';

export default function ProductQuickView({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { if (!product) return undefined; const close = (event) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [product, onClose]);
  return <AnimatePresence>{product && <motion.div className="modal-backdrop quick-view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
    <motion.article role="dialog" aria-modal="true" aria-label={`${product.name} quick view`} className="quick-view" initial={{ scale: .98, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .16, ease: 'easeOut' }} onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close quick view"><FiX /></button>
      <div className="quick-view__visual"><img src={product.image} alt={product.name} /><span>{product.priceAvailable !== false ? 'Special price' : 'Price pending'}</span></div>
      <div className="quick-view__copy"><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><div className="quick-view__price price--deal">{product.priceAvailable !== false ? <><span className="price__change">↓{product.discount}%</span><del>₹{product.originalPrice.toLocaleString('en-IN')}</del><strong>₹{product.price.toLocaleString('en-IN')}</strong></> : <strong>Price on request</strong>}</div>{product.priceAvailable !== false && <div className="quick-view__actions"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><FiMinus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><FiPlus /></button></div><button className="button button--gold" onClick={(event) => { flyProductToCart(event.currentTarget.closest('article').querySelector('img')); onAdd(product, quantity); onClose(); }}><FiShoppingBag /> Add to cart</button></div>}</div>
    </motion.article>
  </motion.div>}</AnimatePresence>;
}
