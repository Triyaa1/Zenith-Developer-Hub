'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, ExternalLink, AlertTriangle, LogOut } from 'lucide-react';
import {
  useZenith,
  ZENITH_CHAIN_ID_DEC,
  ZENITH_FAUCET_URL,
} from '@/src/context/ZenithContext';

export function Navbar() {
  const pathname = usePathname();
  const {
    walletAddress,
    isZenithNetwork,
    zthBalance,
    isConnectingWallet,
    isSwitchingNetwork,
    connectWallet,
    disconnectWallet,
    switchOrAddZenithNetwork,
  } = useZenith();

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/playbook', label: 'Deploy Playbook' },
    { href: '/tools', label: 'Testnet Tools' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 h-16">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
        >
          Zenith Developer Hub
        </Link>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 transition-colors duration-150 whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-zinc-50 border-blue-500'
                    : 'text-zinc-400 border-transparent hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={ZENITH_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1 text-zinc-400 hover:text-zinc-100 border-b-2 border-transparent hover:border-zinc-700 transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <span>Faucet</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </nav>

        {/* Zone 3: 1 Primary Wallet Action */}
        <div className="flex items-center gap-3 shrink-0">
          {!walletAddress ? (
            <button
              type="button"
              onClick={() => connectWallet(true)}
              disabled={isConnectingWallet}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          ) : !isZenithNetwork ? (
            <button
              type="button"
              onClick={() => switchOrAddZenithNetwork()}
              disabled={isSwitchingNetwork}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              title={`Click to switch MetaMask to Zenith EVM Testnet (Chain ID: ${ZENITH_CHAIN_ID_DEC})`}
            >
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>
                {isSwitchingNetwork ? 'Switching...' : 'Switch to Zenith (936485)'}
              </span>
            </button>
          ) : (
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-2">
              <span className="px-2.5 py-1 text-xs font-mono tabular-nums text-emerald-400 whitespace-nowrap shrink-0">
                {zthBalance} ZTH
              </span>
              <span
                className="px-2.5 py-1 text-xs font-mono tabular-nums text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-md whitespace-nowrap shrink-0"
                title={`Connected Address: ${walletAddress} (Chain ID: ${ZENITH_CHAIN_ID_DEC})`}
              >
                {formatAddress(walletAddress)}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors duration-150 cursor-pointer"
                title="Disconnect Wallet"
                aria-label="Disconnect Wallet"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
