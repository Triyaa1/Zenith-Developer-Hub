'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  Code2,
  ArrowRight,
  Terminal,
  Coins,
  FileCode,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  useZenith,
  ZENITH_CHAIN_ID_DEC,
  ZENITH_CHAIN_ID_HEX,
  ZENITH_RPC_URL,
  ZENITH_FAUCET_URL,
  ZENITH_EXPLORER_URL,
} from '@/src/context/ZenithContext';

const HELLO_WORLD_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ZenithGreeter
 * @notice Minimal starter contract for Zenith EVM Testnet (Chain ID: 936485)
 */
contract ZenithGreeter {
    string private greeting;
    address public owner;
    uint256 public updateCount;

    event GreetingUpdated(address indexed updater, string newGreeting, uint256 count);

    constructor(string memory _initialGreeting) {
        greeting = _initialGreeting;
        owner = msg.sender;
        updateCount = 1;
    }

    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
        updateCount += 1;
        emit GreetingUpdated(msg.sender, _newGreeting, updateCount);
    }
}`;

const ERC20_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ZenithTestToken (ZTT)
 * @notice Lightweight ERC-20 token for Zenith EVM Testnet (Chain ID: 936485)
 */
contract ZenithTestToken {
    string public name = "Zenith Test Token";
    string public symbol = "ZTT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
}`;

