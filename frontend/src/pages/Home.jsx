import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiCheck, FiFileText, FiPackage, FiShield } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FireworksCanvas from '../components/effects/FireworksCanvas';
import { categories } from '../data/catalog';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return undefined;
    const context = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((element) => gsap.fromTo(element, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 86%' } }));
      gsap.to('.hero__art img', { yPercent: 10, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }, rootRef);
    return () => context.revert();
  }, [reducedMotion]);

  return (
    <motion.main id="main-content" ref={rootRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="hero">
        <FireworksCanvas />
        <div className="hero__aurora" aria-hidden="true" />
        <div className="container-wide hero__grid">
          <div className="hero__copy">
            <motion.p className="eyebrow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>The festival collection • 2026</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .8 }}><span>Light up</span><br />every moment.</motion.h1>
            <motion.p className="hero__lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }}>A cinematic collection of crackers and celebration combos—select your favourites, create an estimate and let our team handle the rest.</motion.p>
            <motion.div className="hero__actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }}>
              <Link className="button button--gold" to="/products">Explore crackers <FiArrowUpRight /></Link>
              <Link className="button button--glass" to="/combos">View combos</Link>
            </motion.div>
            <motion.div className="hero__trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65 }}>
              <span><FiCheck /> No online payment</span><span><FiFileText /> Instant estimate</span><span><FiShield /> Secure request</span>
            </motion.div>
          </div>
          <motion.div className="hero__art" initial={{ opacity: 0, scale: .92, rotateY: -8 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 1, delay: .2 }}>
            <img src="/assets/hero-fireworks.png" alt="Premium festive cracker assortment arranged on a deep purple background" fetchPriority="high" />
            <div className="hero__art-label"><span>Curated for families</span><strong>39 demo products</strong></div>
          </motion.div>
        </div>
      </section>

      <section className="section about" data-reveal>
        <div className="container-wide about__grid">
          <div><p className="eyebrow">About our shop</p><h2>Tradition, made effortless.</h2></div>
          <div className="about__copy"><p>Natpe Thunai brings a broad festive catalogue into one calm, guided ordering experience. Browse by category, build your cart and receive a professional estimate without making an online payment.</p><div className="mini-features"><span><FiPackage /> Safe, organised packing</span><span><FiFileText /> Downloadable estimate PDF</span></div></div>
        </div>
      </section>

      <section className="section categories-section">
        <div className="container-wide">
          <div className="section-heading" data-reveal><div><p className="eyebrow">Popular categories</p><h2>Find your kind of celebration.</h2></div><Link to="/products">Explore all <FiArrowUpRight /></Link></div>
          <div className="category-rail">
            {categories.slice(0, 8).map((category, index) => (
              <motion.div key={category.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .035 }}>
                <Link className="category-card" to={`/products?category=${category.slug}`}>
                  <span className="category-card__number">{String(index + 1).padStart(2, '0')}</span><h3>{category.name}</h3><p>{category.description}</p><FiArrowUpRight />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
