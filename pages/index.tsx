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
    issueUpId: 'Set Custom UP ID',
    registeredIdLabel: 'Registered UP ID',
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
    noTxConnected: 'No transactions recorded yet for this wallet.',
    noTxDisconnected: 'Connect wallet to view multi-chain history.',
    activityHeader: 'Cross-Chain Activity & Verification Log',
    downloadCsv: 'Download CSV ↗',
    resourcesHeader: 'Ecosystem Protocols & Official Links',
    scanQr: 'Scan QR',
    qrTitle: 'Dynamic Receiver QR Invoice',
    royaltyHeader: 'Universal Royalty & Fee Distribution Engine',
    royaltyDesc: 'Distribute creator fees, builder incentives, or cross-chain royalties across any connected network natively.',
    distributeRoyalty: 'Distribute Royalty',
    txSuccessTitle: 'Transaction Confirmed!',
    txSuccessDesc: 'Your transaction was successfully processed on the network.',
    viewExplorer: 'View on Explorer ↗',
    close: 'Close',
  },
  ko: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN 멀티체인 Web3 허브',
    identityHeader: '유니버셜 멀티체인 신원',
    verified: '검증된 멀티체인 빌더',
    notConnected: '지갑 미연결',
    boundId: '연결된 유니버셜 ID',
    issueUpId: '커스텀 UP ID 설정',
    registeredIdLabel: '등록된 UP ID',
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
    noTxConnected: '이 지갑에 대한 기록된 트랜잭션이 없습니다.',
    noTxDisconnected: '활동 내역을 보려면 지갑을 연결하세요.',
    activityHeader: '크로스체인 활동 및 검증 로그',
    downloadCsv: 'CSV 다운로드 ↗',
    resourcesHeader: '생태계 프로토콜 및 공식 링크',
    scanQr: 'QR 스캔',
    qrTitle: '동적 수신 QR 인보이스',
    royaltyHeader: '유니버셜 로열티 및 수수료 분배 엔진',
    royaltyDesc: '모든 연결된 네트워크에서 크리에이터 수수료, 빌더 인센티브 또는 크로스체인 로열티를 직접 분배합니다.',
    distributeRoyalty: '로열티 분배하기',
    txSuccessTitle: '트랜잭션 승인 완료!',
    txSuccessDesc: '트랜잭션이 네트워크에서 성공적으로 처리되었습니다.',
    viewExplorer: '탐색기에서 보기 ↗',
    close: '닫기',
  },
  hi: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN मल्टी-चेन Web3 हब',
    identityHeader: 'यूनिवर्सल मल्टी-चेन पहचान',
    verified: 'वेरिफाइड मल्टी-चेन बिल्डर',
    notConnected: 'वॉलेट कनेक्ट नहीं है',
    boundId: 'बाउंड यूनिवर्सल ID',
    issueUpId: 'कस्टम UP ID सेट करें',
    registeredIdLabel: 'रजिस्टर्ड UP ID',
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
    noTxConnected: 'इस वॉलेट के लिए कोई ट्रांजैक्शन दर्ज नहीं है।',
    noTxDisconnected: 'गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
    activityHeader: 'क्रॉस-चेन एक्टिविटी और वेरिफिकेशन लॉग',
    downloadCsv: 'CSV डाउनलोड ↗',
    resourcesHeader: 'इकोसिस्टम प्रोटोकॉल और ऑफिशियल लिंक्स',
    scanQr: 'QR स्कैन करें',
    qrTitle: 'डायनामिक रिसीविंग QR इनवॉइस',
    royaltyHeader: 'यूनिवर्सल रॉयल्टी व फ़ीस डिस्ट्रीब्यूशन इंजन',
    royaltyDesc: 'किसी भी कनेक्टेड नेटवर्क पर क्रिएटर फ़ीस, बिल्डर इंसेंटिव या क्रॉस-चेन रॉयल्टी सीधे बाटें।',
    distributeRoyalty: 'रॉयल्टी डिस्ट्रीब्यूट करें',
    txSuccessTitle: 'ट्रांजैक्शन सफल रहा!',
    txSuccessDesc: 'आपका ट्रांजैक्शन नेटवर्क पर सफलतापूर्वक पूरा हो गया है।',
    viewExplorer: 'एक्सप्लोरर पर देखें ↗',
    close: 'बंद करें',
  },
  es: {
    subtitle: 'KR 🇰🇷 ⇄ 🇮🇳 IN Hub Web3 Multicadena',
    identityHeader: 'Identidad Multicadena Universal',
    verified: 'Creador Multicadena Verificado',
    notConnected: 'Billetera No Conectada',
    boundId: 'ID Universal Vinculado',
    issueUpId: 'Configurar UP ID Personalizado',
    registeredIdLabel: 'UP ID Registrado',
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
    noTxConnected: 'No hay transacciones registradas para esta billetera.',
    noTxDisconnected: 'Conecte la billetera para ver el historial.',
    activityHeader: 'Registro de Actividad Multicadena',
    downloadCsv: 'Descargar CSV ↗',
    resourcesHeader: 'Protocolos del Ecosistema y Enlaces Oficiales',
    scanQr: 'Escanear QR',
    qrTitle: 'Factura QR de Recepción Dinámica',
    royaltyHeader: 'Motor Universal de Distribución de Regalías',
    royaltyDesc: 'Distribuya tarifas de creador e incentivos en cualquier red conectada de forma nativa.',
    distributeRoyalty: 'Distribuir Regalías',
    txSuccessTitle: '¡Transacción Confirmada!',
    txSuccessDesc: 'Su transacción se procesó con éxito en la red.',
    viewExplorer: 'Ver en Explorador ↗',
    close: 'Cerrar',
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

interface ModalDetails {
  title: string
  amount: string
  hash: string
  url: string
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

  // Royalty State
  const [royaltyRecipient, setRoyaltyRecipient] = useState('')
  const [royaltyAmount, setRoyaltyAmount] = useState('0.0005')

  // Modal & Audio state
  const [successModal, setSuccessModal] = useState<ModalDetails | null>(null)

  const [customUpId, setCustomUpId] = useState('')
  const [registeredIds, setRegisteredIds] = useState<Record<string, string>>({})
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const currentWallet = address ? address.toLowerCase() : ''
  const isGiwa = chainId === 91342
  const isArc = chainId === 5042002

  let networkName = 'GIWA Sepolia'
  let networkPrefix = 'GIWA'
  let explorerBase = 'https://sepolia-explorer.giwa.io/tx/'

  if (isArc) {
    networkName = 'Arc Testnet'
    networkPrefix = 'ARC'
    explorerBase = 'https://testnet.arcscan.app/tx/'
  } else if (chainId === 1) {
    networkName = 'Ethereum Mainnet'
    networkPrefix = 'ETH'
    explorerBase = 'https://etherscan.io/tx/'
  }

  // Web Audio Chime Sound
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'sine'

      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15) // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3) // G5

      osc2.frequency.setValueAtTime(1046.50, now) // C6

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.1)
      osc1.stop(now + 0.6)
      osc2.stop(now + 0.6)
    } catch (e) {
      console.error('Audio playback failed', e)
    }
  }

  useEffect(() => {
    const savedIds = localStorage.getItem('giwa_registered_upids')
    if (savedIds) {
      try {
        setRegisteredIds(JSON.parse(savedIds))
      } catch (e) {
        console.error('Failed to parse saved UP IDs', e)
      }
    }
  }, [])

  useEffect(() => {
    if (isConnected && currentWallet) {
      const savedHistory = localStorage.getItem(`giwa_tx_history_${currentWallet}`)
      if (savedHistory) {
        try {
          setActivities(JSON.parse(savedHistory))
        } catch (e) {
          console.error('Failed to parse transaction history', e)
          setActivities([])
        }
      } else {
        setActivities([])
      }
    } else {
      setActivities([])
    }
  }, [isConnected, currentWallet])

  const saveActivity = (newAct: ActivityItem) => {
    if (!currentWallet) return
    const updated = [newAct, ...activities]
    setActivities(updated)
    localStorage.setItem(`giwa_tx_history_${currentWallet}`, JSON.stringify(updated))
  }

  const triggerSuccess = (title: string, amountStr: string, hash: string) => {
    const fullExplorerUrl = `${explorerBase}${hash}`
    playSuccessChime()
    setSuccessModal({
      title,
      amount: amountStr,
      hash,
      url: fullExplorerUrl,
    })
  }

  const autoDerivedId = address ? `@${networkPrefix}-${address.slice(-5)}` : '--'
  const userUpId = currentWallet && registeredIds[currentWallet] ? registeredIds[currentWallet] : autoDerivedId

  const handleRegisterUpId = () => {
    if (!currentWallet) {
      setStatusMsg('Please connect your wallet first.')
      return
    }

    let cleanId = customUpId.trim().toLowerCase()
    if (!cleanId) {
      setStatusMsg('Please enter a valid handle.')
      return
    }

    if (!cleanId.startsWith('@')) {
      cleanId = `@${cleanId}`
    }

    if (cleanId.length < 3) {
      setStatusMsg('Handle must be at least 2 characters long.')
      return
    }

    const allExistingValues = Object.values(registeredIds).map(id => id.toLowerCase())
    if (allExistingValues.includes(cleanId) && registeredIds[currentWallet] !== cleanId) {
      setStatusMsg(`Error: ID "${cleanId}" is already taken by another wallet.`)
      return
    }

    const updated = {
      ...registeredIds,
      [currentWallet]: cleanId
    }

    setRegisteredIds(updated)
    localStorage.setItem('giwa_registered_upids', JSON.stringify(updated))
    setCustomUpId('')
    setStatusMsg(`Custom handle updated to ${cleanId}`)
  }

  const handleSimulateScan = () => {
    setIsScannerOpen(true)
    setTimeout(() => {
      setRecipient('0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b')
      setIsScannerOpen(false)
      setStatusMsg('QR Code scanned successfully!')
    }, 1200)
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

      const parsedValue = parseEther(amount && !isNaN(Number(amount)) ? amount : '0.0001')

      const hash = await sendTransactionAsync({
        to: targetAddress,
        value: parsedValue,
      })

      const amtSymbol = `${amount} ${balanceData?.symbol || 'USDC'}`
      const txTitle = `Multi-Chain UPI Payment (${recipient.slice(0, 6)}...${recipient.slice(-4)})`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash)
      setStatusMsg('')
    } catch (err: any) {
      console.error(err)
      setStatusMsg('Transaction failed or cancelled.')
    } finally {
      setTxLoading(false)
    }
  }

  const handleRoyaltyPayout = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }

    const targetAddress = royaltyRecipient.startsWith('0x')
      ? (royaltyRecipient as `0x${string}`)
      : address || '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b'

    try {
      setTxLoading(true)
      setStatusMsg('Processing Royalty Payout...')

      const hash = await sendTransactionAsync({
        to: targetAddress,
        value: parseEther(royaltyAmount && !isNaN(Number(royaltyAmount)) ? royaltyAmount : '0.0005'),
      })

      const amtSymbol = `${royaltyAmount} ${balanceData?.symbol || 'ETH'}`
      const txTitle = `Royalty Distribution (${networkName})`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash)
      setStatusMsg('')
    } catch (err) {
      console.error(err)
      setStatusMsg('Royalty payout failed or cancelled.')
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
      
      const targetAddr = address || '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b'
      const hash = await sendTransactionAsync({
        to: targetAddr,
        value: parseEther('0.00001'),
      })

      setPracticeCount(prev => prev + 1)
      const amtSymbol = `0.00001 ${balanceData?.symbol || 'ETH'}`
      const txTitle = `Test Tx Execution (${networkName})`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash)
      setStatusMsg('')
    } catch (err) {
      console.error(err)
      setStatusMsg('Transaction failed or cancelled.')
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

  const receiveQrData = isConnected && address
    ? `ethereum:${address}@${chainId}?label=${encodeURIComponent(userUpId)}`
    : 'Connect Wallet to Generate Receive QR'

  return (
    <main className="min-h-screen bg-[#0a0d14] text-slate-100 p-4 md:p-8 font-sans relative">
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
              <span className="text-sm font-mono font-semibold text-purple-300">
                {isConnected ? userUpId : '--'}
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

          {/* Custom Handle Input */}
          {isConnected && (
            <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800 flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Set custom handle (e.g. @bhupendra)" 
                value={customUpId}
                onChange={(e) => setCustomUpId(e.target.value)}
                className="bg-[#111625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 flex-1 font-mono"
              />
              <button 
                onClick={handleRegisterUpId}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer"
              >
                {t.issueUpId}
              </button>
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

        {/* Royalty Engine Section */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-purple-900/40 space-y-3 shadow-md">
          <div>
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">{t.royaltyHeader}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.royaltyDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input 
              type="text"
              placeholder="Creator/Builder Address (or leave empty for self)"
              value={royaltyRecipient}
              onChange={(e) => setRoyaltyRecipient(e.target.value)}
              className="sm:col-span-2 bg-[#0b0e17] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            <div className="flex gap-2">
              <input 
                type="text"
                value={royaltyAmount}
                onChange={(e) => setRoyaltyAmount(e.target.value)}
                className="w-1/2 bg-[#0b0e17] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={handleRoyaltyPayout}
                disabled={txLoading || !isConnected}
                className="w-1/2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl py-2 transition-all cursor-pointer"
              >
                {t.distributeRoyalty}
              </button>
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
              className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3.5 py-1.5 rounded-lg transition-all font-medium active:scale-95 cursor-pointer"
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

        {/* Payments Section with QR & Send Scanner */}
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
              Receive QR Invoice
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
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={t.placeholder} 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1 bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
                <button
                  onClick={handleSimulateScan}
                  className="bg-[#0b0e17] border border-slate-700 hover:border-purple-500 text-purple-400 text-xs px-3 rounded-xl transition-all flex items-center gap-1 font-medium cursor-pointer"
                >
                  📷 {t.scanQr}
                </button>
              </div>

              {isScannerOpen && (
                <div className="bg-[#0b0e17] p-4 rounded-xl border border-purple-500/50 text-center text-xs text-purple-300 animate-pulse">
                  Scanning Camera Feed / Processing Image...
                </div>
              )}
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-1/3 bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono transition-all"
                />
                <button 
                  onClick={handlePayment}
                  disabled={txLoading || !isConnected}
                  className="w-2/3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl py-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  {txLoading ? t.processing : `${t.payBtn} (${balanceData?.symbol || 'USDC'})`}
                </button>
              </div>
              
              <p className="text-[10px] text-center text-slate-500">
                Connected Network: {networkName} | Dynamic Explorer Sync Active
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-[#0b0e17] p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t.qrTitle}</p>
              
              <div className="w-40 h-40 bg-slate-900 border-2 border-purple-500/30 mx-auto rounded-xl flex flex-col items-center justify-center p-2 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(receiveQrData)}`} 
                  alt="Receiver QR Code"
                  className="w-32 h-32 rounded bg-white p-1"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-purple-400">{userUpId}</p>
                <p className="text-[11px] font-mono text-slate-400 break-all">{address || 'No wallet connected'}</p>
                <p className="text-[10px] text-emerald-400 font-semibold pt-1">Network: {networkName}</p>
              </div>
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

        {/* Network-Categorized Faucets & Links */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-4">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{t.resourcesHeader}</p>
          
          {/* Arc Protocol Ecosystem */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">Arc Protocol Ecosystem</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <a 
                href="https://testnet.arcscan.app/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-blue-400 transition-all font-medium flex items-center justify-between"
              >
                <span>Arc Testnet Explorer</span>
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
                href="https://www.arc.io/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
              >
                <span>Arc Protocol Docs</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

          {/* GIWA Ecosystem */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">GIWA L2 Ecosystem</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <a 
                href="https://faucet.giwa.io/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#0b0e17] hover:bg-[#151c2e] p-2.5 rounded-xl border border-slate-800 text-emerald-400 transition-all font-medium flex items-center justify-between"
              >
                <span>GIWA Faucet</span>
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
            </div>
          </div>
        </section>

        {/* Activity Log */}
        <section className="bg-[#111625] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{t.activityHeader}</span>
            {isConnected && activities.length > 0 && (
              <button 
                onClick={handleDownloadCSV}
                className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-all cursor-pointer"
              >
                {t.downloadCsv}
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {isConnected ? (
              activities.length > 0 ? (
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
                  {t.noTxConnected}
                </div>
              )
            ) : (
              <div className="bg-[#0b0e17] p-4 rounded-xl border border-slate-800/60 text-center text-slate-500 text-xs">
                {t.noTxDisconnected}
              </div>
            )}
          </div>
        </section>

        {/* Official Social Links & Builder Credits */}
        <footer className="bg-[#111625] p-4 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="flex justify-center items-center gap-6 text-xs text-slate-400">
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-purple-400 transition-all flex items-center gap-1 font-medium"
            >
              <span>𝕏 (Twitter)</span>
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-purple-400 transition-all flex items-center gap-1 font-medium"
            >
              <span>GitHub</span>
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-purple-400 transition-all flex items-center gap-1 font-medium"
            >
              <span>Discord</span>
            </a>
          </div>
          <p className="text-[11px] text-slate-500">
            GIWASETU MULTI-CHAIN PROTOCOL — Settlement Engine for Ethereum • Arc • GIWA
          </p>
        </footer>

      </div>

      {/* SUCCESS MODAL POPUP WITH ANIMATION */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111625] border border-emerald-500/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-4 transform transition-all scale-100">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto border border-emerald-500/40">
              ✓
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{t.txSuccessTitle}</h3>
              <p className="text-xs text-slate-400">{t.txSuccessDesc}</p>
            </div>

            <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800 text-left space-y-1.5 font-mono text-xs">
              <p className="text-slate-400 text-[10px]">DETAILS:</p>
              <p className="text-purple-300 font-semibold">{successModal.title}</p>
              <p className="text-emerald-400 font-bold">{successModal.amount}</p>
              <p className="text-slate-500 text-[10px] truncate">Hash: {successModal.hash}</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a 
                href={successModal.url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-all shadow-md block"
              >
                {t.viewExplorer}
              </a>
              <button 
                onClick={() => setSuccessModal(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition-all font-medium cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
