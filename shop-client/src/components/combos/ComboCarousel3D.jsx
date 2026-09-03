import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import useEffectsMode from '../../hooks/useEffectsMode';

export default function ComboCarousel3D({ combos, onDetails, onAdd }) {
  const [active, setActive] = useState(1);
  const { reducedMotion } = useEffectsMode();
  const move = (direction) => setActive((value) => (value + direction + combos.length) % combos.length);

  return <section className="combo-showroom container-wide" aria-label="Combo packages">
    <div className="combo-showroom__heading"><div><p className="eyebrow">Four signature stages</p><h2>Choose the scale of your celebration.</h2></div><p>Swipe or use the arrows. Every package remains fully editable through its data record.</p></div>
    <div className="combo-stage" tabIndex="0" onKeyDown={(event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }} onWheel={(event) => { if (Math.abs(event.deltaX) > 12) move(event.deltaX > 0 ? 1 : -1); }}>
      <button className="stage-arrow stage-arrow--left" onClick={() => move(-1)} aria-label="Previous combo"><FiChevronLeft /></button>
      <motion.div className="combo-stage__cards" onPanEnd={(_, info) => { if (Math.abs(info.offset.x) > 50) move(info.offset.x < 0 ? 1 : -1); }}>
        {combos.map((combo, index) => {
          let offset = index - active;
          if (offset > combos.length / 2) offset -= combos.length;
          if (offset < -combos.length / 2) offset += combos.length;
          const distance = Math.abs(offset);
          return <motion.article key={combo.id} className={`combo-orbit-card ${offset === 0 ? 'is-active' : ''}`} animate={reducedMotion ? { opacity: offset === 0 ? 1 : 0 } : { x: `${offset * 76}%`, z: offset === 0 ? 100 : -180 - distance * 70, rotateY: offset * -27, scale: offset === 0 ? 1 : .76, opacity: offset === 0 ? 1 : distance === 1 ? .42 : .12, filter: `blur(${offset === 0 ? 0 : distance * 2.4}px)` }} transition={{ type: 'spring', stiffness: 155, damping: 24 }} style={{ '--accent': combo.accent, zIndex: 6 - distance, pointerEvents: distance > 1 ? 'none' : 'auto' }} onClick={() => offset !== 0 && setActive(index)}>
            <div className="combo-orbit-card__image"><img src={combo.image} alt="" /><span>Save {combo.discount}%</span></div>
            <div className="combo-orbit-card__copy"><small>{combo.productCount} included items</small><h3>{combo.name}</h3><p className="combo-price">₹{combo.price.toLocaleString('en-IN')} <del>₹{combo.originalPrice.toLocaleString('en-IN')}</del></p><ul>{combo.items.slice(0, 3).map((item) => <li key={item}><FiCheck />{item}</li>)}</ul>{offset === 0 && <div className="combo-actions"><button className="button button--glass" onClick={(event) => { event.stopPropagation(); onDetails(combo); }}>View details</button><button className="button button--gold" onClick={(event) => { event.stopPropagation(); onAdd(combo, 1); }}>Add combo</button></div>}</div>
          </motion.article>;
        })}
      </motion.div>
      <button className="stage-arrow stage-arrow--right" onClick={() => move(1)} aria-label="Next combo"><FiChevronRight /></button>
    </div>
    <div className="combo-dots">{combos.map((combo, index) => <button key={combo.id} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show ${combo.name}`} />)}</div>
  </section>;
}
