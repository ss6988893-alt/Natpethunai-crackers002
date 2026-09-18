import { useEffect, useMemo, useRef, useState } from 'react';
import { FiSearch, FiGrid, FiChevronDown } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import PageIntro from '../components/layout/PageIntro';
import ProductQuickView from '../components/products/ProductQuickView';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { getCategories, getProducts } from '../services/api';
import '../styles/catalog-browsing.css';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('low');
  const [quickView, setQuickView] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const resultsRef = useRef(null);
  const scrollRequested = useRef(false);
  const { addToCart } = useCart();
  const category = params.get('category') || 'all';
  useEffect(() => { Promise.all([getProducts({ limit: 250 }), getCategories()]).then(([productResult, categoryResult]) => { setProducts(productResult.data); setCategories(categoryResult.data); }).finally(() => setLoading(false)); }, []);
  const matchingProducts = useMemo(() => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => { if ((a.priceAvailable !== false) !== (b.priceAvailable !== false)) return a.priceAvailable !== false ? -1 : 1; return sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : Number(Boolean(b.featured)) - Number(Boolean(a.featured)); }), [products, search, sort]);
  const visible = useMemo(() => matchingProducts.filter((product) => category === 'all' || product.categorySlug === category), [matchingProducts, category]);
  const selectedCategory = categories.find((item) => item.slug === category);
  const categoryCounts = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => counts.set(product.categorySlug, (counts.get(product.categorySlug) || 0) + 1));
    return counts;
  }, [products]);
  const exploreProducts = useMemo(() => {
    if (category === 'all') return [];
    const groups = new Map();
    matchingProducts.forEach((product) => {
      if (product.categorySlug === category) return;
      if (!groups.has(product.categorySlug)) groups.set(product.categorySlug, []);
      groups.get(product.categorySlug).push(product);
    });
    // Round-robin suggestions keep the first row diverse without random reshuffling.
    const mixed = [];
    for (let index = 0; mixed.length < 9; index += 1) {
      let added = false;
      for (const group of groups.values()) {
        if (group[index]) { mixed.push(group[index]); added = true; }
        if (mixed.length === 9) break;
      }
      if (!added) break;
    }
    return mixed;
  }, [matchingProducts, category]);
  const groupedProducts = useMemo(() => categories
    .map((item) => ({ ...item, products: visible.filter((product) => product.categorySlug === item.slug) }))
    .filter((item) => item.products.length > 0), [categories, visible]);
  const chooseCategory = (slug) => {
    setCategoriesOpen(false);
    if (slug === category) return;
    scrollRequested.current = true;
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (slug === 'all') next.delete('category'); else next.set('category', slug);
      return next;
    });
  };
  useEffect(() => {
    if (!scrollRequested.current) return;
    scrollRequested.current = false;
    const top = resultsRef.current?.getBoundingClientRect().top;
    if (top < 96 || top > window.innerHeight * 0.6) {
      resultsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }, [category]);

  return <main id="main-content" className="products-page">
    <PageIntro eyebrow="Our complete collection" title="Find your favourites." copy="Explore every category, compare prices and add your favourite crackers to the cart." />
    <div className="product-scene">
      <section className="products-layout container-wide">
        <aside className={`category-sidebar ${categoriesOpen ? 'category-sidebar--open' : ''}`} aria-label="Product categories">
          <button className="category-picker" aria-expanded={categoriesOpen} aria-controls="category-options" onClick={() => setCategoriesOpen((value) => !value)}>
            <span className="category-picker__icon"><FiGrid /></span>
            <span className="category-picker__copy"><small>Find your celebration</small><strong>{category === 'all' ? 'All crackers' : selectedCategory?.name || 'Choose a category'}</strong></span>
            <span className="category-picker__action">Browse <FiChevronDown /></span>
          </button>
          <p className="eyebrow">Browse categories</p>
          <nav className="filter-row" id="category-options">
            <button aria-pressed={category === 'all'} className={category === 'all' ? 'active' : ''} onClick={() => chooseCategory('all')}>All products <span>{products.length}</span></button>
            {categories.map((item) => <button key={item.slug} aria-pressed={category === item.slug} className={category === item.slug ? 'active' : ''} onClick={() => chooseCategory(item.slug)}>{item.name} <span>{categoryCounts.get(item.slug) || 0}</span></button>)}
          </nav>
        </aside>
        <div className="products-content" ref={resultsRef}>
          <div className="catalog-controls">
            <div className="catalog__toolbar"><label className="search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crackers or categories" aria-label="Search products" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
          </div>
          <section className="catalog category-catalog">
        {loading && <div className="product-grid" aria-label="Loading products">{Array.from({ length: 8 }, (_, i) => <div className="product-skeleton" key={i}/>)}</div>}
        {!loading && <><div className="catalog__meta" role="status"><div><p className="eyebrow">{category === 'all' ? 'The complete shelf' : 'Selected collection'}</p><strong>{visible.length} products</strong></div><span>{groupedProducts.length} {groupedProducts.length === 1 ? 'category' : 'categories'}</span></div>
        <div className="catalog-results" key={category}>
        {category !== 'all' ? <section className="product-category-group" aria-labelledby="selected-category-title">
          <header className="product-category-heading"><span className="product-category-heading__number" aria-hidden="true">01</span><div><p className="eyebrow">Category</p><h2 id="selected-category-title">{selectedCategory?.name || visible[0]?.category || 'Selected category'}</h2>{selectedCategory?.description && <p>{selectedCategory.description}</p>}</div></header>
          {visible.length ? <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div> : <div className="empty-state"><h3>{search.trim() ? 'No matching products in this category.' : 'No products available in this category.'}</h3><p>Try another search or explore the other collections below.</p></div>}
        </section> : groupedProducts.length ? <div className="category-product-groups">{groupedProducts.map((group, index) => <section className="product-category-group" id={`category-${group.slug}`} key={group.slug}>
          <header className="product-category-heading">
            <span className="product-category-heading__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div><p className="eyebrow">Category</p><h2>{group.name}</h2><p>{group.description}</p></div>
            <strong>{group.products.length} {group.products.length === 1 ? 'product' : 'products'}</strong>
          </header>
          <div className="product-grid">{group.products.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div>
        </section>)}</div> : <div className="empty-state"><h2>No fireworks found</h2><p>Try another product name or collection.</p></div>}
        {category !== 'all' && <section className="catalog-explore" aria-labelledby="explore-title">
          <header className="product-category-heading"><span className="product-category-heading__number" aria-hidden="true">✦</span><div><p className="eyebrow">Discover another favourite</p><h2 id="explore-title">Explore More Crackers</h2><p>{search.trim() ? 'More matches from other categories.' : 'A little inspiration from our other collections.'}</p></div></header>
          {exploreProducts.length ? <div className="product-grid">{exploreProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div> : <p className="empty-state">{search.trim() ? 'No matches in other categories. Try a different search.' : 'No other products available right now.'}</p>}
          <button className="button button--gold load-more" onClick={() => chooseCategory('all')}>View all crackers</button>
        </section>}
        </div></>}
      </section>
        </div>
      </section>
    </div>
    <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />
  </main>;
}
