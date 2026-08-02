import { useState, useEffect, useRef } from 'react'
import { useAccount, useSendTransaction, useBalance, useChainId, useWriteContract } from 'wagmi'
import { parseEther, parseUnits, erc20Abi } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Html5QrcodeScanner } from 'html5-qrcode'

type Lang = 'en' | 'ko' | 'hi' | 'es'

const translations = {
  en: {
    subtitle: 'Programmable USDC Settlement Engine on Arc Network',
    identityHeader: 'Arc Multi-Chain Identity',
    verified: 'Verified Arc Builder',
    notConnected: 'Wallet Disconnected',
    boundId: 'Bound Arc UP ID',
    issueUpId: 'Register Handle',
    liveBalance: 'Arc Treasury Balance',
    multichainHeader: 'Arc Ecosystem Asset Routing (Interactive)',
    workflowHeader: 'Arc Builder Onboarding Workflow',
    step1: '1. Bind Arc Identity & Wallet',
    step1Sub: 'Deterministically registers identity on Arc Network',
    done: 'Done ✓',
    pending: 'Pending',
    step2: '2. Execute Arc USDC Settlement',
    step2Sub: 'Executed: {count} settlement txns',
    run: 'Run Settlement',
    running: 'Executing...',
    step3: '3. Claim Arc Builder Stamp',
    step3Sub: 'Issues Arc ecosystem verification badge',
    issued: 'Issued ✓',
    claim: 'Claim Stamp',
    placeholder: 'Send to @ARC_ID or 0x Wallet Address',
    payBtn: 'Pay via Arc USDC',
    processing: 'Processing Arc Settlement...',
    noTxConnected: 'No Arc settlement logs recorded for this wallet.',
    noTxDisconnected: 'Connect wallet to view Arc settlement activity.',
    activityHeader: 'Arc Network Activity & Verification Logs',
    downloadCsv: 'Export CSV ↗',
    resourcesHeader: 'Arc Ecosystem Infrastructure Links',
    scanQr: 'Scan QR',
    closeQr: 'Close Camera',
    qrTitle: 'Arc Dynamic POS QR Invoice',
    royaltyHeader: 'Arc Programmable Fee Engine',
    royaltyDesc: 'Distribute creator fees, split payments, or send cross-chain royalties natively on Arc.',
    distributeRoyalty: 'Distribute Fee',
    txSuccessTitle: 'Arc Settlement Confirmed',
    txSuccessDesc: 'Your transaction was settled with sub-second finality on Arc Testnet.',
    viewExplorer: 'View on ArcScan ↗',
    close: 'Close',
  },
  hi: {
    subtitle: 'आर्क नेटवर्क पर प्रोग्रामेबल USDC सेटलमेंट इंजन',
    identityHeader: 'आर्क मल्टी-चैन पहचान',
    verified: 'वेरिफाइड आर्क बिल्डर',
    notConnected: 'वॉलेट कनेक्ट नहीं है',
    boundId: 'बाउंड आर्क UP ID',
    issueUpId: 'हैंडल रजिस्टर करें',
    liveBalance: 'आर्क ट्रेजरी बैलेंस',
    multichainHeader: 'आर्क इकोसिस्टम एसेट रूटिंग (इंटरैक्टिव)',
    workflowHeader: 'आर्क बिल्डर ऑनबोर्डिंग वर्कफ़्लो',
    step1: '1. आर्क पहचान और वॉलेट बाइंड करें',
    step1Sub: 'आर्क नेटवर्क पर पहचान सुरक्षित रूप से दर्ज करता है',
    done: 'पूर्ण ✓',
    pending: 'लंबित',
    step2: '2. आर्क USDC सेटलमेंट निष्पादित करें',
    step2Sub: 'निष्पादित: {count} सेटलमेंट',
    run: 'सेटलमेंट चलाएं',
    running: 'निष्पादित हो रहा है...',
    step3: '3. आर्क बिल्डर स्टैम्प क्लेम करें',
    step3Sub: 'आर्क इकोसिस्टम सत्यापन बैज जारी करता है',
    issued: 'जारी हुआ ✓',
    claim: 'स्टैम्प क्लेम करें',
    placeholder: '@ARC_ID या 0x वॉलेट पता दर्ज करें',
    payBtn: 'आर्क USDC द्वारा भुगतान करें',
    processing: 'आर्क सेटलमेंट प्रॉसेस हो रहा है...',
    noTxConnected: 'इस वॉलेट के लिए कोई आर्क सेटलमेंट दर्ज नहीं है।',
    noTxDisconnected: 'गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
    activityHeader: 'आर्क नेटवर्क गतिविधि और सत्यापन लॉग',
    downloadCsv: 'CSV एक्सपोर्ट ↗',
    resourcesHeader: 'आर्क इकोसिस्टम इंफ्रास्ट्रक्चर लिंक्स',
    scanQr: 'QR स्कैन करें',
    closeQr: 'कैमरा बंद करें',
    qrTitle: 'आर्क डायनामिक POS QR इनवॉइस',
    royaltyHeader: 'आर्क प्रोग्रामेबल फ़ीस इंजन',
    royaltyDesc: 'क्रिएटर फ़ीस या पेमेंट स्प्लिट आर्क नेटवर्क पर सीधे भेजें।',
    distributeRoyalty: 'फ़ीस डिस्ट्रीब्यूट करें',
    txSuccessTitle: 'आर्क सेटलमेंट सफल',
    txSuccessDesc: 'आर्क टेस्टनेट पर आपका ट्रांजैक्शन तेजी से सेटल हो गया है।',
    viewExplorer: 'ArcScan पर देखें ↗',
    close: 'बंद करें',
  },
  ko: {
    subtitle: 'Arc 네트워크 기반 프로그래머블 USDC 정산 엔진',
    identityHeader: 'Arc 멀티체인 신원',
    verified: '검증된 Arc 빌더',
    notConnected: '지갑 연결해제됨',
    boundId: '연결된 Arc UP ID',
    issueUpId: '핸들 등록',
    liveBalance: 'Arc 실시간 잔액',
    multichainHeader: 'Arc 생태계 자산 라우팅 (대화형)',
    workflowHeader: 'Arc 빌더 온보딩 워크플로우',
    step1: '1. Arc 신원 및 지갑 연결',
    step1Sub: 'Arc 네트워크에서 확정적 신원 등록',
    done: '완료 ✓',
    pending: '대기 중',
    step2: '2. Arc USDC 정산 실행',
    step2Sub: '실행 횟수: {count}회',
    run: '정산 실행',
    running: '실행 중...',
    step3: '3. Arc 빌더 스탬프 발급',
    step3Sub: 'Arc 생태계 검증 배지 발급',
    issued: '발급됨 ✓',
    claim: '스탬프 받기',
    placeholder: '@ARC_ID 또는 0x 지갑 주소 입력',
    payBtn: 'Arc USDC 결제',
    processing: 'Arc 정산 처리 중...',
    noTxConnected: '기록된 Arc 정산 내역이 없습니다.',
    noTxDisconnected: '지갑을 연결하여 Arc 내역을 확인하세요.',
    activityHeader: 'Arc 네트워크 활동 및 검증 로그',
    downloadCsv: 'CSV 내보내기 ↗',
    resourcesHeader: 'Arc 생태계 인프라 링크',
    scanQr: 'QR 스캔',
    closeQr: '카메라 닫기',
    qrTitle: 'Arc 동적 POS QR 인보이스',
    royaltyHeader: 'Arc 프로그래머블 수수료 엔진',
    royaltyDesc: '크리에이터 수수료 또는 결제 분배를 Arc에서 직접 실행합니다.',
    distributeRoyalty: '수수료 분배',
    txSuccessTitle: 'Arc 정산 승인 완료',
    txSuccessDesc: 'Arc Testnet에서 초고속 확정성으로 트랜잭션이 완료되었습니다.',
    viewExplorer: 'ArcScan에서 보기 ↗',
    close: '닫기',
  },
  es: {
    subtitle: 'Motor de Liquidación USDC Programable en Red Arc',
    identityHeader: 'Identidad Arc Multi-Cadena',
    verified: 'Creador Arc Verificado',
    notConnected: 'Billetera Desconectada',
    boundId: 'ID Arc UP Vinculado',
    issueUpId: 'Registrar Nombre',
    liveBalance: 'Saldo de Tesorería Arc',
    multichainHeader: 'Enrutamiento de Activos en Red Arc (Interactivo)',
    workflowHeader: 'Flujo de Trabajo para Creadores Arc',
    step1: '1. Vincular Identidad Arc y Billetera',
    step1Sub: 'Registra identidad de forma determinista en Arc',
    done: 'Hecho ✓',
    pending: 'Pendiente',
    step2: '2. Ejecutar Liquidación USDC en Arc',
    step2Sub: 'Ejecutado: {count} liquidaciones',
    run: 'Ejecutar',
    running: 'Ejecutando...',
    step3: '3. Reclamar Sello de Creador Arc',
    step3Sub: 'Emite insignia de verificación Arc',
    issued: 'Emitido ✓',
    claim: 'Reclamar Sello',
    placeholder: 'Enviar a @ARC_ID o Billetera 0x',
    payBtn: 'Pagar con Arc USDC',
    processing: 'Procesando en Red Arc...',
    noTxConnected: 'No hay registros de liquidación en Arc.',
    noTxDisconnected: 'Conecte billetera para ver historial de Arc.',
    activityHeader: 'Registro de Actividad y Verificación Arc',
    downloadCsv: 'Exportar CSV ↗',
    resourcesHeader: 'Enlaces de Infraestructura Arc',
    scanQr: 'Escanear QR',
    closeQr: 'Cerrar Cámara',
    qrTitle: 'Factura QR POS Dinámica Arc',
    royaltyHeader: 'Motor de Tarifas Programables Arc',
    royaltyDesc: 'Distribuya tarifas de creador o pagos divididos directamente en Arc.',
    distributeRoyalty: 'Distribuir Tarifa',
    txSuccessTitle: 'Liquidación Arc Confirmada',
    txSuccessDesc: 'Su transacción se procesó con finalización sub-segundo en Arc Testnet.',
    viewExplorer: 'Ver en ArcScan ↗',
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
  latencyMs?: number
}

interface ModalDetails {
  title: string
  amount: string
  hash: string
  url: string
  latencyMs: number
}

const ARC_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const DEFAULT_TREASURY = '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address })
  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()

  const [lang, setLang] = useState<Lang>('hi')
  const t = translations[lang] || translations.en

  const [activeTab, setActiveTab] = useState<'upi' | 'qr' | 'treasury'>('upi')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [transferMode, setTransferMode] = useState<'native' | 'erc20'>('native')
  
  const [practiceCount, setPracticeCount] = useState(1)
  const [stampIssued, setStampIssued] = useState(false)
  const [txLoading, setTxLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  // Interactive Treasury State
  const [treasuryDeposit, setTreasuryDeposit] = useState('1.0')
  const [vaultBalance, setVaultBalance] = useState('0.00')

  // Interactive CCTP & Split Modals
  const [cctpModalOpen, setCctpModalOpen] = useState(false)
  const [cctpAmount, setCctpAmount] = useState('10')
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [speedTestRunning, setSpeedTestRunning] = useState(false)

  const [royaltyRecipient, setRoyaltyRecipient] = useState('')
  const [royaltyAmount, setRoyaltyAmount] = useState('0.05')

  const [successModal, setSuccessModal] = useState<ModalDetails | null>(null)
  const [customUpId, setCustomUpId] = useState('')
  const [registeredIds, setRegisteredIds] = useState<Record<string, string>>({})
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentWallet = address ? address.toLowerCase() : ''
  const isArc = chainId === 5042002 || true
  const explorerBase = 'https://testnet.arcscan.app/tx/'

  // Safe Audio Playback
  const playSuccessChime = () => {
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)
        gain.gain.setValueAtTime(0.1, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.35)
      })
    } catch (e) {
      console.warn('Audio playback restricted', e)
    }
  }

  const triggerConfetti = () => {
    if (typeof window === 'undefined') return
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles: any[] = []
    const colors = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
    
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015
      })
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false
      particles.forEach(p => {
        if (p.alpha > 0) {
          active = true
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.2
          p.alpha -= p.decay
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      if (active) requestAnimationFrame(animate)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    animate()
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedIds = localStorage.getItem('arc_registered_upids')
    if (savedIds) {
      try {
        setRegisteredIds(JSON.parse(savedIds))
      } catch (e) {
        console.error('Failed to parse UP IDs', e)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isConnected && currentWallet) {
      const savedHistory = localStorage.getItem(`arc_tx_history_${currentWallet}`)
      if (savedHistory) {
        try {
          setActivities(JSON.parse(savedHistory))
        } catch (e) {
          setActivities([])
        }
      } else {
        setActivities([])
      }
    } else {
      setActivities([])
    }
  }, [isConnected, currentWallet])

  // Camera QR Scanner Cleanup
  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 200, height: 200 } },
        false
      )
      scannerRef.current = scanner
      scanner.render(
        (decodedText) => {
          let extracted = decodedText
          if (decodedText.includes('ethereum:')) {
            extracted = decodedText.split('ethereum:')[1].split('@')[0].split('?')[0]
          }
          setRecipient(extracted)
          setStatusMsg(`Scanned Address: ${extracted.slice(0, 10)}...`)
          setIsScannerOpen(false)
          scanner.clear().catch(console.error)
        },
        () => {}
      )
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [isScannerOpen])

  // Resolve Handle (@ARC_ID or @name to 0x Address)
  const resolveRecipientAddress = (input: string): `0x${string}` => {
    const clean = input.trim()
    if (clean.startsWith('0x') && clean.length === 42) {
      return clean as `0x${string}`
    }
    
    // Check if input matches any registered Handle
    const cleanHandle = clean.toLowerCase().startsWith('@') ? clean.toLowerCase() : `@${clean.toLowerCase()}`
    for (const [wAddress, hName] of Object.entries(registeredIds)) {
      if (hName.toLowerCase() === cleanHandle) {
        return wAddress as `0x${string}`
      }
    }

    // Default Fallback
    return DEFAULT_TREASURY as `0x${string}`
  }

  const saveActivity = (newAct: ActivityItem) => {
    if (!currentWallet || typeof window === 'undefined') return
    const updated = [newAct, ...activities]
    setActivities(updated)
    localStorage.setItem(`arc_tx_history_${currentWallet}`, JSON.stringify(updated))
  }

  const triggerSuccess = (title: string, amountStr: string, hash: string, latencyMs: number) => {
    const fullExplorerUrl = `${explorerBase}${hash}`
    playSuccessChime()
    triggerConfetti()
    if (refetchBalance) refetchBalance()
    setSuccessModal({
      title,
      amount: amountStr,
      hash,
      url: fullExplorerUrl,
      latencyMs,
    })
  }

  const autoDerivedId = address ? `@ARC-${address.slice(-5)}` : '--'
  const userUpId = currentWallet && registeredIds[currentWallet] ? registeredIds[currentWallet] : autoDerivedId

  const handleRegisterUpId = () => {
    if (!currentWallet) {
      setStatusMsg('कृपया पहले अपना वॉलेट कनेक्ट करें।')
      return
    }

    let cleanId = customUpId.trim().toLowerCase()
    if (!cleanId) {
      setStatusMsg('कृपया एक सही हैंडल नाम दर्ज करें।')
      return
    }

    if (!cleanId.startsWith('@')) {
      cleanId = `@${cleanId}`
    }

    const updated = {
      ...registeredIds,
      [currentWallet]: cleanId
    }

    setRegisteredIds(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('arc_registered_upids', JSON.stringify(updated))
    }
    setCustomUpId('')
    setStatusMsg(`आर्क हैंडल रजिस्टर हो गया: ${cleanId}`)
  }

  // Handle Payment with Correct Native / ERC20 Option
  const handlePayment = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }
    if (!recipient) {
      alert(t.placeholder)
      return
    }

    const targetAddress = resolveRecipientAddress(recipient)
    const startTime = performance.now()

    try {
      setTxLoading(true)
      setStatusMsg(t.processing)
      
      const inputAmount = amount && !isNaN(Number(amount)) ? amount : '0.1'
      let hash = ''

      if (transferMode === 'erc20') {
        const parsedValue = parseUnits(inputAmount, 6)
        hash = await writeContractAsync({
          address: ARC_USDC_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [targetAddress, parsedValue],
        })
      } else {
        // Native USDC Transfer on Arc Network
        const parsedValue = parseEther(inputAmount)
        hash = await sendTransactionAsync({
          to: targetAddress,
          value: parsedValue,
        })
      }

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      const amtSymbol = `${inputAmount} USDC`
      const targetShort = `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`
      const txTitle = `Arc USDC Transfer → ${targetShort}`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`,
        latencyMs
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash, latencyMs)
      setStatusMsg('')
    } catch (err: any) {
      console.error(err)
      setStatusMsg('ट्रांजैक्शन रद्द या विफल हुआ।')
    } finally {
      setTxLoading(false)
    }
  }

  // Interactive Treasury Deposit Action
  const handleTreasuryDeposit = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }
    const startTime = performance.now()
    try {
      setTxLoading(true)
      setStatusMsg('Treasury Vault में जमा हो रहा है...')

      const depAmount = treasuryDeposit && !isNaN(Number(treasuryDeposit)) ? treasuryDeposit : '1.0'
      const hash = await sendTransactionAsync({
        to: DEFAULT_TREASURY as `0x${string}`,
        value: parseEther(depAmount),
      })

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      setVaultBalance(prev => (parseFloat(prev) + parseFloat(depAmount)).toFixed(2))
      
      const amtSymbol = `${depAmount} USDC`
      const txTitle = `Treasury Vault Deposit`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`,
        latencyMs
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash, latencyMs)
      setStatusMsg('')
    } catch (e) {
      setStatusMsg('Treasury Deposit विफल रहा।')
    } finally {
      setTxLoading(false)
    }
  }

  // Interactive Speed Test Action
  const handleRunSpeedTest = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }
    setSpeedTestRunning(true)
    const startTime = performance.now()
    try {
      const hash = await sendTransactionAsync({
        to: address || DEFAULT_TREASURY as `0x${string}`,
        value: parseEther('0.00001'),
      })
      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      triggerSuccess('Arc Network Speed Test Passed', '0.00001 USDC', hash, latencyMs)
    } catch (e) {
      console.error(e)
    } finally {
      setSpeedTestRunning(false)
    }
  }

  // Interactive Royalty Payout Action
  const handleRoyaltyPayout = async () => {
    if (!isConnected || !address) {
      alert(t.notConnected)
      return
    }

    const startTime = performance.now()
    const targetAddress = resolveRecipientAddress(royaltyRecipient)

    try {
      setTxLoading(true)
      setStatusMsg('आर्क फ़ीस डिस्ट्रीब्यूट हो रही है...')

      const hash = await sendTransactionAsync({
        to: targetAddress,
        value: parseEther(royaltyAmount && !isNaN(Number(royaltyAmount)) ? royaltyAmount : '0.01'),
      })

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      const amtSymbol = `${royaltyAmount} USDC`
      const targetLabel = `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`
      const txTitle = `Fee Split Engine → ${targetLabel}`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`,
        latencyMs
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash, latencyMs)
      setStatusMsg('')
    } catch (err) {
      console.error(err)
      setStatusMsg('फ़्री डिस्ट्रीब्यूशन विफल रहा।')
    } finally {
      setTxLoading(false)
    }
  }

  const handlePracticeTx = async () => {
    if (!isConnected) {
      alert(t.notConnected)
      return
    }
    const startTime = performance.now()
    try {
      setTxLoading(true)
      setStatusMsg(t.processing)
      
      const targetAddr = address || DEFAULT_TREASURY
      const hash = await sendTransactionAsync({
        to: targetAddr as `0x${string}`,
        value: parseEther('0.0001'),
      })

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      setPracticeCount(prev => prev + 1)
      const amtSymbol = `0.0001 USDC`
      const txTitle = `Deterministic Settlement Test (Arc)`

      const newAct: ActivityItem = {
        id: Date.now().toString(),
        title: txTitle,
        timestamp: new Date().toLocaleTimeString(),
        amount: amtSymbol,
        txHash: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
        explorerUrl: `${explorerBase}${hash}`,
        latencyMs
      }
      saveActivity(newAct)
      triggerSuccess(txTitle, amtSymbol, hash, latencyMs)
      setStatusMsg('')
    } catch (err) {
      setStatusMsg('ट्रांजैक्शन रद्द हुआ।')
    } finally {
      setTxLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (activities.length === 0 || typeof window === 'undefined') return
    const headers = "ID,Title,Timestamp,Amount,TxHash,LatencyMs,ExplorerUrl\n"
    const rows = activities.map(a => `${a.id},"${a.title}",${a.timestamp},${a.amount},${a.txHash},${a.latencyMs || 0},${a.explorerUrl}`).join("\n")
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL ? window.URL.createObjectURL(blob) : ''
    const a = document.createElement('a')
    a.href = url
    a.download = `arc_settlement_log_${Date.now()}.csv`
    a.click()
  }

  const receiveQrData = isConnected && address
    ? `ethereum:${address}@5042002?label=${encodeURIComponent(userUpId)}`
    : 'Connect Wallet to Generate Arc QR'

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#07090e] text-slate-100 p-8 font-mono flex items-center justify-center">
        <p className="text-sm text-purple-400 animate-pulse">Loading Arc Settlement Engine...</p>
      </main>
    )
  }

  const activeResolvedAddress = recipient ? resolveRecipientAddress(recipient) : null

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 p-3 sm:p-6 md:p-8 font-mono relative overflow-hidden">
      
      {/* Canvas Confetti */}
      <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50"></canvas>

      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-purple-900/40 gap-3 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-md border border-purple-400/30">
              ARC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">ARC SETTLEMENT HUB</h1>
                <span className="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/60 font-semibold">
                  PRIMARY
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-[#07090e] border border-slate-800 text-slate-300 text-xs px-2.5 py-2 rounded-xl focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="en">🌐 English</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="es">🇪🇸 Español</option>
            </select>
            
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </header>

        {statusMsg && (
          <div className="bg-purple-950/60 border border-purple-500/50 text-purple-200 p-3 rounded-xl text-xs flex justify-between items-center animate-pulse">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white px-2">✕</button>
          </div>
        )}

        {/* Identity Section */}
        <section className="bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#07090e] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.boundId}</span>
              <span className="text-xs font-semibold text-purple-300">
                {isConnected ? userUpId : '--'}
              </span>
            </div>
            <div className="bg-[#07090e] p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">{t.liveBalance}</span>
              <span className="text-xs font-semibold text-emerald-400">
                {isConnected 
                  ? (balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 'Live USDC') 
                  : '--'}
              </span>
            </div>
          </div>

          {/* Register Handle */}
          {isConnected && (
            <div className="bg-[#07090e] p-3 rounded-xl border border-slate-800 flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Register Arc Handle (e.g. @bhupendra)" 
                value={customUpId}
                onChange={(e) => setCustomUpId(e.target.value)}
                className="bg-[#0d121d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 flex-1"
              />
              <button 
                onClick={handleRegisterUpId}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer"
              >
                {t.issueUpId}
              </button>
            </div>
          )}

          {/* Interactive Ecosystem Features Cards */}
          <div className="pt-1">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-medium">{t.multichainHeader}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              
              {/* Card 1: Native USDC */}
              <button 
                onClick={() => {
                  setTransferMode('native')
                  setActiveTab('upi')
                  setStatusMsg('Mode: Native USDC Selected')
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  transferMode === 'native' 
                    ? 'bg-purple-950/40 border-purple-500' 
                    : 'bg-[#07090e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <p className="text-purple-400 font-semibold text-[10px]">Arc Testnet</p>
                <p className="text-slate-200 mt-1 font-bold">Native USDC ⚡</p>
                <p className="text-[9px] text-slate-400 mt-1">Click to Select Mode</p>
              </button>

              {/* Card 2: Circle CCTP (Opens Modal) */}
              <button 
                onClick={() => setCctpModalOpen(true)}
                className="bg-[#07090e] hover:border-emerald-500/50 p-3 rounded-xl border border-slate-800 text-left transition-all cursor-pointer"
              >
                <p className="text-slate-400 font-semibold text-[10px]">Circle CCTP</p>
                <p className="text-emerald-400 mt-1 font-bold">Cross-Chain Bridge ↗</p>
                <p className="text-[9px] text-slate-400 mt-1">Click to Test CCTP</p>
              </button>

              {/* Card 3: Speed Benchmark Test */}
              <button 
                onClick={handleRunSpeedTest}
                disabled={speedTestRunning}
                className="bg-[#07090e] hover:border-indigo-500/50 p-3 rounded-xl border border-slate-800 text-left transition-all cursor-pointer"
              >
                <p className="text-slate-400 font-semibold text-[10px]">Deterministic Engine</p>
                <p className="text-indigo-400 mt-1 font-bold">Speed Benchmark ⏱</p>
                <p className="text-[9px] text-slate-400 mt-1">{speedTestRunning ? 'Testing...' : 'Click to Run Test'}</p>
              </button>

              {/* Card 4: Programmable Money Splitter */}
              <button 
                onClick={() => setSplitModalOpen(true)}
                className="bg-[#07090e] hover:border-amber-500/50 p-3 rounded-xl border border-slate-800 text-left transition-all cursor-pointer"
              >
                <p className="text-slate-400 font-semibold text-[10px]">Payment UX</p>
                <p className="text-amber-400 mt-1 font-bold">Auto-Split Splitter 🔀</p>
                <p className="text-[9px] text-slate-400 mt-1">Click to Configure</p>
              </button>

            </div>
          </div>
        </section>

        {/* Programmable Fee Engine */}
        <section className="bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-purple-900/40 space-y-3 shadow-md">
          <div>
            <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">{t.royaltyHeader}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.royaltyDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input 
              type="text"
              placeholder="Address 0x... or @handle (Blank = Arc Treasury)"
              value={royaltyRecipient}
              onChange={(e) => setRoyaltyRecipient(e.target.value)}
              className="sm:col-span-2 bg-[#07090e] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Amount"
                value={royaltyAmount}
                onChange={(e) => setRoyaltyAmount(e.target.value)}
                className="w-1/2 bg-[#07090e] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRoyaltyPayout}
                disabled={txLoading || !isConnected}
                className="w-1/2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl py-2 transition-all cursor-pointer"
              >
                {t.distributeRoyalty}
              </button>
            </div>
          </div>
        </section>

        {/* Onboarding Workflow */}
        <section className="bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">{t.workflowHeader}</h2>
          
          <div className="flex justify-between items-center bg-[#07090e] p-3 rounded-xl border border-slate-800/60">
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

          <div className="flex justify-between items-center bg-[#07090e] p-3 rounded-xl border border-slate-800/60">
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

          <div className="flex justify-between items-center bg-[#07090e] p-3 rounded-xl border border-slate-800/60">
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

        {/* Payments & Interactive Treasury Section */}
        <section className="bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex border-b border-slate-800 gap-2">
            <button 
              onClick={() => setActiveTab('upi')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'upi' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Arc USDC Transfer
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'qr' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              POS QR Invoice
            </button>
            <button 
              onClick={() => setActiveTab('treasury')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === 'treasury' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Arc Yield Treasury 🏦
            </button>
          </div>

          {activeTab === 'upi' && (
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder={t.placeholder} 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1 bg-[#07090e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />
                <button
                  onClick={() => setIsScannerOpen(!isScannerOpen)}
                  className="bg-[#07090e] border border-slate-700 hover:border-purple-500 text-purple-400 text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 font-medium cursor-pointer"
                >
                  📷 {isScannerOpen ? t.closeQr : t.scanQr}
                </button>
              </div>

              {/* Resolved Target Address Feedback */}
              {recipient && activeResolvedAddress && (
                <div className="text-[10px] bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-slate-400 flex justify-between">
                  <span>Resolved Address:</span>
                  <span className="text-purple-300 font-mono">{activeResolvedAddress}</span>
                </div>
              )}

              {/* Real Camera Scanner */}
              {isScannerOpen && (
                <div className="bg-[#07090e] p-4 rounded-xl border border-purple-500/50 space-y-2">
                  <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
                  <p className="text-[10px] text-center text-slate-400">Point your camera at a QR code containing an Arc wallet address</p>
                </div>
              )}
              
              {/* Transfer Mode Selector */}
              <div className="flex justify-between items-center bg-[#07090e] p-2 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] pl-2">Transfer Route:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTransferMode('native')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer ${
                      transferMode === 'native' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Native Gas USDC
                  </button>
                  <button 
                    onClick={() => setTransferMode('erc20')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer ${
                      transferMode === 'erc20' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ERC-20 Contract
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-1/3 bg-[#07090e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
                />
                <button 
                  onClick={handlePayment}
                  disabled={txLoading || !isConnected}
                  className="w-2/3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl py-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  {txLoading ? t.processing : `${t.payBtn} (${amount} USDC)`}
                </button>
              </div>
              
              <p className="text-[10px] text-center text-slate-500">
                Primary Network: Arc Testnet | Deterministic Sub-Second Finality
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-[#07090e] p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t.qrTitle}</p>
              
              <div className="w-40 h-40 bg-slate-900 border-2 border-purple-500/30 mx-auto rounded-xl flex flex-col items-center justify-center p-2 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(receiveQrData)}`} 
                  alt="Arc Receiver QR Code"
                  className="w-32 h-32 rounded bg-white p-1"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-purple-400">{userUpId}</p>
                <p className="text-[11px] text-slate-400 break-all">{address || 'No wallet connected'}</p>
                <p className="text-[10px] text-emerald-400 font-semibold pt-1">Network: Arc Testnet (USDC)</p>
              </div>
            </div>
          )}

          {/* Fully Interactive Arc Yield Treasury Tab */}
          {activeTab === 'treasury' && (
            <div className="bg-[#07090e] p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-purple-300 uppercase">Arc Yield Vault</h3>
                  <p className="text-[10px] text-slate-400">Programmable Yield Protocol on Arc Network</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Current Vault Yield</p>
                  <p className="text-xs font-bold text-emerald-400">4.85% APY</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0d121d] p-3 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">Your Deposited Balance</p>
                  <p className="text-sm font-bold text-purple-300 mt-1">{vaultBalance} USDC</p>
                </div>
                <div className="bg-[#0d121d] p-3 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">Estimated Annual Yield</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">
                    {(parseFloat(vaultBalance) * 0.0485).toFixed(4)} USDC
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={treasuryDeposit}
                  onChange={(e) => setTreasuryDeposit(e.target.value)}
                  placeholder="Amount in USDC"
                  className="w-1/2 bg-[#0d121d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handleTreasuryDeposit}
                  disabled={txLoading || !isConnected}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium text-xs rounded-xl py-2 transition-all cursor-pointer"
                >
                  {txLoading ? 'Depositing...' : 'Deposit to Vault'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Resources & Explorers */}
        <section className="bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{t.resourcesHeader}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <a 
              href="https://testnet.arcscan.app/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#07090e] hover:bg-[#121826] p-3 rounded-xl border border-purple-900/50 text-purple-300 transition-all font-medium flex items-center justify-between"
            >
              <span>ArcScan Explorer</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://faucet.circle.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#07090e] hover:bg-[#121826] p-3 rounded-xl border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>Circle USDC Faucet</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://www.arc.io/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#07090e] hover:bg-[#121826] p-3 rounded-xl border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>Arc Protocol Docs</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </section>

        {/* Activity Log */}
        <section className="bg-[#0d121d] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
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
                  <div key={act.id} className="bg-[#07090e] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-purple-300 font-medium">{act.title}</p>
                        {act.latencyMs && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                            {act.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{act.timestamp} • {act.amount}</p>
                    </div>
                    <div className="text-right">
                      <a 
                        href={act.explorerUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-purple-400 hover:underline text-[10px] block"
                      >
                        Verify ↗ ({act.txHash})
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#07090e] p-4 rounded-xl border border-slate-800/60 text-center text-slate-500 text-xs">
                  {t.noTxConnected}
                </div>
              )
            ) : (
              <div className="bg-[#07090e] p-4 rounded-xl border border-slate-800/60 text-center text-slate-500 text-xs">
                {t.noTxDisconnected}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Circle CCTP Bridge Interactive Modal */}
      {cctpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d121d] border border-emerald-500/40 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase">Circle CCTP Native Bridge</h3>
            <p className="text-xs text-slate-400">Burn & Mint Native USDC across Arc and Ethereum / Arbitrum using Circle CCTP Protocol.</p>
            
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 text-[10px]">Transfer Amount (USDC):</label>
              <input 
                type="text" 
                value={cctpAmount}
                onChange={(e) => setCctpAmount(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={async () => {
                  setCctpModalOpen(false)
                  await handlePracticeTx()
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 rounded-xl font-medium cursor-pointer"
              >
                Execute CCTP Bridge
              </button>
              <button 
                onClick={() => setCctpModalOpen(false)}
                className="w-1/3 bg-slate-800 text-slate-300 text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Split Payment Config Modal */}
      {splitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d121d] border border-amber-500/40 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase">Programmable Auto-Splitter</h3>
            <p className="text-xs text-slate-400">Automatically split incoming USDC settlements: 80% Merchant, 15% Treasury, 5% Royalty Fee.</p>
            
            <div className="bg-[#07090e] p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant Payout:</span>
                <span className="text-slate-200 font-bold">80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vault Treasury Deposit:</span>
                <span className="text-emerald-400 font-bold">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Protocol Fee:</span>
                <span className="text-purple-400 font-bold">5%</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setSplitModalOpen(false)
                setStatusMsg('Auto-Split Routing Configured!')
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs py-2.5 rounded-xl font-medium cursor-pointer"
            >
              Activate Auto-Split Rules
            </button>
          </div>
        </div>
      )}

      {/* Success Transaction Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d121d] border border-purple-500/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto border border-emerald-500/40">
              ✓
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{t.txSuccessTitle}</h3>
              <p className="text-xs text-slate-400">{t.txSuccessDesc}</p>
            </div>

            <div className="bg-[#07090e] p-3.5 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                <span>EXECUTION SPEED:</span>
                <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {successModal.latencyMs} ms
                </span>
              </div>
              <p className="text-purple-300 font-semibold">{successModal.title}</p>
              <p className="text-emerald-400 font-bold">{successModal.amount}</p>
              <p className="text-slate-500 text-[10px] truncate">Hash: {successModal.hash}</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a 
                href={successModal.url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-xl transition-all shadow-md block"
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
