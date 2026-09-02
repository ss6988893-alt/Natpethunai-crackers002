import { motion } from 'framer-motion';

export default function PageIntro({ eyebrow, title, copy }) {
  return <section className="page-intro"><motion.div className="container-wide" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p>{copy}</p>}</motion.div></section>;
}