export default function PlaybookPage() {
  const {
    walletAddress,
    isZenithNetwork,
    zthBalance,
    isSwitchingNetwork,
    connectWallet,
    switchOrAddZenithNetwork,
    requestSimulatedFaucetDrip,
    tasks,
    isSavingTask,
    toggleTask,
    saveDeployedContract,
  } = useZenith();

  const [selectedTemplate, setSelectedTemplate] = useState<'greeter' | 'erc20'>('greeter');
  const [copiedCode, setCopiedCode] = useState(false);
  const [contractInput, setContractInput] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSimulatingDeploy, setIsSimulatingDeploy] = useState(false);
  const [step1Status, setStep1Status] = useState<string | null>(null);

  const effectiveContractInput =
    contractInput !== null ? contractInput : tasks.deployedContractAddress || '';

  const activeCode =
    selectedTemplate === 'greeter' ? HELLO_WORLD_CONTRACT : ERC20_CONTRACT;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddZenithToMetaMask = async () => {
    setStep1Status(null);
    if (!walletAddress) {
      await connectWallet(true);
    }
    const success = await switchOrAddZenithNetwork();
    if (success) {
      await toggleTask('task1SwitchNetwork', true);
      setStep1Status('Zenith EVM Testnet (Chain ID: 936485) is active in your wallet.');
    }
  };

  const handleSimulateQuickDeploy = async () => {
    setIsSimulatingDeploy(true);
    setInputError(null);
    setSaveSuccess(false);
    await new Promise((r) => setTimeout(r, 900));
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const generatedAddr = `0x${randomHex}`;
    setContractInput(generatedAddr);
    setIsSimulatingDeploy(false);
  };

  const handleSaveContractAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    setSaveSuccess(false);

    const trimmed = effectiveContractInput.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setInputError(
        'Please enter a valid 42-character hexadecimal EVM contract address starting with 0x.'
      );
      return;
    }

    await saveDeployedContract(trimmed);
    setSaveSuccess(true);
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-zinc-400">
              <span>Interactive Deploy Playbook</span>
              <span aria-hidden="true">·</span>
              <span>Chain ID {ZENITH_CHAIN_ID_DEC}</span>
              <span aria-hidden="true">·</span>
              <span>Solidity 0.8.24</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
              Deploy Your First Smart Contract on Zenith
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Follow these four steps to add Zenith EVM Testnet to MetaMask, acquire ZTH gas tokens,
              compile and deploy a Solidity contract, and register your contract address.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 shrink-0 space-y-1">
            <span className="text-xs text-zinc-400 block">Current Wallet Balance</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 block">
              {zthBalance} ZTH
            </span>
            <span className="text-xs font-mono text-zinc-500 block">
              {isZenithNetwork ? 'Network: Zenith (936485)' : 'Network: Not on Zenith'}
            </span>
          </div>
        </div>
      </section>

      {/* 4-Step Playbook Pipeline */}
      <div className="space-y-6">
        {/* STEP 1: Add to MetaMask */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono tabular-nums text-blue-400 font-semibold">
                  Step 01
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span className="text-xs text-zinc-400">wallet_addEthereumChain</span>
                {tasks.task1SwitchNetwork && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                    <Check className="w-3 h-3" strokeWidth={2} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-zinc-50">
                Add Zenith EVM Testnet to MetaMask
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Click the button to trigger <code className="font-mono text-zinc-200">wallet_addEthereumChain</code> in MetaMask with Chain ID <code className="font-mono text-zinc-200">936485</code> (<code className="font-mono text-zinc-200">0xe4a25</code>) and RPC <code className="font-mono text-zinc-200">{ZENITH_RPC_URL}</code>.
              </p>

              {/* Network JSON Preview */}
              <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-300 space-y-1 overflow-x-auto tabular-nums">
                <div>Chain Name: Zenith EVM Testnet</div>
                <div>Chain ID: {ZENITH_CHAIN_ID_DEC} (Hex: {ZENITH_CHAIN_ID_HEX})</div>
                <div>RPC URL: {ZENITH_RPC_URL}</div>
                <div>Currency Symbol: ZTH (18 Decimals)</div>
                <div>Explorer URL: {ZENITH_EXPLORER_URL}</div>
              </div>

              {step1Status && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>{step1Status}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={handleAddZenithToMetaMask}
                disabled={isSwitchingNetwork}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Wallet className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  {isSwitchingNetwork
                    ? 'Configuring MetaMask...'
                    : isZenithNetwork
                    ? 'Add to MetaMask (Active)'
                    : 'Add to MetaMask'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* STEP 2: Get ZTH from Faucet */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono tabular-nums text-blue-400 font-semibold">
                  Step 02
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span className="text-xs text-zinc-400">Testnet Gas Acquisition</span>
                {tasks.task2GetFaucet && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                    <Check className="w-3 h-3" strokeWidth={2} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-zinc-50">
                Get ZTH from the Official Faucet
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Deploying a smart contract requires ZTH to cover EVM gas execution costs. Open the
                official Zenith Faucet in a new tab or request a simulated 0.50 ZTH developer drip
                to test immediately.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={ZENITH_FAUCET_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toggleTask('task2GetFaucet', true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Coins className="w-4 h-4" strokeWidth={1.5} />
                <span>Get ZTH</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>

              <button
                type="button"
                onClick={requestSimulatedFaucetDrip}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Credit +0.50 ZTH in simulated developer balance and mark Step 2 complete"
              >
                <span>Credit +0.50 Test ZTH</span>
              </button>
            </div>
          </div>
        </section>

        {/* STEP 3: Deploy Contract Guide & Copyable Solidity Snippet */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono tabular-nums text-blue-400 font-semibold">
                  Step 03
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span className="text-xs text-zinc-400">Solidity Compilation & Remix IDE</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-50">
                Compile & Deploy Your Solidity Contract
              </h2>
              <p className="text-sm text-zinc-400">
                Copy one of our battle-tested Solidity templates below and deploy it using Remix IDE
                connected to MetaMask on Zenith Testnet.
              </p>
            </div>

            {/* Template Switcher (Interactive Segmented Buttons) */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setSelectedTemplate('greeter')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedTemplate === 'greeter'
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ZenithGreeter.sol (Hello World)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('erc20')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedTemplate === 'erc20'
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ZenithTestToken.sol (ERC-20)
              </button>
            </div>
          </div>

          {/* Copyable Solidity Code Block */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                <FileCode className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                <span>
                  {selectedTemplate === 'greeter'
                    ? 'contracts/ZenithGreeter.sol'
                    : 'contracts/ZenithTestToken.sol'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
                    <span className="text-emerald-400">Copied Snippet</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Copy Solidity Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
              <code>{activeCode}</code>
            </pre>
          </div>

          {/* Remix IDE Deployment Walkthrough */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">
                  Remix IDE Deployment Instructions
                </span>
                <span className="text-xs font-mono text-zinc-500">Compiler 0.8.24</span>
              </div>
              <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Open <strong className="text-zinc-200">Remix IDE</strong> and create a new file{' '}
                  <code className="font-mono text-zinc-300">
                    {selectedTemplate === 'greeter' ? 'ZenithGreeter.sol' : 'ZenithTestToken.sol'}
                  </code>
                  .
                </li>
                <li>
                  Paste the Solidity snippet above and press{' '}
                  <strong className="text-zinc-200">Ctrl+S / Cmd+S</strong> to compile with Solidity
                  0.8.24.
                </li>
                <li>
                  In the <strong className="text-zinc-200">Deploy & Run Transactions</strong> tab,
                  set Environment to{' '}
                  <code className="font-mono text-emerald-400">Injected Provider - MetaMask</code>.
                </li>
                <li>
                  Confirm MetaMask displays network{' '}
                  <code className="font-mono text-zinc-200">936485</code>, provide constructor
                  argument{' '}
                  <code className="font-mono text-zinc-300">
                    {selectedTemplate === 'greeter' ? '"Hello Zenith!"' : '1000000'}
                  </code>
                  , and click <strong className="text-zinc-200">Deploy</strong>.
                </li>
              </ol>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-200 block">
                  Launch IDE or Run Quick Sandbox Deploy
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You can deploy via Remix IDE in a separate browser tab, or trigger an instant
                  sandbox contract deployment right here to test Step 4 and the Contract Analyzer.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://remix.ethereum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Code2 className="w-4 h-4" strokeWidth={1.5} />
                  <span>Open Remix IDE</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                </a>

                <button
                  type="button"
                  onClick={handleSimulateQuickDeploy}
                  disabled={isSimulatingDeploy}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  <span>
                    {isSimulatingDeploy
                      ? 'Deploying to Zenith...'
                      : 'Simulate Sandbox Deployment'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 4: Paste Deployed Contract Address */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono tabular-nums text-blue-400 font-semibold">
                Step 04
              </span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="text-xs text-zinc-400">Contract Verification & Registration</span>
              {tasks.task3DeployContract && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                  <Check className="w-3 h-3" strokeWidth={2} />
                  <span>Completed</span>
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-zinc-50">
              Register Your Deployed Contract Address
            </h2>
            <p className="text-sm text-zinc-400">
              Paste the deployed contract address from Remix IDE (or your simulated deployment) to
              record your milestone and unlock contract telemetry.
            </p>
          </div>

          <form onSubmit={handleSaveContractAddress} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={effectiveContractInput}
                onChange={(e) => {
                  setContractInput(e.target.value);
                  setInputError(null);
                  setSaveSuccess(false);
                }}
                placeholder="0x71C95911E9a5D330f4D621842EC243EE1343292e"
                className="flex-1 px-4 py-2.5 text-sm font-mono bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSavingTask === 'contract'}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                <span>
                  {isSavingTask === 'contract'
                    ? 'Saving Contract...'
                    : 'Verify & Save Contract'}
                </span>
              </button>
            </div>

            {inputError && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{inputError}</span>
              </div>
            )}

            {(saveSuccess || tasks.deployedContractAddress) && !inputError && (
              <div className="p-4 bg-zinc-950 border border-emerald-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                    <span>Contract Registered on Zenith Developer Hub</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-300 break-all">
                    Address: {tasks.deployedContractAddress || effectiveContractInput}
                  </p>
                </div>

                <Link
                  href={`/tools?address=${encodeURIComponent(
                    tasks.deployedContractAddress || effectiveContractInput
                  )}#analyzer`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Analyze This Contract</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
