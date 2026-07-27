import { WalletConnect } from '../components/WalletConnect'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      {/* Top Bar with Web3 Wallet & Network Selector */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-blue-500">GiwaSetu</h1>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Multi-Chain</span>
        </div>
        
        {/* Custom Wallet Connection & Network Switcher (GIWA ↔ Arc) */}
        <WalletConnect />
      </header>

      {/* Remaining Dashboard Content */}
    </main>
  )
}
