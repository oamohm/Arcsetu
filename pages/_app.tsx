import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Header() {
  return (
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

      <div className="flex items-center gap-2 justify-end">
        <ConnectButton />
      </div>
    </header>
  )
}
