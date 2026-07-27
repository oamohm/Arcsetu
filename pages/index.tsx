import { useState, useEffect } from 'react'
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
    issueUpId: 'Register GIWA UP ID',
    registeredIdLabel: 'Registered GIWA UP ID (Permanent)',
    liveBalance: 'Live Balance',
    multichainHeader: 'Global Assets & Networks',
    workflowHeader: 'Builder Onboarding Workflow',
    step1: '1. Create Universal ID & Wallet',
    step1Sub: 'Binds identity deterministically across chains',
    done: 'Done ✓',
    pending: 'Pending',
    step2: '2. Execute Cross-Chain Tx',
    step2Sub: 'Count: {count} test txns',
    run: 'Run Tx',
    running: 'Running...',
    step3: '3. Issue Multi-Chain Stamp (Dojang)',
    step3Sub: 'Marks multi-chain verification',
    issued: 'Issued ✓',
    claim: 'Issue Dojang',
    placeholder: 'Send to @UP_ID or 0x Wallet / BTC Address',
    payBtn: 'Pay via Multi-Chain UPI',
    processing: 'Processing Tx...',
    noTxConnected: 'No transactions recorded yet.',
    noTxDisconnected: 'Connect wallet to view multi-chain history.',
    activityHeader: 'Cross-Chain Activity & Verification Log',
    downloadCsv: 'Download CSV ↗',
    resourcesHeader: 'Official Faucets & Protocol Links',
  },
  ko: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN 멀티체인 Web3 허브',
    identityHeader: '유니버셜 멀티체인 신원',
    verified: '검증된 멀티체인 빌더',
    notConnected: '지갑 미연결',
    boundId: '연결된 유니버셜 ID',
    issueUpId: 'GIWA UP ID 등록',
    registeredIdLabel: '등록된 GIWA UP ID (영구)',
    liveBalance: '실시간 잔액',
    multichainHeader: '글로벌 자산 및 네트워크',
    workflowHeader: '빌더 온보딩 워크플로우',
    step1: '1. 유니버셜 ID 및 지갑 생성',
    step1Sub: '체인 간 신원 확정적 연결',
    done: '완료 ✓',
    pending: '대기 중',
    step2: '2. 크로스체인 트랜잭션 실행',
    step2Sub: '횟수: {count}회 실행됨',
    run: '실행',
    running: '실행 중...',
    step3: '3. 멀티체인 도장 발급',
    step3Sub: '온보딩 검증 완료 표시',
    issued: '발급됨 ✓',
    claim: '도장 발급받기',
    placeholder: '@UP_ID 또는 0x 주소 입력',
    payBtn: '멀티체인 UPI 결제',
    processing: '처리 중...',
    noTxConnected: '기록된 트랜잭션이 없습니다.',
    noTxDisconnected: '활동 내역을 보려면 지갑을 연결하세요.',
    activityHeader: '크로스체인 활동 및 검증 로그',
    downloadCsv: 'CSV 다운로드 ↗',
    resourcesHeader: '공식 포셋 및 프로토콜 링크',
  },
  hi: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN मल्टी-चेन Web3 हब',
    identityHeader: 'यूनिवर्सल मल्टी-चेन पहचान',
    verified: 'वेरिफाइड मल्टी-चेन बिल्डर',
    notConnected: 'वॉलेट कनेक्ट नहीं है',
    boundId: 'बाउंड यूनिवर्सल ID',
    issueUpId: 'GIWA UP ID रजिस्टर करें',
    registeredIdLabel: 'रजिस्टर्ड GIWA UP ID (स्थायी)',
    liveBalance: 'लाइव बैलेंस',
    multichainHeader: 'ग्लोबल एसेट्स और नेटवर्क्स',
    workflowHeader: 'बिल्डर ऑनबोर्डिंग वर्कफ़्लो',
    step1: '1. यूनिवर्सल ID और वॉलेट बनाएं',
    step1Sub: 'सभी चेन पर पहचान सुरक्षित रूप से जोड़ता है',
    done: 'हो गया ✓',
    pending: 'लंबित',
    step2: '2. क्रॉस-चेन ट्रांजैक्शन निष्पादित करें',
    step2Sub: 'गिनती: {count} टेस्ट ट्रांजैक्शन',
    run: 'चलाएं',
    running: 'चल रहा है...',
    step3: '3. मल्टी-चेन स्टाम्प (Dojang) जारी करें',
    step3Sub: 'मल्टी-चेन वेरिफिकेशन पूर्ण चिह्नित करता है',
    issued: 'जारी हुआ ✓',
    claim: 'Dojang जारी करें',
    placeholder: '@UP_ID या 0x वॉलेट / BTC पता दर्ज करें',
    payBtn: 'मल्टी-चेन UPI भुगतान',
    processing: 'प्रॉसेस हो रहा है...',
    noTxConnected: 'कोई ट्रांजैक्शन दर्ज नहीं है।',
    noTxDisconnected: 'गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
    activityHeader: 'क्रॉस-चेन एक्टिविटी और वेरिफिकेशन लॉग',
    downloadCsv: 'CSV डाउनलोड ↗',
    resourcesHeader: 'ऑफ़िशियल फॉसेट और प्रोटोकॉल लिंक्स',
  },
  es: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN Hub Web3 Multicadena',
    identityHeader: 'Identidad Multicadena Universal',
    verified: 'Creador Multicadena Verificado',
    notConnected: 'Billetera No Conectada',
    boundId: 'ID Universal Vinculado',
    issueUpId: 'Registrar GIWA UP ID',
    registeredIdLabel: 'GIWA UP ID Registrado (Permanente)',
    liveBalance: 'Saldo en Vivo',
    multichainHeader: 'Activos y Redes Globales',
    workflowHeader: 'Flujo de Trabajo de Incorporación',
    step1: '1. Crear ID Universal y Billetera',
    step1Sub: 'Vincula la identidad en cadenas de forma determinista',
    done: 'Hecho ✓',
    pending: 'Pendiente',
    step2: '2. Ejecutar Tx Multicadena',
    step2Sub: 'Conteo: {count} txs de prueba',
    run: 'Ejecutar',
    running: 'Ejecutando...',
    step3: '3. Emitir Sello Multicadena (Dojang)',
    step3Sub: 'Marca la verificación completada',
    issued: 'Emitido ✓',
    claim: 'Emitir Dojang',
    placeholder: 'Enviar a @UP_ID o Billetera 0x',
    payBtn: 'Pago vía UPI Multicadena',
    processing: 'Procesando...',
    noTxConnected: 'No hay transacciones registradas.',
    noTxDisconnected: 'Conecte la billetera para ver el historial.',
    activityHeader: 'Registro de Actividad Multicadena',
    downloadCsv: 'Descargar CSV ↗',
    resourcesHeader: 'Enlaces Oficiales de Faucets y Protocolo',
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
  const [practiceCount, setPracticeCount] = useState(1)
  const [stampIssued, setStampIssued] = useState(true)
  const [txLoading, setTxLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  // Unique UP ID state mapping: { [walletAddress]: "@unique_id" }
  const [customUpId, setCustomUpId] = useState('')
  const [registeredIds, setRegisteredIds] = useState<Record<string, string>>({})

  // Load stored IDs on initial render
  useEffect(() => {
    const saved = localStorage.getItem('giwa_registered_upids')
    if (saved) {
      try {
        setRegisteredIds(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved UP IDs', e)
      }
    }
  }, [])

  const currentWallet = address ? address.toLowerCase() : ''
  const userUpId = currentWallet ? registeredIds[currentWallet] : null
  const hasExistingId = Boolean(userUpId)

  const isGiwa = chainId === 91342
  const isArc = chainId === 5042002

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      title: 'Multi-Chain UPI (0x85Bb...A67b)',
      timestamp: '2:30:02 AM',
      amount: '4 USDC',
      txHash: '0x1ef2...e694',
      explorerUrl: 'https://testnet.arcscan.app/tx/0x1ef259c938932fec8af0443e729165b59e0fa92c7be790a5ec26d6294a55e694'
    },
    {
      id: '2',
      title: 'Test Tx (GIWA Sepolia)',
      timestamp: '2:27:51 AM',
      amount: '0.00001 ETH',
      txHash: '0x4f8f...28f3',
      explorerUrl: 'https://sepolia-explorer.giwa.io/tx/0x4f8f28f3'
    }
  ])

  let networkName = 'GIWA Sepolia'
  let explorerBase = 'https://sepolia-explorer.giwa.io/tx/'

  if (isArc) {
    networkName = 'Arc Testnet'
    explorerBase = 'https://testnet.arcscan.app/tx/'
  } else if (chainId === 1) {
    networkName = 'Ethereum Mainnet'
    explorerBase = 'https://etherscan.io/tx/'
  }

  // Check uniqueness and handle strict registration rules
  const handleRegisterUpId = () => {
    if (!currentWallet) {
      setStatusMsg('Please connect your wallet first.')
      return
    }

    if (hasExistingId) {
      setStatusMsg('Wallet already has a registered UP ID. Duplicates not allowed.')
      return
    }

    let cleanId = customUpId.trim().toLowerCase()
    if (!cleanId) {
      setStatusMsg('Please enter a valid UP ID.')
      return
    }

    if (!cleanId.startsWith('@')) {
      cleanId = `@${cleanId}`
    }

    if (cleanId.length < 3) {
      setStatusMsg('UP ID must be at least 2 characters long.')
      return
    }

    // Check across all registered IDs to prevent duplicates
    const allExistingValues = Object.values(registeredIds).map(id => id.toLowerCase())
    if (allExistingValues.includes(cleanId)) {
      setStatusMsg(`Error: ID "${cleanId}" is already taken by another wallet. Choose a unique ID.`)
      return
    }

    // Register & store permanently for this wallet
    const updated = {
      ...registeredIds,
      [currentWallet]: cleanId
    }

    setRegisteredIds(updated)
    localStorage.setItem('giwa_registered_upids', JSON.stringify(updated))
    setCustomUpId('')
    setStatusMsg(`Success: ${cleanId} bound permanently to ${currentWallet.slice(0, 6)}...${currentWallet.slice(-4)}`)
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
        : '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b'

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
        to: address || '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b',
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
    const url = window.URL.createObjectURL ? window.URL.createObjectURL(blob) : ''
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

        {/* Identity Section */}
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
              <span className={`text-sm font-mono font-semibold ${hasExistingId ? 'text-purple-300' : 'text-slate-500 italic'}`}>
                {isConnected ? (hasExistingId ? userUpId : 'Not Registered') : '--'}
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

          {/* Registration Input: Only visible when connected & no ID bound yet */}
          {isConnected && (
            <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800 flex gap-2 items-center">
              {hasExistingId ? (
                <div className="w-full text-xs text-slate-400 py-1 flex justify-between items-center px-1">
                  <span>{t.registeredIdLabel}:</span>
                  <span className="font-mono text-purple-400 font-semibold">{userUpId}</span>
                </div>
              ) : (
                <>
                  <input 
                    type="text" 
                    placeholder="Enter unique UP ID (e.g. @upendra)" 
                    value={customUpId}
                    onChange={(e) => setCustomUpId(e.target.value)}
                    className="bg-[#111625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 flex-1"
                  />
                  <button 
                    onClick={handleRegisterUpId}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                  >
                    {t.issueUpId}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Ecosystem Cards */}
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

        {/* Onboarding Workflow */}
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

        {/* Faucets & Links */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{t.resourcesHeader}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <a 
              href="https://faucet.giwa.io/" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-purple-400 transition-all font-medium flex items-center justify-between"
            >
              <span>GIWA Faucet</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://faucet.circle.com/" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-blue-400 transition-all font-medium flex items-center justify-between"
            >
              <span>Circle USDC Faucet</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="http://sepolia-playground.giwa.io" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-emerald-400 transition-all font-medium flex items-center justify-between"
            >
              <span>GIWA Playground</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://faucet.lambda256.io/" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>Lambda Faucet</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://giwa.io/gasok" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>GIWA Gasok Docs</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://www.arc.io/" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>Arc Protocol</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </section>

        {/* Activity Log */}
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
