import { ArrowUpRight, Check, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { ShopCollections } from './shop-collections';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="bg-primary px-5 py-2 text-center text-xs font-semibold tracking-[0.14em] text-primary-foreground uppercase">
        Festive season bookings are now open
      </div>

      <header className="relative z-20 border-b border-[#382018]/10 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Natpe Thunai Crackers home">
            <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/25%)]">
              <Sparkles className="size-5" />
            </span>
            <span>
              <span className="block font-heading text-[1.05rem] font-bold leading-none tracking-[-0.02em]">Natpe Thunai</span>
              <span className="mt-1 block text-[0.62rem] font-bold tracking-[0.22em] text-muted-foreground uppercase">Crackers</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="Primary navigation">
            <a className="transition-colors hover:text-primary" href="#collections">Collections</a>
            <a className="transition-colors hover:text-primary" href="#why-us">Why us</a>
            <a className="transition-colors hover:text-primary" href="#contact">Contact</a>
          </nav>

          <a className="rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-transform hover:-translate-y-0.5" href="#collections">
            Shop combos
          </a>
        </div>
      </header>

      <section id="top" className="relative isolate">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_76%_16%,#ffd967_0,transparent_24%),radial-gradient(circle_at_8%_68%,#ef6a3820_0,transparent_28%)]" />
        <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#382018]/10 bg-white/65 px-3 py-2 text-xs font-bold text-[#734526] shadow-sm">
              <span className="grid size-6 place-items-center rounded-full bg-[#fff0c1]"><Check className="size-3.5" /></span>
              Curated combos • Friendly service • Festive ready
            </div>
            <p className="mb-4 text-sm font-black tracking-[0.18em] text-primary uppercase">Celebrate brighter, together</p>
            <h1 className="max-w-[760px] font-heading text-[clamp(3.4rem,8vw,6.7rem)] font-bold leading-[0.88] tracking-[-0.065em]">
              Big smiles.<br />Bright nights.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              Thoughtfully selected crackers and value-packed combos for every family celebration—packed with care and delivered with friendship.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a className="group inline-flex h-13 items-center gap-3 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_12px_30px_rgb(189_50_25/22%)] transition-transform hover:-translate-y-0.5" href="#collections">
                Explore bestsellers <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a className="inline-flex h-13 items-center gap-2 rounded-full border border-[#382018]/15 bg-white/70 px-6 text-sm font-bold transition-colors hover:bg-white" href="#contact">
                Get the price list
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-[#6d5c52]">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-[#1f8177]" /> Thoughtful selections</span>
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-[#1f8177]" /> Made for local celebrations</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] lg:mr-0">
            <div className="absolute -left-8 top-4 size-28 rounded-full border border-[#ef6a38]/25" />
            <div className="absolute -right-10 bottom-2 size-40 rounded-full border border-[#1f8177]/25" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-[#301b42] p-3 shadow-[0_35px_80px_rgb(56_32_24/20%)] sm:p-4">
              <img
                src="/og.png"
                width="1672"
                height="941"
                alt="Natpe Thunai Crackers festive collection with neatly arranged sparklers, flower pots and celebration boxes"
                className="h-full w-full rounded-[1.8rem] object-cover"
              />
            </div>
            <div className="absolute -bottom-7 -left-3 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_16px_40px_rgb(56_32_24/16%)] sm:-left-9">
              <span className="grid size-9 place-items-center rounded-full bg-[#fff0c1] text-[#9a5c08]"><Sparkles className="size-4" /></span>
              <div>
                <p className="text-[0.65rem] font-black tracking-[0.16em] text-muted-foreground uppercase">Celebrate your way</p>
                <p className="mt-1 font-heading text-xl font-bold">Combos for every occasion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShopCollections />

      <section id="why-us" className="bg-[#fff8e9] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ['01', 'Friendly guidance', 'Tell us who you’re celebrating with. We’ll help you choose the right mix.'],
            ['02', 'Careful selection', 'Every assortment is chosen for variety, value and a memorable celebration.'],
            ['03', 'Neat, secure packing', 'Your order is checked and packed with care before it begins its journey.'],
          ].map(([number, title, copy]) => (
            <article key={number} className="rounded-3xl border border-[#382018]/10 bg-white p-7">
              <span className="text-xs font-black tracking-[0.18em] text-primary">{number}</span>
              <h3 className="mt-8 font-heading text-2xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="bg-primary px-5 py-16 text-primary-foreground sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-white/65 uppercase">Need help choosing?</p>
            <h2 className="mt-3 max-w-3xl font-heading text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">Let’s build your perfect celebration box.</h2>
          </div>
          <a href="#collections" className="inline-flex h-13 w-fit items-center gap-3 rounded-full bg-[#fff8e9] px-6 text-sm font-black text-[#382018] transition-transform hover:-translate-y-0.5">
            Build your order list <ArrowUpRight className="size-4" />
          </a>
        </div>
      </section>

      <footer className="bg-[#281b18] px-5 py-8 text-[#fff8e9]/65 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Natpe Thunai Crackers. Celebrate responsibly.</p>
          <p>Warm service. Bright celebrations.</p>
        </div>
      </footer>
    </main>
  );
}
