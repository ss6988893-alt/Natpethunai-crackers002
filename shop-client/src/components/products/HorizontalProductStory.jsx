import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useEffectsMode from '../../hooks/useEffectsMode';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalProductStory({ products, onQuickView }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const { full } = useEffectsMode();

  useLayoutEffect(() => {
    if (!full || !trackRef.current || products.length < 4) return undefined;
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('.story-card');
      gsap.set(cards, { scale: .84, rotateY: 8, transformPerspective: 1000 });
      gsap.to(trackRef.current, { x: () => -(trackRef.current.scrollWidth - window.innerWidth + 120), ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: () => `+=${trackRef.current.scrollWidth * .8}`, pin: true, scrub: .8, invalidateOnRefresh: true, onUpdate: (self) => { const center = window.innerWidth / 2; const momentum = gsap.utils.clamp(-1.2, 1.2, self.getVelocity() / 1800); cards.forEach((card) => { const rect = card.getBoundingClientRect(); const proximity = Math.max(0, 1 - Math.abs(rect.left + rect.width / 2 - center) / (window.innerWidth * .65)); gsap.set(card, { scale: .84 + proximity * .16, rotateY: (rect.left + rect.width / 2 < center ? 1 : -1) * (1 - proximity) * 9, rotateZ: momentum * (1 - proximity), opacity: .55 + proximity * .45 }); }); } } });
    }, sectionRef);
    return () => context.revert();
  }, [full, products]);

  if (products.length < 4) return null;
  return <section ref={sectionRef} className="horizontal-story">
    <div className="container-wide story-heading"><p className="eyebrow">A journey through light</p><h2>Explore our fireworks collection.</h2></div>
    <div ref={trackRef} className="story-track">
      {products.slice(0, 9).map((product, index) => <button className="story-card" key={product.id} onClick={() => onQuickView(product)}><span>{String(index + 1).padStart(2, '0')}</span><img src={product.image} alt="" loading="lazy" /><div><small>{product.category}</small><h3>{product.name}</h3><strong>₹{product.price.toLocaleString('en-IN')}</strong></div></button>)}
    </div>
  </section>;
}
