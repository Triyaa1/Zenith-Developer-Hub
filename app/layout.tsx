import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans,
  DM_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { ZenithProvider } from '@/src/context/ZenithContext';
import { Navbar } from '@/src/components/Navbar';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Zenith Developer Hub',
  description:
    'An all-in-one onboarding, interactive deployment playbook, and testnet toolkit for developers building on the Zenith EVM Testnet (Chain ID: 936485).',
  openGraph: {
    title: 'Zenith Developer Hub',
    description:
      'An all-in-one onboarding, interactive deployment playbook, and testnet toolkit for developers building on the Zenith EVM Testnet (Chain ID: 936485).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenith Developer Hub',
    description:
      'An all-in-one onboarding, interactive deployment playbook, and testnet toolkit for developers building on the Zenith EVM Testnet (Chain ID: 936485).',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-blue-600 selection:text-white flex flex-col"
      >
        <ZenithProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
            {children}
          </main>
          <footer className="border-t border-zinc-800 bg-zinc-950 py-6 mt-16">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span>Zenith EVM Testnet</span>
                <span aria-hidden="true">·</span>
                <span>Chain ID 936485</span>
                <span aria-hidden="true">·</span>
                <span>Gas Token ZTH (No Real Value)</span>
              </div>
              <div className="flex items-center gap-4">
                <span>RPC: https://rpc.testnet.zenith.network</span>
              </div>
            </div>
          </footer>
        </ZenithProvider>
      </body>
    </html>
  );
}
