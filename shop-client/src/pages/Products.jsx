import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import PageIntro from '../components/layout/PageIntro';
import ProductQuickView from '../components/products/ProductQuickView';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { categories, products } from '../data/catalog';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [quickView, setQuickView] = useState(null);
  const { addToCart } = useCart();
  const category = params.get('category') || 'all';
  const visible = useMemo(() => products.filter((product) => (category === 'all' || product.categorySlug === category) && (`${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => { if (a.priceAvailable !== b.priceAvailable) return a.priceAvailable ? -1 : 1; return sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : Number(b.featured) - Number(a.featured); }), [category, search, sort]);
  const groupedProducts = useMemo(() => categories
    .map((item) => ({ ...item, products: visible.filter((product) => product.categorySlug === item.slug) }))
    .filter((item) => item.products.length > 0), [visible]);
  const chooseCategory = (slug) => setParams(slug === 'all' ? {} : { category: slug });

  return <main id="main-content" className="products-page">
    <PageIntro eyebrow="120 products from your PDF" title="Find your favourites." copy="The bold selling price is the exact amount listed in your supplied PDF. Blank PDF prices are clearly marked for enquiry." />
    <section className="catalog-controls container-wide">
      <div className="catalog__toolbar"><label className="search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crackers or categories" aria-label="Search products" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
      <div className="filter-row" aria-label="Product categories">
        <button className={category === 'all' ? 'active' : ''} onClick={() => chooseCategory('all')}>All products</button>
        {categories.map((item) => <button key={item.slug} className={category === item.slug ? 'active' : ''} onClick={() => chooseCategory(item.slug)}>{item.name}</button>)}
      </div>
    </section>
    <div className="product-scene">
      <section className="catalog category-catalog container-wide">
        <div className="catalog__meta"><div><p className="eyebrow">The complete shelf</p><strong>{visible.length} products</strong></div><span>{groupedProducts.length} {groupedProducts.length === 1 ? 'category' : 'categories'}</span></div>
        {groupedProducts.length ? <div className="category-product-groups">{groupedProducts.map((group, index) => <section className="product-category-group" id={`category-${group.slug}`} key={group.slug}>
          <header className="product-category-heading">
            <span className="product-category-heading__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div><p className="eyebrow">Category</p><h2>{group.name}</h2><p>{group.description}</p></div>
            <strong>{group.products.length} {group.products.length === 1 ? 'product' : 'products'}</strong>
          </header>
          <div className="product-grid">{group.products.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickView} />)}</div>
        </section>)}</div> : <div className="empty-state"><h2>No fireworks found</h2><p>Try another product name or collection.</p></div>}
      </section>
    </div>
    <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />
  </main>;
}
