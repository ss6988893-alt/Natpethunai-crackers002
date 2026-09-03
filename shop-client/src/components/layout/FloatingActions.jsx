import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUp, FiMessageCircle } from 'react-icons/fi';

const ownerPhone = '918524090862';
const message = encodeURIComponent('Hi, I visited your website and I would like to enquire about crackers.');

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="floating-actions" aria-label="Quick actions">
    <motion.a className="float-button float-button--whatsapp" href={`https://wa.me/${ownerPhone}?text=${message}`} target="_blank" rel="noreferrer" aria-label="Chat with Natpe Thunai Crackers on WhatsApp" whileHover={{ scale: 1.08 }} whileTap={{ scale: .94 }}><FiMessageCircle /><span>WhatsApp</span></motion.a>
    <AnimatePresence>{showTop && <motion.button className="float-button float-button--top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} initial={{ opacity: 0, y: 18, scale: .8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .8 }}><FiArrowUp /></motion.button>}</AnimatePresence>
  </div>;
}
