'use client'

import React, { useState } from 'react'

export default function Page() {
  const [arcId, setArcId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [feeAddress, setFeeAddress] = useState('')
  const [activeTab, setActiveTab] = useState('transfer')

  return (
    <main className="min-h-screen bg-[#0a192f] text-slate-100 p-3 sm:p-6 font-mono relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      
      {/* header section with exact bridge & gold A logo */}
      <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#112240] p-4 rounded-xl border border-blue-900/40 gap-3 shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-b from-[#162a4a] to-[#0a192f] rounded-lg border border-blue-500/30 shadow-md flex items-center justify-center shrink-0 p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
              <path d="M50 8 C44 8 41 14 43 20 C45 25 48 28 50 32 C52 28 55 25 57 20 C59 14 56 8 50 8 Z" fill="#facc15" />
              <path d="M35 75 L35 32 L40 32 L40 75 Z M60 75 L60 32 L65 32 L65 75 Z" fill="#94a3b8" />
              <path d="M15 72 L85 72 L85 77 L15 77 Z" fill="#64748b" />
              <path d="M37 32 Q 50 50 63 32 M37 45 Q 50 58 63 45 M37 60 Q 50 70 63 60" fill="none" stroke="#cbd5e1" strokeWidth="3" />
              <path d="M37 32 L20 70 L15 68 L35 30 Z M63 32 L80 70 L85 68 L65 30 Z" fill="#94a3b8" />
              <ellipse cx="50" cy="85" rx="18" ry="4" fill="#64748b" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              ARC SETTLEMENT HUB
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">PRIMARY</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400">programmable usdc settlement engine on the arc network</p>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">English</span>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition-all">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* multi-chain identity section */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[11px] font-bold text-purple-400 tracking-wider uppercase">arc multi-chain identity</h2>
          <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">wallet disconnected</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#0a192f] border border-blue-950 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-400">
            <input 
              type="text" 
              placeholder="bound arc up id" 
              value={arcId}
              onChange={(e) => setArcId(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-slate-200 placeholder:text-slate-600"
            />
            <span className="text-[10px] text-slate-600">--</span>
          </div>
          <div className="bg-[#0a192f] border border-blue-950 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-400">
            <span>arc treasury balance</span>
            <span className="text-slate-200 font-semibold">--</span>
          </div>
        </div>
      </section>

      {/* ecosystem asset routing */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <h2 className="text-[11px] font-bold text-purple-400 tracking-wider uppercase mb-3">arc ecosystem asset routing</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#0a192f] p-3 rounded-lg border border-purple-500/40">
            <p className="text-[10px] text-slate-500">arc testnet</p>
            <p className="text-xs font-bold text-white mt-0.5">native usdc</p>
            <p className="text-[9px] text-purple-400 mt-2">click to select mode</p>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950">
            <p className="text-[10px] text-slate-500">circle cctp</p>
            <p className="text-xs font-bold text-white mt-0.5">cross-chain bridge</p>
            <p className="text-[9px] text-slate-500 mt-2">click to test cctp</p>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950">
            <p className="text-[10px] text-slate-500">deterministic engine</p>
            <p className="text-xs font-bold text-white mt-0.5">speed benchmark</p>
            <p className="text-[9px] text-slate-500 mt-2">click to run test</p>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950">
            <p className="text-[10px] text-slate-500">payment ux</p>
            <p className="text-xs font-bold text-white mt-0.5">auto-split splitter</p>
            <p className="text-[9px] text-slate-500 mt-2">click to configure</p>
          </div>
        </div>
      </section>

      {/* programmable fee engine */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <h2 className="text-[11px] font-bold text-purple-400 tracking-wider uppercase mb-1">arc programmable fee engine</h2>
        <p className="text-[10px] text-slate-400 mb-3">distribute creator fees, split payments, or send cross-chain royalties natively on arc.</p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            placeholder="address 0x... or @handle" 
            value={feeAddress}
            onChange={(e) => setFeeAddress(e.target.value)}
            className="flex-1 bg-[#0a192f] border border-blue-950 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <input 
            type="text" 
            defaultValue="0.05" 
            className="w-full sm:w-24 bg-[#0a192f] border border-blue-950 rounded-lg p-2.5 text-xs text-slate-200 text-center focus:outline-none focus:border-purple-500"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
            distribute fee
          </button>
        </div>
      </section>

      {/* builder onboarding workflow */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <h2 className="text-[11px] font-bold text-purple-400 tracking-wider uppercase mb-3">arc builder onboarding workflow</h2>
        <div className="space-y-2.5">
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">1. bind arc identity & wallet</p>
              <p className="text-[10px] text-slate-400">deterministically registers identity on arc network</p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">pending</span>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">2. execute arc usdc settlement</p>
              <p className="text-[10px] text-slate-400">executed: 0 settlement txns</p>
            </div>
            <button className="bg-purple-600/80 hover:bg-purple-600 text-white text-[10px] px-3 py-1.5 rounded transition-colors">
              run settlement
            </button>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">3. claim arc builder stamp</p>
              <p className="text-[10px] text-slate-400">issues arc ecosystem verification badge</p>
            </div>
            <button className="bg-slate-800 text-slate-500 text-[10px] px-3 py-1.5 rounded cursor-not-allowed">
              claim stamp
            </button>
          </div>
        </div>
      </section>

      {/* interactive transfer & modules */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <div className="flex gap-4 border-b border-blue-950 pb-2 mb-3 text-xs font-semibold">
          <button onClick={() => setActiveTab('transfer')} className={`${activeTab === 'transfer' ? 'text-purple-400 border-b-2 border-purple-400 pb-1 -mb-2' : 'text-slate-400 hover:text-slate-200'}`}>arc usdc transfer</button>
          <button onClick={() => setActiveTab('pos')} className={`${activeTab === 'pos' ? 'text-purple-400 border-b-2 border-purple-400 pb-1 -mb-2' : 'text-slate-400 hover:text-slate-200'}`}>pos qr invoice</button>
          <button onClick={() => setActiveTab('treasury')} className={`${activeTab === 'treasury' ? 'text-purple-400 border-b-2 border-purple-400 pb-1 -mb-2' : 'text-slate-400 hover:text-slate-200'}`}>arc yield treasury</button>
        </div>
        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="send to @arc_id or 0x wallet address" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="flex-1 bg-[#0a192f] border border-blue-950 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 rounded-lg border border-slate-700">scan qr</button>
          </div>
          <div className="flex justify-between items-center bg-[#0a192f] p-2 rounded-lg border border-blue-950 text-[10px] text-slate-400">
            <span>transfer route:</span>
            <div className="flex gap-1.5">
              <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">native gas usdc</span>
              <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded">erc-20 contract</span>
            </div>
          </div>
          <input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#0a192f] border border-blue-950 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-3 rounded-lg transition-colors shadow">
            pay via arc usdc ({amount} usdc)
          </button>
        </div>
      </section>

      {/* infrastructure links */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <h2 className="text-[11px] font-bold text-purple-400 tracking-wider uppercase mb-3">arc ecosystem infrastructure links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950 flex justify-between items-center text-xs text-slate-300">
            <span>arcscan explorer</span>
            <span className="text-slate-600">→</span>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950 flex justify-between items-center text-xs text-slate-300">
            <span>circle usdc faucet</span>
            <span className="text-slate-600">→</span>
          </div>
          <div className="bg-[#0a192f] p-3 rounded-lg border border-blue-950 flex justify-between items-center text-xs text-slate-300">
            <span>arc protocol docs</span>
            <span className="text-slate-600">→</span>
          </div>
        </div>
      </section>

      {/* network activity logs */}
      <section className="bg-[#112240] p-4 rounded-xl border border-blue-900/40 shadow-md mb-6">
        <h2 className="text-[11px] font-bold text-purple-400 tracking-wider uppercase mb-3">arc network activity & verification logs</h2>
        <div className="bg-[#0a192f] p-6 rounded-lg border border-blue-950 text-center text-xs text-slate-500">
          connect wallet to view arc settlement activity.
        </div>
      </section>

      {/* footer section */}
      <footer className="text-center py-4 text-[11px] text-slate-500 border-t border-blue-950">
        <p>arc settlement engine · built for decentralized scale</p>
      </footer>

    </main>
  )
}
