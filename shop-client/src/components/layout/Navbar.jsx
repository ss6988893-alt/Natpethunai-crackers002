import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiPhone, FiShoppingBag, FiX } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

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
          <a className="nav-phone" href="tel:+918524090862" aria-label="Call Natpe Thunai Crackers"><FiPhone /><span>85240 90862</span></a>
          <motion.div key={cartPulse} animate={{ scale: [1, 1.16, 1] }} transition={{ duration: .32 }}>
            <Link className="cart-link" to="/cart" aria-label={`Cart with ${getCartCount()} items`}>
              <FiShoppingBag /><span>{getCartCount()}</span>
            </Link>
          </motion.div>
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-navigation" className="mobile-nav" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} aria-label="Mobile navigation">
            {links.map(([to, label], index) => <motion.div key={to} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .05 }}><NavLink to={to} onClick={() => setOpen(false)}>{label}</NavLink></motion.div>)}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
