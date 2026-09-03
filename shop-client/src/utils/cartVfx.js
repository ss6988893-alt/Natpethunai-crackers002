export function flyProductToCart(imageElement) {
  if (!imageElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = document.querySelector('.cart-link');
  if (!target) return;
  const start = imageElement.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const flyer = imageElement.cloneNode(true);
  flyer.className = 'cart-flyer';
  Object.assign(flyer.style, { left: `${start.left}px`, top: `${start.top}px`, width: `${start.width}px`, height: `${start.height}px` });
  document.body.appendChild(flyer);
  const x = end.left + end.width / 2 - start.left - start.width / 2;
  const y = end.top + end.height / 2 - start.top - start.height / 2;
  const animation = flyer.animate([
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 0 },
    { transform: `translate3d(${x * .55}px,${y * .25 - 70}px,0) scale(.55) rotate(8deg)`, opacity: .92, offset: .55 },
    { transform: `translate3d(${x}px,${y}px,0) scale(.08) rotate(18deg)`, opacity: .15, offset: 1 },
  ], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
  animation.onfinish = () => {
    flyer.remove();
    target.classList.add('cart-link--spark');
    window.setTimeout(() => target.classList.remove('cart-link--spark'), 300);
  };
}
