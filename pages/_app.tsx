'use client'

import React, { useState } from 'react'

export default function Page() {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('0.1')

  return (
    <main className="min-h-screen bg-[#0a192f] text-slate-100 p-3 sm:p-6 font-mono relative overflow-x-hidden">
      
      {/* header section */}
      <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#112240] p-4 rounded-xl border border-blue-900/40 gap-3 shadow-lg mb-6">
        <div className="flex items-center gap-3">
          
          <div className="w-8 h-8 bg-gradient-to-br from-[#f97316] via-indigo-600 to-blue-600 rounded-lg p-[1px] shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#112240] rounded-lg flex items-center justify-center text-[#f97316]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v7M16 14v7" />
              </svg>
            </div>
          </div>
          
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              ARC SETTLEMENT HUB 
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">PRIMARY</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400">programmable usdc settlement engine on the arc network</p>
          </div>
        </div>
      </header>

      {/* transfer module section */}
      <div className="bg-[#112240] p-4 rounded-xl border border-blue-950 shadow-md">
        <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-3">arc usdc transfer</h2>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="send to @arc_id or 0x wallet address" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#0a192f] border border-blue-900/50 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#0a192f] border border-blue-900/50 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-lg transition-colors">
            pay via arc usdc ({amount} usdc)
          </button>
        </div>
      </div>

    </main>
  )
}
