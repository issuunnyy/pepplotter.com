import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pepplotter.com'),
  title: 'Peptide Calculator & Syringe Draw Plotter | PepPlotter',
  description:
    'PepPlotter (pepplotter.com) is a free, open-source peptide reconstitution calculator, U-100/U-40 syringe draw visualizer, and PK half-life simulator.',
  alternates: {
    canonical: 'https://pepplotter.com',
    types: {
      'text/markdown': '/llms.txt',
    },
  },
  keywords: [
    'PepPlotter',
    'pepplotter.com',
    'peptide calculator',
    'peptide reconstitution calculator',
    'glp-1 plotter',
    'semaglutide calculator',
    'tirzepatide dose calculator',
    'peptide half life calculator',
    'insulin syringe units calculator',
    'bac water calculator',
    'retatrutide calculator',
    'split dose calculator',
    'how many units of semaglutide on u100 syringe',
  ],
  authors: [{ name: 'PepPlotter Research & Harm Reduction Systems' }],
  creator: 'PepPlotter',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pepplotter.com',
    title: 'Peptide Calculator & Syringe Draw Plotter | PepPlotter',
    description:
      'PepPlotter (pepplotter.com) is a free, open-source peptide reconstitution calculator, U-100/U-40 syringe draw visualizer, and PK half-life simulator.',
    siteName: 'PepPlotter (pepplotter.com)',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PepPlotter - Peptide Reconstitution & GLP-1 Half-Life Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptide Calculator & Syringe Draw Plotter | PepPlotter',
    description:
      'PepPlotter (pepplotter.com) is a free, open-source peptide reconstitution calculator, U-100/U-40 syringe draw visualizer, and PK half-life simulator.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark antialiased overflow-x-hidden max-w-full`}>
      <head>
        <link rel="alternate" type="text/markdown" href="/llms.txt" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden max-w-full">
        {children}
      </body>
    </html>
  );
}
