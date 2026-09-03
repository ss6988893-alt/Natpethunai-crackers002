import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { categories } from '../../data/catalog';
import useEffectsMode from '../../hooks/useEffectsMode';

const allCategories = [{ slug: 'all', name: 'All fireworks', description: 'The complete collection' }, ...categories];

export default function CategoryCarousel3D({ value, onChange }) {
  const active = Math.max(0, allCategories.findIndex((item) => item.slug === value));
  const { reducedMotion } = useEffectsMode();
  const move = (direction) => onChange(allCategories[(active + direction + allCategories.length) % allCategories.length].slug);

  return <section className="category-showroom" aria-label="Product categories">
    <div className="showroom-kicker"><span>01</span><p>Choose a collection</p></div>
    <div className="category-stage" tabIndex="0" onKeyDown={(event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }}>
      <button className="stage-arrow stage-arrow--left" onClick={() => move(-1)} aria-label="Previous category"><FiChevronLeft /></button>
      <motion.div className="category-stage__cards" onPanEnd={(_, info) => { if (Math.abs(info.offset.x) > 45) move(info.offset.x < 0 ? 1 : -1); }}>
        {allCategories.map((item, index) => {
          let offset = index - active;
          if (offset > allCategories.length / 2) offset -= allCategories.length;
          if (offset < -allCategories.length / 2) offset += allCategories.length;
          const distance = Math.abs(offset);
          const hidden = distance > 2;
          return <motion.button key={item.slug} className={`category-orbit-card ${offset === 0 ? 'is-active' : ''}`} onClick={() => onChange(item.slug)} aria-pressed={offset === 0} animate={reducedMotion ? { opacity: offset === 0 ? 1 : 0 } : { x: `${offset * 72}%`, z: offset === 0 ? 60 : -distance * 95, rotateY: offset * -15, scale: offset === 0 ? 1 : distance === 1 ? .88 : .76, opacity: hidden ? 0 : offset === 0 ? 1 : distance === 1 ? .64 : .28, filter: `blur(${offset === 0 ? 0 : distance * 1.6}px)` }} transition={{ type: 'spring', stiffness: 190, damping: 24 }} style={{ pointerEvents: hidden ? 'none' : 'auto', zIndex: 5 - distance }}>
            <small>{String(index + 1).padStart(2, '0')}</small><strong>{item.name}</strong><span>{item.description}</span>
          </motion.button>;
        })}
      </motion.div>
      <button className="stage-arrow stage-arrow--right" onClick={() => move(1)} aria-label="Next category"><FiChevronRight /></button>
    </div>
  </section>;
}
