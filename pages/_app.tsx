export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a192f] text-slate-100 p-3 sm:p-6 font-mono relative overflow-x-hidden">
      
      {/* header section */}
      <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#112240] p-4 rounded-xl border border-blue-900/40 gap-3 shadow-lg mb-6">
        <div className="flex items-center gap-3">
          
          {/* bridge icon with gradient border */}
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-amber-500 rounded-lg p-[1px] shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#112240] rounded-lg flex items-center justify-center text-amber-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c0-4 4-8 8-8s8 4 8 8M6 20h12M6 12v8M18 12v8M12 4v4" />
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

    </main>
  )
}
