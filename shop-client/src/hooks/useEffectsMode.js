import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function useEffectsMode() {
  const reducedMotion = useReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px) and (pointer: fine)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return { desktop, reducedMotion: Boolean(reducedMotion), full: desktop && !reducedMotion };
}
