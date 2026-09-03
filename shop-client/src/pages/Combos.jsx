import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import ComboCarousel3D from '../components/combos/ComboCarousel3D';
import PageIntro from '../components/layout/PageIntro';
import { combos } from '../data/catalog';
import { useCart } from '../context/CartContext';

export default function Combos() {
  const [active, setActive] = useState(null);
  const { addToCart } = useCart();
  return <main id="main-content" className="combos-page">
    <PageIntro eyebrow="Immersive combo collection" title="One box. A complete celebration." copy="Four curated packages rotate through a cinematic 3D stage. Choose the size that fits your festival." />
    <ComboCarousel3D combos={combos} onDetails={setActive} onAdd={addToCart} />
    <AnimatePresence>{active && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setActive(null)}><motion.div role="dialog" aria-modal="true" className="combo-modal" initial={{ scale: .9, y: 30 }} animate={{ scale: 1, y: 0 }} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setActive(null)} aria-label="Close combo details"><FiX /></button><p className="eyebrow">₹{active.price.toLocaleString('en-IN')} combo</p><h2>{active.name}</h2><p>{active.description}</p><ul>{active.items.map((item) => <li key={item}><FiCheck />{item}</li>)}</ul><button className="button button--gold" onClick={() => { addToCart(active, 1); setActive(null); }}>Add combo to cart</button></motion.div></motion.div>}</AnimatePresence>
  </main>;
}
