import React from 'react'

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#112240] p-4 rounded-xl border border-blue-900/40 gap-3 shadow-lg font-mono">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg flex items-center justify-center text-[#f97316] p-1.5 shrink-0 shadow-sm">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0-4 4-8 8-8s8 4 8 8M6 20h12M6 12v8M18 12v8M12 4v4" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
            Arc Settlement Hub 
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">PRIMARY</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400">programmable usdc settlement engine on the arc network</p>
        </div>
      </div>
    </header>
  )
}
