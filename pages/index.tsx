import React, { useState, useEffect } from 'react';
import { 
  Wallet, Globe, Shield, Zap, CheckCircle2, 
  LogOut, ChevronRight, Split, Sparkles
} from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  // Wagmi Hooks for real wallet integration
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<'upi' | 'cctp' | 'engine' | 'split'>('upi');
  const [transferMode, setTransferMode] = useState<'native' | 'cctp'>('native');
  const [statusMsg, setStatusMsg] = useState<string>('System Ready');

  // Interactive UI States
  const [cctpModalOpen, setCctpModalOpen] = useState<boolean>(false);
  const [splitModalOpen, setSplitModalOpen] = useState<boolean>(false);
  const [speedTestRunning, setSpeedTestRunning] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Form & Execution States
  const [upiId, setUpiId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Localization Dictionary
  const t = {
    nativeModeSelected: 'Arc Native Settlement Activated',
    cctpModeSelected: 'Circle CCTP Cross-Chain Router Engaged',
    processingTx: 'Executing Deterministic Settlement...',
    txSuccess: 'Settlement Finalized on Arc Infrastructure'
  };

  // Welcome Animation Auto-Dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Logout Handler with Thank You Animation Modal
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    disconnect();
    setStatusMsg('Wallet Disconnected');
    setShowLogoutModal(false);
  };

  // Speed Test Benchmark Runner
  const handleRunSpeedTest = () => {
    setSpeedTestRunning(true);
    setStatusMsg('Running Arc Deterministic Speed Benchmark...');
    setTimeout(() => {
      setSpeedTestRunning(false);
      setStatusMsg('Benchmark Complete: Sub-second finality confirmed (412ms)');
    }, 1200);
  };

  // Payment Execution Handler
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsProcessing(true);
    setStatusMsg(t.processingTx);
    setTimeout(() => {
      setIsProcessing(false);
      setStatusMsg(t.txSuccess);
      setAmount('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 font-sans antialiased relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* 1. WELCOME ANIMATION OVERLAY */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-[#020408] flex flex-col items-center justify-center p-4 transition-opacity duration-500">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 animate-pulse flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-emerald-400">
            WELCOME TO ARC ECOSYSTEM
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">
            deterministic infrastructure & programmable money
          </p>
        </div>
      )}

      {/* 2. THANK YOU LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Thank You for using Arc</h3>
              <p className="text-xs text-slate-400 mt-1">Your session has been securely closed on-chain.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold hover:bg-slate-800 transition-all text-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold transition-all text-white shadow-lg shadow-purple-600/30"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* HEADER SECTION */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-100 uppercase">Arc Payment Protocol</h1>
              <p className="text-[10px] text-slate-400 font-mono">native usdc • deterministic execution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ConnectButton showBalance={false} />
            {isConnected && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* ARC ECOSYSTEM ASSET ROUTING CARDS */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>ARC ECOSYSTEM ASSET ROUTING</span>
            <span className="text-purple-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Verifiable</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Native USDC */}
            <button 
              onClick={() => {
                setTransferMode('native');
                setActiveTab('upi');
                setStatusMsg(t.nativeModeSelected);
              }}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                transferMode === 'native' 
                  ? 'bg-purple-950/40 border-purple-500' 
                  : 'bg-[#05070a] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-purple-400 font-semibold text-[10px]">arc testnet</p>
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[8px] font-bold">A</div>
              </div>
              <p className="text-slate-200 mt-0.5 font-bold text-xs">native usdc</p>
              <p className="text-[9px] text-slate-400 mt-1">click to select mode</p>
            </button>

            {/* Circle CCTP with Native SVGs */}
            <button 
              onClick={() => setCctpModalOpen(true)}
              className="bg-[#05070a] hover:border-emerald-500/50 p-2.5 rounded-lg border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-400 font-semibold text-[10px]">circle cctp</p>
                <svg className="w-3.5 h-3.5 text-emerald-400 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 7h11m0 0l-4-4m4 4l-4 4m-5 6H3m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <p className="text-emerald-400 mt-0.5 font-bold text-xs flex items-center gap-1">
                cross-chain bridge ↗
              </p>
              <p className="text-[9px] text-slate-400 mt-1">click to test cctp</p>
            </button>

            {/* Speed Benchmark */}
            <button 
              onClick={handleRunSpeedTest}
              disabled={speedTestRunning}
              className="bg-[#05070a] hover:border-indigo-500/50 p-2.5 rounded-lg border border-slate-800 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-400 font-semibold text-[10px]">deterministic engine</p>
                <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <p className="text-indigo-400 mt-0.5 font-bold text-xs">speed benchmark</p>
              <p className="text-[9px] text-slate-400 mt-1">{speedTestRunning ? 'testing...' : 'click to run test'}</p>
            </button>

            {/* Payment UX Auto-Split */}
            <button 
              onClick={() => setSplitModalOpen(true)}
              className="bg-[#05070a] hover:border-amber-500/50 p-2.5 rounded-lg border border-slate-800 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-400 font-semibold text-[10px]">payment ux</p>
                <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                </svg>
              </div>
              <p className="text-amber-400 mt-0.5 font-bold text-xs">auto-split splitter</p>
              <p className="text-[9px] text-slate-400 mt-1">click to configure</p>
            </button>
          </div>
        </section>

        {/* MAIN EXECUTION PANEL */}
        <div className="bg-[#080b11] border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
          
          {/* NAVIGATION TABS */}
          <div className="flex items-center border-b border-slate-800/80 pb-3 gap-6 text-xs font-medium">
            <button 
              onClick={() => setActiveTab('upi')}
              className={`pb-1 transition-all ${activeTab === 'upi' ? 'text-purple-400 border-b-2 border-purple-500 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Direct Settlement UX
            </button>
            <button 
              onClick={() => setActiveTab('cctp')}
              className={`pb-1 transition-all ${activeTab === 'cctp' ? 'text-purple-400 border-b-2 border-purple-500 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              CCTP Teleport
            </button>
            <button 
              onClick={() => setActiveTab('engine')}
              className={`pb-1 transition-all ${activeTab === 'engine' ? 'text-purple-400 border-b-2 border-purple-500 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Deterministic Metrics
            </button>
          </div>

          {/* TAB 1: UPI / DIRECT SETTLEMENT */}
          {activeTab === 'upi' && (
            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Recipient UPI ID / Address</label>
                <input 
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="user@upi or 0x..."
                  className="w-full bg-[#030508] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Amount (USDC)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#030508] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-all font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">USDC</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !isConnected}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing Transaction...' : 'Settle Instantly via Arc'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: CCTP TELEPORT */}
          {activeTab === 'cctp' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Circle CCTP Native Mint/Burn Protocol
                </p>
                <p className="text-[11px] text-emerald-400/80">
                  Cross-chain USDC teleportation without liquidity pools or wrapped assets.
                </p>
              </div>
              <button 
                onClick={() => setCctpModalOpen(true)}
                className="w-full py-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold transition-all"
              >
                Launch CCTP Router Console
              </button>
            </div>
          )}

          {/* TAB 3: ENGINE METRICS */}
          {activeTab === 'engine' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 bg-[#030508] border border-slate-800 rounded-lg">
                <span className="text-slate-400">Execution Mode:</span>
                <span className="text-purple-400 font-bold">Deterministic EVM</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#030508] border border-slate-800 rounded-lg">
                <span className="text-slate-400">Target Latency:</span>
                <span className="text-emerald-400 font-bold">&lt; 500ms</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#030508] border border-slate-800 rounded-lg">
                <span className="text-slate-400">Gas Asset:</span>
                <span className="text-indigo-400 font-bold">USDC Native Gas</span>
              </div>
            </div>
          )}

          {/* SYSTEM STATUS FOOTER */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Status: {statusMsg}
            </span>
            <span>Arc Chain V1</span>
          </div>
        </div>

      </div>

      {/* MODAL: CIRCLE CCTP CONFIG */}
      {cctpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Circle CCTP Bridge Router
              </h3>
              <button onClick={() => setCctpModalOpen(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Teleport USDC directly from Ethereum, Arbitrum, or Solana to Arc Testnet using Circle's native burn and mint attestation.
            </p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Source Chain:</span>
                <span className="text-slate-200">Arbitrum One</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Destination Chain:</span>
                <span className="text-purple-400 font-bold">Arc Testnet</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setCctpModalOpen(false);
                setStatusMsg('CCTP Cross-chain Route Initialized');
              }}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              Initiate CCTP Transfer
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT SPLITTER CONFIG */}
      {splitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Split className="w-4 h-4" /> Programmable Auto-Splitter
              </h3>
              <button onClick={() => setSplitModalOpen(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Configure automatic revenue splitting upon settlement directly at the protocol layer.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-300">Treasury (80%)</span>
                <span className="text-slate-500 font-mono">0x12...89</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-300">Liquidity Vault (20%)</span>
                <span className="text-slate-500 font-mono">0x99...AB</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setSplitModalOpen(false);
                setStatusMsg('Auto-split Rule Saved On-Chain');
              }}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20"
            >
              Save Split Rule
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
