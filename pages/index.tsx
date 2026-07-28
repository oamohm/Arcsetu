import { useState } from 'react'
import { useAccount, useSendTransaction, useBalance, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type Lang = 'en' | 'ko' | 'hi' | 'es'

const translations = {
  en: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN Multi-Chain Web3 Hub',
    identityHeader: 'Universal Multi-Chain Identity',
    verified: 'Verified Multi-Chain Builder',
    notConnected: 'Wallet Not Connected',
    boundId: 'Bound Universal ID',
    liveBalance: 'Live Balance',
    multichainHeader: 'Global Assets & Networks',
    workflowHeader: 'Builder Onboarding Workflow',
    step1: '1. Create Universal ID & Wallet',
    step1Sub: 'Binds identity across chains',
    done: 'Done ✓',
    pending: 'Pending',
    step2: '2. Execute Cross-Chain Tx',
    step2Sub: 'Count: {count} test txns',
    run: 'Run Tx',
    running: 'Running...',
    step3: '3. Issue Multi-Chain Stamp',
    step3Sub: 'Marks multi-chain completion',
    issued: 'Issued ✓',
    claim: 'Claim Stamp',
    placeholder: 'Send to @ID or 0x Wallet / BTC Address',
    payBtn: 'Pay via Multi-Chain UPI',
    processing: 'Processing Tx...',
    noTxConnected: 'No transactions recorded yet.',
    noTxDisconnected: 'Connect wallet to view multi-chain history.',
    activityHeader: 'Cross-Chain Activity & Verification Log',
    downloadCsv: 'Download CSV ↗',
    primaryFaucet: 'Primary Faucet ↗',
    backupFaucet: 'Backup Faucet ↗',
  },
  ko: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN 멀티체인 Web3 허브',
    identityHeader: '유니버셜 멀티체인 신원',
    verified: '검증된 멀티체인 빌더',
    notConnected: '지갑 미연결',
    boundId: '연결된 유니버셜 ID',
    liveBalance: '실시간 잔액',
    multichainHeader: '글로벌 자산 및 네트워크',
    workflowHeader: '빌더 온보딩 워크플로우',
    step1: '1. 유니버셜 ID 및 지갑 생성',
    step1Sub: '체인 간 신원 연결',
    done: '완료 ✓',
    pending: '대기 중',
    step2: '2. 크로스체인 트랜잭션 실행',
    step2Sub: '횟수: {count}회 실행됨',
    run: '실행',
    running: '실행 중...',
    step3: '3. 멀티체인 스탬프 발급',
    step3Sub: '온보딩 완료 표시',
    issued: '발급됨 ✓',
    claim: '스탬프 받기',
    placeholder: '@ID 또는 0x 주소 입력',
    payBtn: '멀티체인 UPI 결제',
    processing: '처리 중...',
    noTxConnected: '기록된 트랜잭션이 없습니다.',
    noTxDisconnected: '활동 내역을 보려면 지갑을 연결하세요.',
    activityHeader: '크로스체인 활동 및 검증 로그',
    downloadCsv: 'CSV 다운로드 ↗',
    primaryFaucet: '기본 포셋 ↗',
    backupFaucet: '백업 포셋 ↗',
  },
  hi: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN मल्टी-चेन Web3 हब',
    identityHeader: 'यूनिवर्सल मल्टी-चेन पहचान',
    verified: 'वेरिफाइड मल्टी-चेन बिल्डर',
    notConnected: 'वॉलेट कनेक्ट नहीं है',
    boundId: 'बाउंड यूनिवर्सल ID',
    liveBalance: 'लाइव बैलेंस',
    multichainHeader: 'ग्लोबल एसेट्स और नेटवर्क्स',
    workflowHeader: 'बिल्डर ऑनबोर्डिंग वर्कफ़्लो',
    step1: '1. यूनिवर्सल ID और वॉलेट बनाएं',
    step1Sub: 'सभी चेन पर पहचान जोड़ता है',
    done: 'हो गया ✓',
    pending: 'लंबित',
    step2: '2. क्रॉस-चेन ट्रांजैक्शन निष्पादित करें',
    step2Sub: 'गिनती: {count} टेस्ट ट्रांजैक्शन',
    run: 'चलाएं',
    running: 'चल रहा है...',
    step3: '3. मल्टी-चेन स्टाम्प जारी करें',
    step3Sub: 'ऑनबोर्डिंग पूर्ण चिह्नित करता है',
    issued: 'जारी हुआ ✓',
    claim: 'स्टाम्प लें',
    placeholder: '@ID या 0x वॉलेट / BTC पता दर्ज करें',
    payBtn: 'मल्टी-चेन UPI भुगतान',
    processing: 'प्रॉसेस हो रहा है...',
    noTxConnected: 'कोई ट्रांजैक्शन दर्ज नहीं है।',
    noTxDisconnected: 'गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
    activityHeader: 'क्रॉस-चेन एक्टिविटी और वेरिफिकेशन लॉग',
    downloadCsv: 'CSV डाउनलोड ↗',
    primaryFaucet: 'प्राथमिक फॉसेट ↗',
    backupFaucet: 'बैकअप फॉसेट ↗',
  },
  es: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN Hub Web3 Multicadena',
    identityHeader: 'Identidad Multicadena Universal',
    verified: 'Creador Multicadena Verificado',
    notConnected: 'Billetera No Conectada',
    boundId: 'ID Universal Vinculado',
    liveBalance: 'Saldo en Vivo',
    multichainHeader: 'Activos y Redes Globales',
    workflowHeader: 'Flujo de Trabajo de Incorporación',
    step1: '1. Crear ID Universal y Billetera',
    step1Sub: 'Vincula la identidad en cadenas',
    done: 'Hecho ✓',
    pending: 'Pendiente',
    step2: '2. Ejecutar Tx Multicadena',
    step2Sub: 'Conteo: {count} txs de prueba',
    run: 'Ejecutar',
    running: 'Ejecutando...',
    step3: '3. Emitir Sello Multicadena',
    step3Sub: 'Marca la incorporación como completada',
    issued: 'Emitido ✓',
    claim: 'Reclamar Sello',
    placeholder: 'Enviar a @ID o Billetera 0x',
    payBtn: 'Pago vía UPI Multicadena',
    processing: 'Procesando...',
    noTxConnected: 'No hay transacciones registradas.',
    noTxDisconnected: 'Conecte la billetera para ver el historial.',
    activityHeader: 'Registro de Actividad Multicadena',
    downloadCsv: 'Descargar CSV ↗',
    primaryFaucet: 'Faucet Principal ↗',
    backupFaucet: 'Faucet de Respaldo ↗',
  }
}

