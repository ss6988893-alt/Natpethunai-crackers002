import { memo, useRef, useState } from 'react';
import { FiEye, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { burstProductSparks, flyProductToCart } from '../../utils/cartVfx';

function ProductCard({ product, onQuickView }) {
  const [quantity, setQuantity] = useState(1);
  const imageRef = useRef(null);
  const { addToCart } = useCart();
  const available = product.priceAvailable !== false;
  const add = (event) => {
    imageRef.current?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 260 });
    burstProductSparks(event.currentTarget);
    flyProductToCart(imageRef.current);
    addToCart(product, quantity);
  };
  return <article className="product-card" data-product-card data-featured={product.featured || undefined}>
    <div className="product-card__tilt">
      <button className="product-card__image" onClick={() => onQuickView(product)} aria-label={`Quick view ${product.name}`}>
        <img ref={imageRef} src={product.image} alt={product.name} loading="lazy" />
        <span>{available ? `${product.discount}% off` : 'Price pending'}</span><i><FiEye /> Quick view</i>
      </button>
      <div className="product-card__body"><p>{product.category}</p><h3>{product.name}</h3><div className="price price--deal">{available ? <><span className="price__change">↓{product.discount}%</span><del>₹{product.originalPrice.toLocaleString('en-IN')}</del><strong>₹{product.price.toLocaleString('en-IN')}</strong></> : <strong className="price-pending">Price on request</strong>}</div><div className="product-card__actions"><div className="quantity"><button disabled={!available} onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><FiMinus /></button><span>{quantity}</span><button disabled={!available} onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><FiPlus /></button></div><button className="add-button" disabled={!available} onClick={add}><FiShoppingBag /> {available ? 'Add' : 'Enquire'}</button></div></div>
    </div>
  </article>;
}

export default memo(ProductCard);
