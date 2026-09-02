'use client';

import { useMemo, useState } from 'react';
import { Check, Flame, Minus, PackageOpen, Plus, Send, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const products = [
  { id: 'sparklers', name: 'Sparklers Selection', category: 'Small joys', detail: 'Classic sparkle favourites in a cheerful mixed set.', label: 'Family favourite', tone: 'bg-[#ef6a38]', Icon: Sparkles },
  { id: 'chakkars', name: 'Ground Chakkars', category: 'Ground fun', detail: 'A lively choice for colour and movement on the ground.', label: 'Popular', tone: 'bg-[#1f8177]', Icon: WandSparkles },
  { id: 'flower-pots', name: 'Flower Pot Mix', category: 'Ground fun', detail: 'A bright fountain-style assortment for the celebration.', label: 'Colourful pick', tone: 'bg-[#5e3f92]', Icon: Flame },
  { id: 'kids-pack', name: 'Kids Colour Pack', category: 'Small joys', detail: 'A simple selection of colourful family favourites.', label: 'Easy starter', tone: 'bg-[#d94c72]', Icon: Sparkles },
  { id: 'family-box', name: 'Family Celebration Box', category: 'Combo boxes', detail: 'A balanced variety for a full evening of festive fun.', label: 'Most requested', tone: 'bg-[#c2851e]', Icon: PackageOpen },
  { id: 'grand-combo', name: 'Grand Festival Combo', category: 'Combo boxes', detail: 'A generous mix made for bigger family gatherings.', label: 'Full variety', tone: 'bg-[#335c67]', Icon: PackageOpen },
] as const;

const filters = ['All', 'Combo boxes', 'Ground fun', 'Small joys'] as const;

export function ShopCollections() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const visibleProducts = useMemo(
    () => products.filter((product) => activeFilter === 'All' || product.category === activeFilter),
    [activeFilter],
  );
  const selectedProducts = products.filter((product) => selected.includes(product.id));

  function toggleProduct(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setStatus('');
  }

  async function shareList() {
    const text = `Hello Natpe Thunai Crackers! I would like the current price and availability for:\n${selectedProducts.map((item) => `• ${item.name}`).join('\n')}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My cracker enquiry', text });
        setStatus('Your enquiry list is ready to send.');
      } else {
        await navigator.clipboard.writeText(text);
        setStatus('Enquiry copied — paste it into WhatsApp or a message.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setStatus('Please copy the product names and send them to the shop.');
    }
  }

  return (
    <section id="collections" className="bg-[#281b18] px-5 py-20 text-[#fff8e9] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#f7b644] uppercase">Build your enquiry</p>
            <h2 className="mt-3 max-w-3xl font-heading text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Pick what brings you joy.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Choose a few favourites and we’ll create a neat list you can share for the current price and availability.</p>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button className="h-12 rounded-full bg-[#f7b644] px-6 font-bold text-[#281b18] shadow-none hover:bg-[#ffd36a]" />
              }
            >
              <PackageOpen className="size-4" />
              Order list ({selected.length})
            </SheetTrigger>
            <SheetContent className="w-[min(92vw,430px)] border-[#382018]/10 bg-[#fff8e9] sm:max-w-[430px]">
              <SheetHeader className="border-b border-[#382018]/10 px-6 py-6">
                <SheetTitle className="font-heading text-3xl font-bold">Your celebration list</SheetTitle>
                <SheetDescription>Add your favourites, then share the list to ask for the latest price.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-3">
                {selectedProducts.length === 0 ? (
                  <div className="grid h-full min-h-64 place-items-center text-center">
                    <div>
                      <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f7b644]/20 text-[#9a5c08]"><Sparkles /></span>
                      <p className="mt-4 font-heading text-xl font-bold">Your list is waiting</p>
                      <p className="mt-2 text-sm text-muted-foreground">Add any products you’d like to enquire about.</p>
                    </div>
                  </div>
                ) : (
                  selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-4 border-b border-[#382018]/10 py-4">
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${product.name}`} onClick={() => toggleProduct(product.id)}>
                        <Minus />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <SheetFooter className="border-t border-[#382018]/10 bg-white/45 px-6 py-6">
                <Button disabled={!selected.length} onClick={shareList} className="h-12 rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                  <Send /> Share enquiry list
                </Button>
                {status && <p aria-live="polite" className="text-center text-xs leading-5 text-muted-foreground">{status}</p>}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter products">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant="ghost"
              size="sm"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`h-9 rounded-full border px-4 ${activeFilter === filter ? 'border-[#f7b644] bg-[#f7b644] text-[#281b18] hover:bg-[#f7b644]' : 'border-white/15 bg-white/[0.045] text-white/65 hover:bg-white/10 hover:text-white'}`}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => {
            const isSelected = selected.includes(product.id);
            return (
              <article key={product.id} className="group rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 transition-transform hover:-translate-y-1">
                <div className={`${product.tone} relative aspect-[16/10] overflow-hidden rounded-[1.15rem] p-5`}>
                  <div className="absolute -right-8 -top-8 size-36 rounded-full border-[24px] border-white/15" />
                  <div className="absolute bottom-5 right-5 grid size-14 place-items-center rounded-full bg-white/15 text-2xl font-black">0{index + 1}</div>
                  <product.Icon className="size-9 text-white/90" />
                  <span className="absolute bottom-5 left-5 rounded-full bg-black/15 px-3 py-1.5 text-[0.65rem] font-black tracking-[0.1em] uppercase backdrop-blur-sm">{product.label}</span>
                </div>
                <div className="px-1 pb-2 pt-5">
                  <p className="text-[0.65rem] font-black tracking-[0.13em] text-[#f7b644] uppercase">{product.category}</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold">{product.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-white/55">{product.detail}</p>
                  <Button
                    onClick={() => toggleProduct(product.id)}
                    variant="ghost"
                    className={`mt-5 h-10 w-full rounded-full border font-bold ${isSelected ? 'border-[#f7b644] bg-[#f7b644] text-[#281b18] hover:bg-[#ffd36a]' : 'border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white'}`}
                  >
                    {isSelected ? <><Check /> Added to list</> : <><Plus /> Add to list</>}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