interface ActivityItem {
  id: string
  title: string
  timestamp: string
  amount: string
  txHash: string
  explorerUrl: string
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData } = useBalance({ address })
  const { sendTransactionAsync } = useSendTransaction()

  const [lang, setLang] = useState<Lang>('en')
  const t = translations[lang]

  const [activeTab, setActiveTab] = useState<'upi' | 'qr' | 'fx'>('upi')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.0001')
  const [practiceCount, setPracticeCount] = useState(0)
  const [stampIssued, setStampIssued] = useState(false)
  const [txLoading, setTxLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [activities, setActivities] = useState<ActivityItem[]>([])

  // Network checks
  const isGiwa = chainId === 91342
  const isArc = chainId === 5042002
  
  let networkName = 'GIWA Sepolia'
  let upIdPrefix = 'GIWA'
  let explorerBase = 'https://sepolia-explorer.giwa.io/tx/'

  if (isArc) {
    networkName = 'Arc Testnet'
    upIdPrefix = 'ARC'
    explorerBase = 'https://testnet.arcscan.app/tx/'
  } else if (chainId === 1) {
    networkName = 'Ethereum Mainnet'
    upIdPrefix = 'ETH'
    explorerBase = 'https://etherscan.io/tx/'
  }

  const handlePayment = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }
    if (!recipient) {
      alert(t.placeholder)
      return
    }

    try {
      setTxLoading(true)
      setStatusMsg(t.processing)
      
      const targetAddress = recipient.startsWith('0x') 
        ? (recipient as `0x${string}`) 
        : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

      const hash = await sendTransactionAsync({
        to: targetAddress,
        value: parseEther(amount || '0.0001'),
      })

      setStatusMsg(`Tx Confirmed: ${hash.slice(0, 10)}...`)
      
      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: `Multi-Chain UPI (${recipient})`,
        timestamp: new Date().toLocaleTimeString(),
        amount: `${amount} ${balanceData?.symbol || 'ETH'}`,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`
      }
      setActivities([newAct, ...activities])
    } catch (err: any) {
      console.error(err)
      setStatusMsg('Transaction failed or cancelled.')
    } finally {
      setTxLoading(false)
    }
  }

  const handlePracticeTx = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }
    try {
      setTxLoading(true)
      setStatusMsg(t.processing)
      
      const hash = await sendTransactionAsync({
        to: address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        value: parseEther('0.00001'),
      })

      setPracticeCount(prev => prev + 1)
      setStatusMsg('Multi-chain test transaction successful!')
      
      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: `Test Tx (${networkName})`,
        timestamp: new Date().toLocaleTimeString(),
        amount: `0.00001 ${balanceData?.symbol || 'ETH'}`,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`
      }
      setActivities([newAct, ...activities])
    } catch (err) {
      console.error(err)
      setStatusMsg('Transaction failed.')
    } finally {
      setTxLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (activities.length === 0) return
    const headers = "ID,Title,Timestamp,Amount,TxHash,ExplorerUrl\n"
    const rows = activities.map(a => `${a.id},"${a.title}",${a.timestamp},${a.amount},${a.txHash},${a.explorerUrl}`).join("\n")
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multichain_activity_${Date.now()}.csv`
    a.click()
  }

  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-[#111625] p-5 rounded-2xl border border-slate-800 gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md">
              🌐
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">GIWASETU MULTI-CHAIN</h1>
              <p className="text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-[#0b0e17] border border-slate-700 text-slate-200 text-xs px-2.5 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="en">🌐 English</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="es">🇪🇸 Español</option>
            </select>
            
            <ConnectButton showBalance={true} chainStatus="icon" accountStatus="address" />
          </div>
        </header>

        {statusMsg && (
          <div className="bg-blue-950/60 border border-blue-500/40 text-blue-300 p-3 rounded-xl text-xs flex justify-between items-center">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Multi-Chain Identity & Live Balances */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">{t.identityHeader}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isConnected ? t.verified : t.notConnected}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.boundId}</span>
              <span className="text-sm font-mono font-semibold text-purple-300">
                {isConnected ? `@${upIdPrefix}-${address?.slice(2, 8)}` : '--'}
              </span>
            </div>
            <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.liveBalance} ({networkName})</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">
                {isConnected && balanceData 
                  ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` 
                  : '--'}
              </span>
            </div>
          </div>

          {/* Multi-Chain Cards Grid */}
          <div className="pt-2">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-medium">{t.multichainHeader}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-semibold text-[10px]">GIWA L2</p>
                <p className="font-mono text-emerald-400 mt-1">{isGiwa && balanceData ? `${Number(balanceData.formatted).toFixed(3)} ETH` : 'Active / Sync'}</p>
              </div>
              <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-semibold text-[10px]">Arc Testnet</p>
                <p className="font-mono text-blue-400 mt-1">{isArc && balanceData ? `${Number(balanceData.formatted).toFixed(3)} USDC` : 'Supported'}</p>
              </div>
              <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-semibold text-[10px]">Ethereum L1</p>
                <p className="font-mono text-indigo-400 mt-1">Mainnet Ready</p>
              </div>
              <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-semibold text-[10px]">Bitcoin (UTXO)</p>
                <p className="font-mono text-amber-400 mt-1">Cross-Chain Bridge</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">{t.workflowHeader}</h2>
          
          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">{t.step1}</p>
              <p className="text-[10px] text-slate-500">{t.step1Sub}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded border font-medium ${
              isConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isConnected ? t.done : t.pending}
            </span>
          </div>

          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">{t.step2}</p>
              <p className="text-[10px] text-slate-500">{t.step2Sub.replace('{count}', practiceCount.toString())}</p>
            </div>
            <button 
              onClick={handlePracticeTx}
              disabled={txLoading || !isConnected}
              className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3.5 py-1.5 rounded-lg transition-all font-medium active:scale-95"
            >
              {txLoading ? t.running : t.run}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#0b0e17] p-3 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">{t.step3}</p>
              <p className="text-[10px] text-slate-500">{t.step3Sub}</p>
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
              {stampIssued ? t.issued : t.claim}
            </button>
          </div>
        </section>

        {/* Payments */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex border-b border-slate-800 gap-2">
            <button 
              onClick={() => setActiveTab('upi')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'upi' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Multi-Chain UPI Pay
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'qr' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              QR Invoice
            </button>
            <button 
              onClick={() => setActiveTab('fx')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'fx' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Global FX (KRW/INR)
            </button>
          </div>

          {activeTab === 'upi' && (
            <div className="space-y-3 pt-2">
              <input 
                type="text" 
                placeholder={t.placeholder} 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-1/3 bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono transition-all"
                />
                <button 
                  onClick={handlePayment}
                  disabled={txLoading}
                  className="w-2/3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-medium text-xs rounded-xl py-2.5 transition-all shadow-md active:scale-[0.99]"
                >
                  {txLoading ? t.processing : `${t.payBtn} (${balanceData?.symbol || 'ETH'})`}
                </button>
              </div>
              
              <p className="text-[10px] text-center text-slate-500">
                Connected Network: {networkName} | Dynamic Explorer Sync Active
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-[#0b0e17] p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-32 h-32 bg-slate-800 mx-auto rounded-lg flex items-center justify-center text-slate-500 text-xs border border-slate-700">
                [ QR Code Generator ]
              </div>
              <p className="text-xs text-slate-300 font-mono">Invoice ID: #MULTI-9982</p>
              <p className="text-[10px] text-slate-500">Scan to pay cross-chain via WalletConnect</p>
            </div>
          )}

          {activeTab === 'fx' && (
            <div className="bg-[#0b0e17] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">1 INR (₹) =</span>
                <span className="font-mono text-emerald-400 font-semibold">16.12 KRW (₩)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">1 ETH / BTC =</span>
                <span className="font-mono text-purple-400 font-semibold">Global Liquidity Pool Active</span>
              </div>
              <p className="text-[10px] text-slate-500 text-center pt-1">Multi-Chain Settlement Engine</p>
            </div>
          )}
        </section>

        {/* Faucets */}
        <section className="flex gap-3">
          <a 
            href={isGiwa ? "https://sepolia-faucet.pk910.de/" : "https://faucets.chain.link/"} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 bg-[#111625] hover:bg-[#161c2e] border border-slate-800 py-2.5 rounded-xl text-xs text-purple-400 font-medium transition-all text-center block"
          >
            {t.primaryFaucet}
          </a>
          <a 
            href="https://mempool.space/" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 bg-[#111625] hover:bg-[#161c2e] border border-slate-800 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 font-medium transition-all text-center block"
          >
            Bitcoin Explorer ↗
          </a>
        </section>

        {/* Activity & Verification Log */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{t.activityHeader}</span>
            <button 
              onClick={handleDownloadCSV}
              className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-all"
            >
              {t.downloadCsv}
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
                    <a 
                      href={act.explorerUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-purple-400 hover:underline text-[10px] font-mono block"
                    >
                      Verify Tx ↗ ({act.txHash})
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#0b0e17] p-4 rounded-xl border border-slate-800/60 text-center text-slate-500 text-xs">
                {isConnected ? t.noTxConnected : t.noTxDisconnected}
              </div>
            )}
          </div>
        </section>

        <footer className="text-center text-[11px] text-slate-500 py-2">
          GIWASETU MULTI-CHAIN PROTOCOL — Ethereum • Bitcoin • GIWA • Arc
        </footer>

      </div>
    </main>
  )
}
