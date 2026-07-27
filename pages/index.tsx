import { useState } from 'react'
import { useAccount, useSendTransaction, useBalance } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface ActivityItem {
  id: string
  title: string
  timestamp: string
  amount: string
  txHash: string
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { sendTransactionAsync } = useSendTransaction()

  const [activeTab, setActiveTab] = useState<'upi' | 'qr' | 'fx'>('upi')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.0001')
  const [practiceCount, setPracticeCount] = useState(0)
  const [stampIssued, setStampIssued] = useState(false)
  const [txLoading, setTxLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const handlePayment = async () => {
    if (!isConnected) {
      alert('कृपया पहले Connect Wallet बटन से अपना वॉलेट जोड़ें!')
      return
    }
    if (!recipient) {
      alert('कृपया प्राप्तकर्ता (UP.ID या Wallet Address) दर्ज करें!')
      return
    }

    try {
      setTxLoading(true)
      setStatusMsg('प्रॉसेस हो रहा है... वॉलेट पुष्टि की प्रतीक्षा है...')
      
      const targetAddress = recipient.startsWith('0x') 
        ? (recipient as `0x${string}`) 
        : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

      const hash = await sendTransactionAsync({
        to: targetAddress,
        value: parseEther(amount || '0.0001'),
      })

      setStatusMsg(`ट्रांजैक्शन सफल! Hash: ${hash.slice(0, 10)}...`)
      
      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: `Web3 UPI (${recipient})`,
        timestamp: new Date().toLocaleTimeString(),
        amount: `${amount} ${balanceData?.symbol || 'USDC'}`,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`
      }
      setActivities([newAct, ...activities])
    } catch (err: any) {
      console.error(err)
      setStatusMsg('ट्रांजैक्शन रद्द कर दिया गया या त्रुटि हुई।')
    } finally {
      setTxLoading(false)
    }
  }

  const handlePracticeTx = async () => {
    if (!isConnected) {
      alert('कृपया पहले Connect Wallet बटन से अपना वॉलेट जोड़ें!')
      return
    }
    try {
      setTxLoading(true)
      setStatusMsg('अभ्यास ट्रांजैक्शन भेजा जा रहा है...')
      
      const hash = await sendTransactionAsync({
        to: address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        value: parseEther('0.00001'),
      })

      setPracticeCount(prev => prev + 1)
      setStatusMsg('अभ्यास ट्रांजैक्शन सफल!')
      
      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: 'Practice Tx Execution',
        timestamp: new Date().toLocaleTimeString(),
        amount: `0.00001 ${balanceData?.symbol || 'USDC'}`,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`
      }
      setActivities([newAct, ...activities])
    } catch (err) {
      console.error(err)
      setStatusMsg('अभ्यास ट्रांजैक्शन विफल।')
    } finally {
      setTxLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (activities.length === 0) {
      alert('डाउनलोड करने के लिए कोई एक्टिविटी हिस्ट्री नहीं है।')
      return
    }
    const headers = "ID,Title,Timestamp,Amount,TxHash\n"
    const rows = activities.map(a => `${a.id},"${a.title}",${a.timestamp},${a.amount},${a.txHash}`).join("\n")
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `giwasetu_activity_${Date.now()}.csv`
    a.click()
  }

  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
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
          
          <ConnectButton showBalance={true} chainStatus="icon" accountStatus="address" />
        </header>

        {statusMsg && (
          <div className="bg-blue-950/60 border border-blue-500/40 text-blue-300 p-3 rounded-xl text-xs flex justify-between items-center">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Identity Layer */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Web3 Identity & Royalties</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isConnected ? 'Verified Dojang Builder' : 'Wallet Not Connected'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Bound UP.ID</span>
              <span className="text-sm font-mono font-semibold text-blue-300">
                {isConnected ? `@${address?.slice(2, 10)}` : '--'}
              </span>
            </div>
            <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Live Balance</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">
                {isConnected && balanceData 
                  ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` 
                  : '--'}
              </span>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Builder Onboarding Workflow</h2>
          
          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">1. Create UP.ID & Wallet</p>
              <p className="text-[10px] text-slate-500">Binds identity to wallet</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded border font-medium ${
              isConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isConnected ? 'Done ✓' : 'Pending'}
            </span>
          </div>

          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">2. Execute Practice Tx</p>
              <p className="text-[10px] text-slate-500">Count: {practiceCount} practice txns</p>
            </div>
            <button 
              onClick={handlePracticeTx}
              disabled={txLoading || !isConnected}
              className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3.5 py-1.5 rounded-lg transition-all font-medium active:scale-95"
            >
              {txLoading ? 'Running...' : 'Run'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">3. Issue Dojang Stamp</p>
              <p className="text-[10px] text-slate-500">Marks onboarding completed</p>
            </div>
            <button 
              onClick={() => isConnected && setStampIssued(!stampIssued)}
              disabled={!isConnected}
              className={`text-xs px-2.5 py-1 rounded border font-medium transition-all ${
                stampIssued 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {stampIssued ? 'Issued ✓' : 'Claim Stamp'}
            </button>
          </div>
        </section>

        {/* Payments */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex border-b border-slate-800 gap-2">
            <button 
              onClick={() => setActiveTab('upi')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'upi' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Web3 UPI Pay
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'qr' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              QR Invoice
            </button>
            <button 
              onClick={() => setActiveTab('fx')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'fx' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              INR ⇄ KRW
            </button>
          </div>

          {activeTab === 'upi' && (
            <div className="space-y-3 pt-2">
              <input 
                type="text" 
                placeholder="Send to @UP.ID or 0x Wallet" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-1/3 bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono transition-all"
                />
                <button 
                  onClick={handlePayment}
                  disabled={txLoading}
                  className="w-2/3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-medium text-xs rounded-xl py-2.5 transition-all shadow-md active:scale-[0.99]"
                >
                  {txLoading ? 'Processing Tx...' : `Pay via Web3 UPI (${balanceData?.symbol || 'USDC'})`}
                </button>
              </div>
              
              <p className="text-[10px] text-center text-slate-500">
                ≈ ₹0.01 INR | ₩0.19 KRW (0.5% Cashback Included)
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-[#0b0e17] p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-32 h-32 bg-slate-800 mx-auto rounded-lg flex items-center justify-center text-slate-500 text-xs border border-slate-700">
                [ QR Code Generator ]
              </div>
              <p className="text-xs text-slate-300 font-mono">Invoice ID: #GIWA-8942</p>
              <p className="text-[10px] text-slate-500">Scan to pay directly from MetaMask / WalletConnect</p>
            </div>
          )}

          {activeTab === 'fx' && (
            <div className="bg-[#0b0e17] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">1 INR (₹) =</span>
                <span className="font-mono text-emerald-400 font-semibold">16.12 KRW (₩)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">1 USDC / ETH =</span>
                <span className="font-mono text-blue-400 font-semibold">₹298,450 INR | ₩4,810,000 KRW</span>
              </div>
              <p className="text-[10px] text-slate-500 text-center pt-1">Cross-Border FX Lock Rate via GIWA Settlement Engine</p>
            </div>
          )}
        </section>

        {/* Faucets */}
        <section className="flex gap-3">
          <a 
            href="https://sepolia-faucet.pk910.de/" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 bg-[#111625] hover:bg-[#161c2e] border border-slate-800 py-2.5 rounded-xl text-xs text-blue-400 font-medium transition-all text-center block"
          >
            Primary Faucet ↗
          </a>
          <a 
            href="https://faucets.chain.link/" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 bg-[#111625] hover:bg-[#161c2e] border border-slate-800 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 font-medium transition-all text-center block"
          >
            Backup Faucet ↗
          </a>
        </section>

        {/* Dynamic Activity Log */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Cross-Border Activity Log</span>
            <button 
              onClick={handleDownloadCSV}
              className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-all"
            >
              Download CSV ↗
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                  <div>
                    <p className="text-emerald-400 font-medium">{act.title}</p>
                    <p className="text-[10px] text-slate-500">{act.timestamp} • {act.amount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-400 hover:underline cursor-pointer text-[10px] font-mono block">
                      {act.txHash}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#0b0e17] p-4 rounded-xl border border-slate-800/60 text-center text-slate-500 text-xs">
                {isConnected ? 'कोई ट्रांजैक्शन नहीं हुआ है।' : 'वॉलेट कनेक्ट करें - कोई एक्टिविटी नहीं है।'}
              </div>
            )}
          </div>
        </section>

        <footer className="text-center text-[11px] text-slate-500 py-2">
          GIWASETU — Korea 🇰🇷 ⇄ 🇮🇳 India Web3 Protocol
        </footer>

      </div>
    </main>
  )
}
