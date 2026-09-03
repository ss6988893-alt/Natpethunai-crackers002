import { memo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { flyProductToCart } from '../../utils/cartVfx';

function ProductCard({ product, onQuickView }) {
  const [quantity, setQuantity] = useState(1);
  const tiltRef = useRef(null);
  const imageRef = useRef(null);
  const { addToCart } = useCart();
  const handleMove = (event) => {
    if (!tiltRef.current || !window.matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    tiltRef.current.style.transform = `rotateX(${-y * 12}deg) rotateY(${x * 14}deg)`;
    tiltRef.current.style.setProperty('--glow-x', `${(x + .5) * 100}%`);
    tiltRef.current.style.setProperty('--glow-y', `${(y + .5) * 100}%`);
  };
  const resetTilt = () => { if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'; };
  const add = () => {
    imageRef.current?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 260 });
    flyProductToCart(imageRef.current);
    addToCart(product, quantity);
  };
  return <motion.article className="product-card" data-product-card data-featured={product.featured || undefined} layoutId={`product-${product.id}`}>
    <div ref={tiltRef} className="product-card__tilt" onMouseMove={handleMove} onMouseLeave={resetTilt}>
      <button className="product-card__image" onClick={() => onQuickView(product)} aria-label={`Quick view ${product.name}`}>
        <motion.img ref={imageRef} layoutId={`product-image-${product.id}`} src={product.image} alt={product.name} loading="lazy" />
        <span>-{product.discount}%</span><i><FiEye /> Quick view</i>
      </button>
      <div className="product-card__body"><p>{product.category}</p><h3>{product.name}</h3><div className="price"><strong>₹{product.price.toLocaleString('en-IN')}</strong><del>₹{product.originalPrice.toLocaleString('en-IN')}</del></div><div className="product-card__actions"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><FiMinus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><FiPlus /></button></div><button className="add-button" onClick={add}><FiShoppingBag /> Add</button></div></div>
    </div>
  </motion.article>;
}

export default memo(ProductCard);
