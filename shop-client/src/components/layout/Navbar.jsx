import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight, FiPhone, FiShoppingBag } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import '../../styles/mobile-navigation.css';

const links = [['/', 'Home'], ['/products', 'Products'], ['/combos', 'Combos'], ['/contact', 'Contact']];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { getCartCount, cartPulse } = useCart();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const close = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container-wide">
        <Link to="/" className="brand" aria-label="Natpe Thunai Crackers home">
          <span className="brand__mark brand__mark--image" aria-hidden="true"><img src="/assets/shop-logo.webp" alt="" /></span>
          <span><strong>Natpe Thunai</strong><small>Crackers</small></span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        </nav>
        <div className="nav-actions">
          <a className="nav-phone" href="tel:+916381149143" aria-label="Call Natpe Thunai Crackers"><FiPhone /><span>63811 49143</span></a>
          <motion.div key={cartPulse} animate={{ scale: [1, 1.16, 1] }} transition={{ duration: .32 }}>
            <Link className="cart-link" to="/cart" aria-label={`Cart with ${getCartCount()} items`}>
              <FiShoppingBag /><span>{getCartCount()}</span>
            </Link>
          </motion.div>
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close menu' : 'Open menu'}>
            <span className="menu-button__symbol" aria-hidden="true"><i /><i /><i /><i /></span><span className="menu-button__label">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-navigation" className="mobile-nav" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} aria-label="Mobile navigation">
            <p className="mobile-nav__eyebrow">A little spark. A big celebration.</p>
            {links.map(([to, label], index) => <motion.div key={to} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .05 }}><NavLink to={to} end={to === '/'} onClick={() => setOpen(false)}><small>0{index + 1}</small><span>{label}</span><FiArrowUpRight /></NavLink></motion.div>)}
            <a className="mobile-nav__call" href="tel:+916381149143"><FiPhone /> Let's plan your celebration <span>63811 49143</span></a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
