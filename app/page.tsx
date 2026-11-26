'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Wallet,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Wrench,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import {
  useZenith,
  ZENITH_CHAIN_ID_DEC,
  ZENITH_CHAIN_ID_HEX,
  ZENITH_RPC_URL,
  ZENITH_FAUCET_URL,
  TaskKey,
} from '@/src/context/ZenithContext';

interface OnboardingTaskItem {
  key: TaskKey;
  stepNumber: string;
  title: string;
  description: string;
  tooltip: string;
  primaryActionLabel: string;
  primaryActionHref?: string;
  isExternal?: boolean;
  onPrimaryAction?: () => void;
}

export default function DashboardPage() {
  const {
    authUser,
    isAuthLoading,
    authError,
    signInWithGoogle,
    signOutUser,
    walletAddress,
    chainId,
    isZenithNetwork,
    zthBalance,
    isConnectingWallet,
    isSwitchingNetwork,
    walletError,
    connectWallet,
    switchOrAddZenithNetwork,
    refreshBalance,
    tasks,
    isLoadingTasks,
    isSavingTask,
    syncError,
    toggleTask,
  } = useZenith();

  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 1800);
  };

  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshingBalance(false), 400);
  };

  const handleSwitchNetworkTask = async () => {
    if (!walletAddress) {
      await connectWallet(true);
    }
    const ok = await switchOrAddZenithNetwork();
    if (ok && !tasks.task1SwitchNetwork) {
      await toggleTask('task1SwitchNetwork', true);
    }
  };

  const taskItems: OnboardingTaskItem[] = [
    {
      key: 'task1SwitchNetwork',
      stepNumber: '01',
      title: 'Switch to Zenith Network (MetaMask)',
      description:
        'Configure MetaMask for Zenith EVM Testnet (Chain ID: 936485) and connect to https://rpc.testnet.zenith.network.',
      tooltip:
        'Calls wallet_switchEthereumChain or wallet_addEthereumChain with Chain ID 0xe4a25 (936485).',
      primaryActionLabel: isZenithNetwork
        ? 'Network Configured (936485)'
        : 'Add / Switch in MetaMask',
      onPrimaryAction: handleSwitchNetworkTask,
    },
    {
      key: 'task2GetFaucet',
      stepNumber: '02',
      title: 'Get ZTH from the Faucet',
      description:
        'Fund your testnet wallet with ZTH gas tokens to pay for contract deployments and state-changing transactions.',
      tooltip:
        'ZTH is the native testnet gas token on Zenith EVM Testnet and holds no real monetary value.',
      primaryActionLabel: 'Open Faucet Helper',
      primaryActionHref: '/tools#faucet',
    },
    {
      key: 'task3DeployContract',
      stepNumber: '03',
      title: 'Deploy your first contract using our Playbook',
      description: tasks.deployedContractAddress
        ? `Deployed Contract: ${tasks.deployedContractAddress}`
        : 'Follow our interactive 4-step Solidity deployment guide using Remix IDE or direct wallet deployment.',
      tooltip:
        'Compile an EVM-compatible Solidity smart contract and deploy it to Zenith Testnet.',
      primaryActionLabel: 'Open Deploy Playbook',
      primaryActionHref: '/playbook',
    },
    {
      key: 'task4AnalyzeContract',
      stepNumber: '04',
      title: 'Analyze your contract',
      description:
        'Inspect transaction count, gas consumption in ZTH, and recent method execution telemetry for your deployed contract.',
      tooltip:
        'Run the Zenith Contract Analyzer in Testnet Tools on your deployed contract address.',
      primaryActionLabel: 'Open Contract Analyzer',
      primaryActionHref: tasks.deployedContractAddress
        ? `/tools?address=${encodeURIComponent(tasks.deployedContractAddress)}#analyzer`
        : '/tools#analyzer',
    },
  ];

  const completedCount = [
    tasks.task1SwitchNetwork,
    tasks.task2GetFaucet,
    tasks.task3DeployContract,
    tasks.task4AnalyzeContract,
  ].filter(Boolean).length;

  const progressPercentage = Math.round((completedCount / 4) * 100);

  return (
    <div className="space-y-10">
      {/* Hero Section: Welcome to Zenith */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-zinc-400">
                <span>Zenith EVM Testnet</span>
                <span aria-hidden="true">·</span>
                <span>Chain ID {ZENITH_CHAIN_ID_DEC} ({ZENITH_CHAIN_ID_HEX})</span>
                <span aria-hidden="true">·</span>
                <span>Token ZTH</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
                Welcome to Zenith
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                Complete your developer onboarding checklist, configure your Web3 environment,
                deploy EVM smart contracts, and simulate cross-chain transfers on the Zenith Testnet.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!walletAddress ? (
                <button
                  type="button"
                  onClick={() => connectWallet(true)}
                  disabled={isConnectingWallet}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" strokeWidth={1.5} />
                  <span>
                    {isConnectingWallet ? 'Connecting MetaMask...' : 'Connect MetaMask Wallet'}
                  </span>
                </button>
              ) : (
                <Link
                  href="/playbook"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                  <span>Launch Deploy Playbook</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              )}

              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                <Wrench className="w-4 h-4" strokeWidth={1.5} />
                <span>Explore Testnet Tools</span>
              </Link>
            </div>
          </div>

          {/* Connected Wallet & ZTH Balance Telemetry Box */}
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div>
                <p className="text-xs font-medium text-zinc-400">Connected Developer Wallet</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {walletAddress
                    ? isZenithNetwork
                      ? 'Connected to Zenith EVM Testnet'
                      : `Connected to Chain ID ${chainId}`
                    : 'Not connected'}
                </p>
              </div>
              {walletAddress && (
                <button
                  type="button"
                  onClick={handleRefreshBalance}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors duration-150 cursor-pointer"
                  title="Refresh ZTH balance from RPC"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshingBalance ? 'animate-spin' : ''}`}
                    strokeWidth={1.5}
                  />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {walletAddress ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>Wallet Address</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(walletAddress, 'wallet')}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {copiedItem === 'wallet' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-xs text-zinc-200 truncate tabular-nums">
                    {walletAddress}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                    <span className="text-xs text-zinc-400 block">Testnet Balance</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1 block">
                      {zthBalance} ZTH
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                    <span className="text-xs text-zinc-400 block">Active Chain ID</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-zinc-100 mt-1 block">
                      {chainId ?? ZENITH_CHAIN_ID_DEC}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Connect your MetaMask wallet to inspect your ZTH gas balance and interact with Zenith Testnet.
                </p>
                <button
                  type="button"
                  onClick={() => connectWallet(true)}
                  disabled={isConnectingWallet}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{isConnectingWallet ? 'Connecting...' : 'Connect Wallet Now'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Network Specs Quick Reference Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
            <div>
              <span className="text-xs text-zinc-400 block">Network Name</span>
              <span className="text-sm font-medium text-zinc-100 mt-0.5 block">
                Zenith EVM Testnet
              </span>
            </div>
            <Terminal className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
            <div>
              <span className="text-xs text-zinc-400 block">Chain ID</span>
              <span className="text-sm font-mono tabular-nums font-medium text-zinc-100 mt-0.5 block">
                {ZENITH_CHAIN_ID_DEC} ({ZENITH_CHAIN_ID_HEX})
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(String(ZENITH_CHAIN_ID_DEC), 'chainId')}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors cursor-pointer"
              title="Copy Chain ID"
            >
              {copiedItem === 'chainId' ? (
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              ) : (
                <Copy className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg sm:col-span-2">
            <div className="min-w-0 pr-3">
              <span className="text-xs text-zinc-400 block">RPC Endpoint URL</span>
              <span className="text-sm font-mono text-zinc-100 mt-0.5 block truncate">
                {ZENITH_RPC_URL}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(ZENITH_RPC_URL, 'rpc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              {copiedItem === 'rpc' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                  <span className="text-emerald-400">Copied RPC</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Copy RPC</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Error Notification Banner (if any) */}
      {(walletError || authError || syncError) && (
        <div className="p-4 bg-zinc-900 border border-red-500/40 rounded-lg flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="font-medium text-red-200">Action Notice</p>
            <p className="text-xs text-red-300/90">
              {walletError || authError || syncError}
            </p>
          </div>
        </div>
      )}

      {/* Gamified Developer Progress & Task Tracker */}
      <section className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Onboarding Checklist</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {completedCount}/4 tasks completed ({progressPercentage}%)
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-50">
                Developer Progress Tracker
              </h2>
            </div>

            {/* Cloud Account Persistence Control */}
            <div className="flex items-center gap-3">
              {!isAuthLoading && !authUser ? (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-100 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Sign in with Google to persist your wallet's task completion progress across devices"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                  <span>Sign in to Save Progress</span>
                </button>
              ) : authUser ? (
                <div className="flex items-center gap-3 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                  <span className="truncate max-w-[180px]" title={authUser.email || ''}>
                    Synced: {authUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={signOutUser}
                    className="text-zinc-400 hover:text-zinc-100 underline cursor-pointer ml-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-zinc-300 font-medium">
                {completedCount === 4
                  ? 'All Zenith onboarding tasks completed'
                  : `${completedCount} of 4 onboarding tasks completed`}
              </span>
              <span
                className={
                  completedCount === 4 ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
                }
              >
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Task List */}
          {isLoadingTasks ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-zinc-950 border border-zinc-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {taskItems.map((item) => {
                const isCompleted = tasks[item.key];
                const isSaving = isSavingTask === item.key;

                return (
                  <div
                    key={item.key}
                    className={`p-5 rounded-lg border transition-colors duration-150 ${
                      isCompleted
                        ? 'bg-zinc-950/90 border-emerald-500/40'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleTask(item.key)}
                          disabled={isSaving}
                          className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0 focus-visible:outline-none"
                          title={
                            isCompleted ? 'Click to mark as incomplete' : 'Click to mark as done'
                          }
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              className="w-5 h-5 text-emerald-500"
                              strokeWidth={1.75}
                            />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-mono tabular-nums text-zinc-500">
                              Task {item.stepNumber}
                            </span>
                            <h3
                              className={`text-base font-semibold ${
                                isCompleted ? 'text-zinc-100' : 'text-zinc-50'
                              }`}
                            >
                              {item.title}
                            </h3>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                                <Check className="w-3 h-3" strokeWidth={2} />
                                <span>Completed</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>
                          <p className="text-xs text-zinc-500 pt-0.5">{item.tooltip}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-8 lg:pl-0">
                        {item.primaryActionHref ? (
                          item.isExternal ? (
                            <a
                              href={item.primaryActionHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                            >
                              <span>{item.primaryActionLabel}</span>
                              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </a>
                          ) : (
                            <Link
                              href={item.primaryActionHref}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                            >
                              <span>{item.primaryActionLabel}</span>
                              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </Link>
                          )
                        ) : item.onPrimaryAction ? (
                          <button
                            type="button"
                            onClick={item.onPrimaryAction}
                            disabled={isSwitchingNetwork}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>{item.primaryActionLabel}</span>
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => toggleTask(item.key)}
                          disabled={isSaving}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isCompleted
                              ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                              : 'text-white bg-blue-600 hover:bg-blue-500'
                          }`}
                        >
                          {isSaving ? (
                            <span>Saving...</span>
                          ) : isCompleted ? (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Completed</span>
                            </>
                          ) : (
                            <span>Mark as Done</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick Navigation Cards to Playbook, Faucet, Bridge Simulator, and Contract Analyzer */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-mono text-zinc-400">01 · Interactive Guide</div>
            <h3 className="text-lg font-bold text-zinc-50">Deploy Playbook</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Step-by-step Solidity deployment workflow with network configuration, copyable
              ERC-20 & Greeter templates, and contract address verification.
            </p>
          </div>
          <Link
            href="/playbook"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Go to Deploy Playbook</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-mono text-zinc-400">02 · Cross-Chain Demo</div>
            <h3 className="text-lg font-bold text-zinc-50">Canton to Zenith Bridge</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Test how assets move between Canton Network and Zenith EVM Testnet with our
              interactive bridge state-proof simulator.
            </p>
          </div>
          <Link
            href="/tools#bridge"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Launch Bridge Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-mono text-zinc-400">03 · On-Chain Telemetry</div>
            <h3 className="text-lg font-bold text-zinc-50">Contract Analyzer</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Paste any Zenith Testnet contract address to inspect total transactions, ZTH gas
              consumed, and recent method execution logs.
            </p>
          </div>
          <Link
            href="/tools#analyzer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Inspect a Contract</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
