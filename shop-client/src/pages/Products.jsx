import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageIntro from '../components/layout/PageIntro';
import CategoryCarousel3D from '../components/products/CategoryCarousel3D';
import HorizontalProductStory from '../components/products/HorizontalProductStory';
import ProductQuickView from '../components/products/ProductQuickView';
import ProductShowcase3D from '../components/products/ProductShowcase3D';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { categories, products } from '../data/catalog';
import useEffectsMode from '../hooks/useEffectsMode';

gsap.registerPlugin(ScrollTrigger);

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [limit, setLimit] = useState(12);
  const [quickView, setQuickView] = useState(null);
  const gridRef = useRef(null);
  const { addToCart } = useCart();
  const { full, reducedMotion } = useEffectsMode();
  const category = params.get('category') || 'all';
  const categoryIndex = Math.max(0, categories.findIndex((item) => item.slug === category));
  const visible = useMemo(() => products.filter((product) => (category === 'all' || product.categorySlug === category) && (`${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => { if (a.priceAvailable !== b.priceAvailable) return a.priceAvailable ? -1 : 1; return sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : Number(b.featured) - Number(a.featured); }), [category, search, sort]);
  const availableProducts = useMemo(() => visible.filter((product) => product.priceAvailable), [visible]);
  const showcaseProducts = useMemo(() => [...availableProducts.filter((product) => product.featured), ...availableProducts.filter((product) => !product.featured)].slice(0, 7), [availableProducts]);
  const chooseCategory = (slug) => { setParams(slug === 'all' ? {} : { category: slug }); setLimit(12); };

  useLayoutEffect(() => {
    if (!gridRef.current || reducedMotion) return undefined;
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('[data-product-card]');
      gsap.fromTo(cards, { y: full ? 120 : 55, z: full ? -220 : 0, rotateX: full ? 15 : 0, scale: full ? .84 : .94, opacity: 0, filter: full ? 'blur(10px)' : 'blur(3px)' }, { y: 0, z: 0, rotateX: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: .95, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: gridRef.current, start: 'top 86%', once: true } });
    }, gridRef);
    return () => context.revert();
  }, [category, search, sort, limit, full, reducedMotion]);

  return <motion.main id="main-content" className="products-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <PageIntro eyebrow="120 products from your PDF" title="Find your favourites." copy="Every available website price is calculated from the supplied PDF price plus 70%. Blank PDF prices are clearly marked for enquiry." />
    <section className="catalog-controls container-wide">
      <div className="catalog__toolbar"><label className="search"><FiSearch /><input value={search} onChange={(event) => { setSearch(event.target.value); setLimit(12); }} placeholder="Search crackers or categories" aria-label="Search products" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
      <CategoryCarousel3D value={category} onChange={chooseCategory} />
    </section>
    <motion.div key={category} className="product-scene" initial={{ opacity: .3 }} animate={{ opacity: 1 }} transition={{ duration: .65 }} style={{ '--scene-hue': `${categoryIndex * 24 + 18}deg` }}>
      <ProductShowcase3D products={showcaseProducts} onAdd={addToCart} onQuickView={setQuickView} />
      <HorizontalProductStory products={availableProducts} onQuickView={setQuickView} />
      <section className="catalog container-wide" ref={gridRef}>
        <div className="catalog__meta"><div><p className="eyebrow">The complete shelf</p><strong>{visible.length} products</strong></div><span>Showing {Math.min(limit, visible.length)}</span></div>
        {visible.length ? <div className="product-grid">{visible.slice(0, limit).map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div> : <div className="empty-state"><h2>No fireworks found</h2><p>Try another product name or collection.</p></div>}
        {limit < visible.length && <button className="button button--glass load-more" onClick={() => setLimit((value) => value + 12)}>Load more</button>}
      </section>
    </motion.div>
    <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />
  </motion.main>;
}
