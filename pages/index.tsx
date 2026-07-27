import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()

  const [activeTab, setActiveTab] = useState<'upi' | 'qr' | 'fx'>('upi')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.0001')

  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-[#111625] p-5 rounded-2xl border border-slate-800 gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">GIWASETU</h1>
              <p className="text-xs text-slate-400">KR 🇰🇷 ⇄ 🇮🇳 IN Web3 Cross-Border Hub</p>
            </div>
          </div>
          
          {/* Wallet Connection & Switcher */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 bg-[#0b0e17] px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-emerald-400 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {chains.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => switchChain({ chainId: c.id })}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      chain?.id === c.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
                <button 
                  onClick={() => disconnect()}
                  className="text-red-400 text-[10px] ml-1 hover:underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-xl font-medium"
                  >
                    Connect {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Web3 Identity & Royalties */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Web3 Identity & Royalties</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              Verified Dojang Builder
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Bound UP.ID</span>
              <span className="text-sm font-mono font-semibold text-blue-300">@Bhupendrxsingh</span>
            </div>
            <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Dojang Royalty Earned</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">+0.000002 TEST</span>
            </div>
          </div>
        </section>

        {/* Builder Onboarding Workflow */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Builder Onboarding Workflow</h2>
          
          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">1. Create UP.ID & Wallet</p>
              <p className="text-[10px] text-slate-500">Binds identity to wallet</p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Done ✓</span>
          </div>

          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">2. Execute Practice Tx</p>
              <p className="text-[10px] text-slate-500">Count: 3 practice txns</p>
            </div>
            <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-all">Run</button>
          </div>

          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">3. Issue Dojang Stamp</p>
              <p className="text-[10px] text-slate-500">Marks onboarding completed</p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Issued ✓</span>
          </div>
        </section>

        {/* Payment & Settlement Layer */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex border-b border-slate-800 gap-2">
            <button 
              onClick={() => setActiveTab('upi')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'upi' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
              }`}
            >
              Web3 UPI Pay
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'qr' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
              }`}
            >
              QR Invoice
            </button>
            <button 
              onClick={() => setActiveTab('fx')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'fx' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
              }`}
            >
              INR ⇄ KRW
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <input 
              type="text" 
              placeholder="Send to @UP.ID or 0x Wallet" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-1/3 bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl py-2.5 transition-all shadow-md active:scale-[0.99]"
              >
                Pay via Web3 UPI ({chain?.nativeCurrency?.symbol || 'ETH'})
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-500">
              ≈ ₹0.01 INR | ₩0.19 KRW (0.5% Cashback Included)
            </p>
          </div>
        </section>

        {/* Faucet Controls */}
        <section className="flex gap-3">
          <button className="flex-1 bg-[#111625] hover:bg-[#161c2e] border border-slate-800 py-2.5 rounded-xl text-xs text-blue-400 font-medium transition-all">
            Primary Faucet ↗
          </button>
          <button className="flex-1 bg-[#111625] hover:bg-[#161c2e] border border-slate-800 py-2.5 rounded-xl text-xs text-slate-400 font-medium transition-all">
            Backup Faucet ↗
          </button>
        </section>

        {/* Activity Log */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Cross-Border Activity Log</span>
            <button className="text-[10px] text-slate-400 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">Download CSV ↗</button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
              <div>
                <p className="text-emerald-400 font-medium">Web3 UPI (@Bhupendrxsinghji)</p>
                <p className="text-[10px] text-slate-500">10:17:18 PM • 0.0001 TEST</p>
              </div>
              <span className="text-blue-400 hover:underline cursor-pointer text-[10px]">View ↗</span>
            </div>

            <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
              <div>
                <p className="text-slate-300 font-medium">Practice Tx</p>
                <p className="text-[10px] text-slate-500">7:53:44 PM • 0.0001 TEST</p>
              </div>
              <span className="text-blue-400 hover:underline cursor-pointer text-[10px]">View ↗</span>
            </div>
          </div>
        </section>

        <footer className="text-center text-[11px] text-slate-500 py-2">
          GIWASETU — Korea 🇰🇷 ⇄ 🇮🇳 India Web3 Protocol
        </footer>

      </div>
    </main>
  )
}
