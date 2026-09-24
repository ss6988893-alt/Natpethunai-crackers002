import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPause, FiPlay } from 'react-icons/fi';
import { getProducts } from '../../services/api';
import '../../styles/home-product-marquee.css';

export default function HomeProductMarquee() {
  const [products, setProducts] = useState([]);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    let active = true;
    getProducts({ limit: 250 }).then(({ data }) => {
      const groups = new Map();
      data.forEach((product) => {
        const image = [product.image, ...(product.images || [])].find((value) => value && !/hero-fireworks|shop-logo|placeholder/i.test(value));
        if (!image) return;
        const key = product.categorySlug || product.category;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ ...product, image });
      });
      const selected = [];
      while (selected.length < 12 && groups.size) {
        for (const [key, group] of groups) {
          selected.push(group.shift());
          if (!group.length) groups.delete(key);
          if (selected.length === 12) break;
        }
      }
      if (active) setProducts(selected);
    });
    return () => { active = false; };
  }, []);

  if (!products.length) return null;
  return <section className="home-marquee" aria-labelledby="home-marquee-title">
    <div className="container-wide home-marquee__heading">
      <div><p className="eyebrow">A glimpse of the collection</p><h2 id="home-marquee-title">Pick your next spark.</h2></div>
      <button className="home-marquee__pause" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play product scrolling' : 'Pause product scrolling'} aria-pressed={paused}>{paused ? <FiPlay /> : <FiPause />}<span>{paused ? 'Play' : 'Pause'}</span></button>
    </div>
    <div className={`home-marquee__viewport ${paused ? 'is-paused' : ''}`}>
      <div className="home-marquee__track">
        {[false, true].map((duplicate) => <div className="home-marquee__group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
          {products.map((product) => <Link key={product.id || product._id} className="home-marquee__card" to={`/products?category=${encodeURIComponent(product.categorySlug || '')}`} tabIndex={duplicate ? -1 : undefined}>
            <img src={product.image} alt={duplicate ? '' : product.name} loading="lazy" decoding="async" />
            <div><small>{product.category}</small><h3>{product.name}</h3></div>
          </Link>)}
        </div>)}
      </div>
    </div>
  </section>;
}
