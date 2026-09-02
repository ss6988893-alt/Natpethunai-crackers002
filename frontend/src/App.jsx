import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Combos = lazy(() => import('./pages/Combos'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Contact = lazy(() => import('./pages/Contact'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return <div className="page-loader" role="status"><span /><p>Preparing the celebration…</p></div>;
}

export default function App() {
  const location = useLocation();
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/success" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
