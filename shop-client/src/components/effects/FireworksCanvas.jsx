import { useEffect, useRef } from 'react';

export default function FireworksCanvas({ celebration = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    let frame; let particles = []; let lastBurst = 0;
    const resize = () => { const ratio = Math.min(devicePixelRatio || 1, 1.5); canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio; context.setTransform(ratio, 0, 0, ratio, 0, 0); };
    const burst = () => {
      const x = innerWidth * (.2 + Math.random() * .65); const y = innerHeight * (.12 + Math.random() * .38);
      const count = innerWidth < 768 ? 18 : celebration ? 55 : 34;
      const hue = [28, 44, 264, 165][Math.floor(Math.random() * 4)];
      particles.push(...Array.from({ length: count }, (_, index) => { const angle = (Math.PI * 2 * index) / count; const speed = 1.2 + Math.random() * 2.8; return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: .75 + Math.random() * .25, hue, size: .8 + Math.random() * 1.8 }; }));
    };
    const draw = (time) => {
      context.clearRect(0, 0, innerWidth, innerHeight);
      if (time - lastBurst > (celebration ? 650 : 1600)) { burst(); lastBurst = time; }
      particles = particles.filter((particle) => particle.alpha > .025);
      particles.forEach((particle) => {
        particle.x += particle.vx; particle.y += particle.vy; particle.vy += .018; particle.vx *= .992; particle.alpha *= .976;
        context.beginPath(); context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); context.fillStyle = `hsla(${particle.hue} 95% 65% / ${particle.alpha})`; context.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    resize(); addEventListener('resize', resize); frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); removeEventListener('resize', resize); };
  }, [celebration]);
  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
