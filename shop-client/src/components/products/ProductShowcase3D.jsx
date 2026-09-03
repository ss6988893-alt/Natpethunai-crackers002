import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useEffectsMode from '../../hooks/useEffectsMode';
import { flyProductToCart } from '../../utils/cartVfx';

gsap.registerPlugin(ScrollTrigger);

export default function ProductShowcase3D({ products, onAdd, onQuickView }) {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const { full, reducedMotion } = useEffectsMode();
  const items = products.slice(0, 7);
  const move = (direction) => setActive((value) => (value + direction + items.length) % items.length);

  useEffect(() => setActive(0), [products]);
  useEffect(() => {
    if (!full || items.length < 2) return undefined;
    const trigger = ScrollTrigger.create({ trigger: sectionRef.current, start: 'top top+=72', end: `+=${items.length * 330}`, pin: true, scrub: .65, anticipatePin: 1, onUpdate: (self) => setActive(Math.min(items.length - 1, Math.round(self.progress * (items.length - 1)))) });
    return () => trigger.kill();
  }, [full, items.length]);

  if (!items.length) return null;
  return <section ref={sectionRef} className="product-showcase" aria-label="Featured product 3D showcase">
    <div className="showcase-light" aria-hidden="true" />
    <div className="container-wide showcase-heading"><div><p className="eyebrow">Scroll-driven showcase</p><h2>Featured in the spotlight.</h2></div><p>Scroll, drag or use the arrows to move through the stage.</p></div>
    <div className="showcase-stage" tabIndex="0" onWheel={(event) => { if (!full && Math.abs(event.deltaY) > 8) move(event.deltaY > 0 ? 1 : -1); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }}>
      <button className="stage-arrow stage-arrow--left" onClick={() => move(-1)} aria-label="Previous featured product"><FiChevronLeft /></button>
      <motion.div className="showcase-stage__cards" onPanEnd={(_, info) => { if (Math.abs(info.offset.x) > 45) move(info.offset.x < 0 ? 1 : -1); }}>
        {items.map((product, index) => {
          const offset = index - active;
          const distance = Math.abs(offset);
          const hidden = distance > 2;
          return <motion.article key={product.id} className={`showcase-product ${offset === 0 ? 'is-active' : ''}`} animate={reducedMotion ? { opacity: offset === 0 ? 1 : 0 } : { x: `${offset * 76}%`, z: offset === 0 ? 90 : -180 - distance * 80, rotateY: offset * -22, scale: offset === 0 ? 1 : .76, opacity: hidden ? 0 : offset === 0 ? 1 : .38, filter: `blur(${offset === 0 ? 0 : distance * 3}px)` }} transition={{ type: 'spring', stiffness: 145, damping: 23 }} style={{ pointerEvents: hidden ? 'none' : 'auto', zIndex: 8 - distance }} onClick={() => offset !== 0 && setActive(index)}>
            <button className="showcase-product__visual" onClick={() => offset === 0 && onQuickView(product)} aria-label={`Quick view ${product.name}`}><img src={product.image} alt={product.name} /><span>PDF price + 70%</span></button>
            <div className="showcase-product__copy"><p>{product.category}</p><h3>{product.name}</h3><strong>₹{product.price.toLocaleString('en-IN')}</strong>{offset === 0 && <button onClick={(event) => { event.stopPropagation(); flyProductToCart(event.currentTarget.closest('article').querySelector('img')); onAdd(product, 1); }}><FiPlus /> Add to cart</button>}</div>
          </motion.article>;
        })}
      </motion.div>
      <button className="stage-arrow stage-arrow--right" onClick={() => move(1)} aria-label="Next featured product"><FiChevronRight /></button>
    </div>
    <div className="showcase-progress" aria-label={`${active + 1} of ${items.length}`}><span style={{ width: `${((active + 1) / items.length) * 100}%` }} /></div>
  </section>;
}
