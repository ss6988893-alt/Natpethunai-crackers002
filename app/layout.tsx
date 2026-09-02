import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Natpe Thunai Crackers | Celebrate Brighter',
  description: 'Thoughtfully selected crackers and celebration combos for bright family moments.',
  openGraph: {
    title: 'Natpe Thunai Crackers | Celebrate Brighter',
    description: 'Build a festive enquiry list from thoughtfully selected crackers and celebration combos.',
    type: 'website',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'Natpe Thunai Crackers — Big smiles. Bright nights.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natpe Thunai Crackers | Celebrate Brighter',
    description: 'Build a festive enquiry list from thoughtfully selected crackers and celebration combos.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
