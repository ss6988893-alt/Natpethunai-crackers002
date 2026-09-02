# Natpe Thunai Crackers — Production Architecture

## Runtime topology

- `frontend/`: Vite + React JavaScript SPA. React Router owns public routes, CartContext owns device-local cart state, and REST services communicate with the API.
- `backend/`: Node.js + Express REST service. MongoDB is authoritative for products, categories, combos, orders and enquiries. Nodemailer sends transactional mail; PDFKit generates estimate PDFs.
- The frontend and backend deploy independently. The frontend can use static/edge hosting; Express requires a Node host and MongoDB Atlas (or another MongoDB server).

## Frontend route map

| Route | Responsibility |
| --- | --- |
| `/` | Cinematic brand story, categories, features, popular products and combos |
| `/products` | Search, category filters, sorting, pagination and product quick view |
| `/products/:slug` | SEO-ready product detail route |
| `/combos` | Editable combo offers and included-item details |
| `/cart` | Persistent quantities, removals, totals and estimate preview |
| `/checkout` | Validated customer details and order review; no payment UI |
| `/order-success/:orderId` | Order confirmation, PDF download and WhatsApp handoff |
| `/contact` | Shop details, map and enquiry form |
| `*` | Accessible 404 experience |

## State and data flow

- CartContext exposes `addToCart`, `removeFromCart`, `increaseQuantity`, `decreaseQuantity`, `clearCart`, `getTotal` and `getCartCount`.
- Cart state is versioned and persisted in localStorage because it is a temporary device-local draft. Orders are persisted only after server acceptance.
- Products, categories and combos come from REST endpoints. Demo data is used automatically when the API is unavailable so design review remains possible.
- Checkout posts a normalized cart snapshot and customer payload. The backend recalculates all prices from MongoDB; client totals are never trusted.

## MongoDB model boundaries

- Product: catalog identity, slug, category relation, content, imagery, MRP/selling price, discount, stock status and merchandising flags.
- Category: editable taxonomy with slug, image, description and display order.
- Combo: editable name, pricing and item array containing product relation, quantity and display label.
- Order: generated sequential ID, normalized customer record, immutable priced item snapshots, totals, status and timestamps.
- ContactEnquiry: normalized contact fields, status and timestamps.

## REST API

- `GET /api/products`, `GET /api/products/:idOrSlug`
- `GET /api/categories`
- `GET /api/combos`, `GET /api/combos/:idOrSlug`
- `POST /api/orders`, `GET /api/orders/:orderId`, `GET /api/orders/:orderId/pdf`
- `POST /api/estimate` for a non-persisted current-cart PDF
- `POST /api/contact`
- `GET /api/health`

All write routes use Zod validation, request-size limits, sanitization, rate limiting and centralized error responses. Order IDs are allocated atomically using a MongoDB counter document.

## Animation strategy

- Framer Motion: route transitions, navigation, modal/cart feedback, card entrances and reduced-motion fallbacks.
- GSAP ScrollTrigger: a small number of section-level reveals, hero parallax and desktop-only horizontal category movement.
- Canvas: a capped, device-aware firework field confined behind the hero and success content. It pauses when hidden and respects `prefers-reduced-motion`.
- CSS: inexpensive glow, shimmer and glass effects. Transform/opacity are preferred; filters and large blurs are kept static on mobile.

## Responsive and accessibility strategy

- Content-first layouts from 320px upward, one product column at 320px and two when space permits.
- Touch targets are at least 44px. Mobile filters scroll horizontally without page overflow.
- Focus-visible states, semantic landmarks, labelled dialogs/forms, live regions and Escape handling are mandatory.
- Motion intensity and particle counts reduce below 768px and switch off for reduced-motion users.

## Security and operations

- Secrets exist only in `backend/.env`; the committed `.env.example` contains names, never credentials.
- CORS is allowlisted, Helmet sets browser protections, rate limits protect public writes, and Mongo-backed prices prevent cart tampering.
- SMTP failure does not lose a successfully stored order; the API reports the order and logs mail delivery for retry.
- PDF responses are generated from stored snapshots and include a prominent estimate-only disclaimer.
