import { useState, useEffect, useRef } from 'react'
import { useAccount, useSendTransaction, useBalance, useChainId, useWriteContract } from 'wagmi'
import { parseEther, parseUnits, erc20Abi } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type Lang = 'en' | 'ko' | 'hi' | 'es'

const translations = {
  en: {
    title: 'Setu',
    subtitle: 'programmable usdc settlement engine on arc network',
    identityHeader: 'arc multi-chain identity',
    verified: 'verified arc builder',
    notConnected: 'wallet disconnected',
    boundId: 'bound arc up id',
    issueUpId: 'register handle',
    liveBalance: 'arc treasury balance',
    multichainHeader: 'arc ecosystem asset routing',
    workflowHeader: 'arc builder onboarding workflow',
    step1: '1. bind arc identity & wallet',
    step1Sub: 'deterministically registers identity on arc network',
    done: 'done ✓',
    pending: 'pending',
    step2: '2. execute arc usdc settlement',
    step2Sub: 'executed: {count} settlement txns',
    run: 'run settlement',
    running: 'executing...',
    step3: '3. claim arc builder stamp',
    step3Sub: 'issues arc ecosystem verification badge',
    issued: 'issued ✓',
    claim: 'claim stamp',
    placeholder: 'send to @arc_id or 0x wallet address',
    payBtn: 'pay via arc usdc',
    processing: 'processing arc settlement...',
    noTxConnected: 'no arc settlement logs recorded for this wallet.',
    noTxDisconnected: 'connect wallet to view arc settlement activity.',
    activityHeader: 'arc network activity & verification logs',
    downloadCsv: 'export csv ↗',
    resourcesHeader: 'arc ecosystem infrastructure links',
    scanQr: 'scan qr',
    closeQr: 'close camera',
    qrTitle: 'arc dynamic pos qr invoice',
    royaltyHeader: 'arc programmable fee engine',
    royaltyDesc: 'distribute creator fees, split payments, or send cross-chain royalties natively on arc.',
    distributeRoyalty: 'distribute fee',
    txSuccessTitle: 'arc settlement confirmed',
    txSuccessDesc: 'your transaction was settled with sub-second finality on arc testnet.',
    viewExplorer: 'view on arcscan ↗',
    close: 'close',
    connectWalletFirst: 'please connect your wallet first',
    treasuryDepositing: 'depositing on-chain to treasury vault...',
    treasuryFailed: 'treasury deposit failed',
    feeDistributing: 'distributing arc fee...',
    feeFailed: 'fee distribution failed',
    handleRegistered: 'arc handle registered: ',
    txCancelled: 'transaction cancelled',
    nativeModeSelected: 'mode: native usdc selected',
    autoSplitActivated: 'auto-split routing configured',
    cameraDenied: 'camera permission denied',
    pointCamera: 'point camera at qr code',
    treasuryVaultTitle: 'arc yield vault',
    treasuryVaultDesc: 'programmable yield protocol on arc network',
    currentVaultYield: 'current vault yield',
    depositedBalance: 'your deposited balance',
    estAnnualYield: 'estimated annual yield',
    depositToVault: 'deposit to vault',
    depositing: 'depositing...',
    scanned: 'scanned: ',
    taskHeader: 'arc builder incentives & tasks',
    taskStreakTitle: 'daily settlement streak',
    taskStreakDesc: 'complete 3 settlements to unlock +0.5% yield boost',
    taskAgentTitle: 'agentic micro-task ping',
    taskAgentDesc: 'run automated RPC verification ping for 0.0001 USDC payout',
    taskAgentBtn: 'run verification ping',
    taskRebateActive: '5% POS fee rebate active with builder stamp',
    taskRebateInactive: 'claim builder stamp to unlock POS fee rebate'
  },
  hi: {
    title: 'आर्क सेटलमेंट हब',
    subtitle: 'आर्क नेटवर्क पर प्रोग्रामेबल usdc सेटलमेंट इंजन',
    identityHeader: 'आर्क मल्टी-चैन पहचान',
    verified: 'वेरिफाइड आर्क बिल्डर',
    notConnected: 'वॉलेट कनेक्ट नहीं है',
    boundId: 'बाउंड आर्क up id',
    issueUpId: 'हैंडल रजिस्टर करें',
    liveBalance: 'आर्क ट्रेजरी बैलेंस',
    multichainHeader: 'आर्क इकोसिस्टम एसेट रूटिंग',
    workflowHeader: 'आर्क बिल्डर ऑनबोर्डिंग वर्कफ़्लो',
    step1: '1. आर्क पहचान और वॉलेट बाइंड करें',
    step1Sub: 'आर्क नेटवर्क पर पहचान दर्ज करता है',
    done: 'पूर्ण ✓',
    pending: 'लंबित',
    step2: '2. आर्क usdc सेटलमेंट निष्पादित करें',
    step2Sub: 'निष्पादित: {count} सेटलमेंट',
    run: 'सेटलमेंट चलाएं',
    running: 'निष्पादित हो रहा है...',
    step3: '3. आर्क बिल्डर स्टैम्प क्लेम करें',
    step3Sub: 'आर्क इकोसिस्टम सत्यापन बैज जारी करता है',
    issued: 'जारी हुआ ✓',
    claim: 'स्टैम्प क्लेम करें',
    placeholder: '@arc_id या 0x वॉलेट पता दर्ज करें',
    payBtn: 'आर्क usdc द्वारा भुगतान करें',
    processing: 'आर्क सेटलमेंट प्रॉसेस हो रहा है...',
    noTxConnected: 'इस वॉलेट के लिए कोई आर्क सेटलमेंट दर्ज नहीं है।',
    noTxDisconnected: 'गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
    activityHeader: 'आर्क नेटवर्क गतिविधि और सत्यापन लॉग',
    downloadCsv: 'csv एक्सपोर्ट ↗',
    resourcesHeader: 'आर्क इकोसिस्टम इंफ्रास्ट्रक्चर लिंक्स',
    scanQr: 'qr स्कैन करें',
    closeQr: 'कैमरा बंद करें',
    qrTitle: 'आर्क डायनामिक pos qr इनवॉइस',
    royaltyHeader: 'आर्क प्रोग्रामेबल फ़ीस इंजन',
    royaltyDesc: 'क्रिएटर फ़ीस या पेमेंट स्प्लिट आर्क नेटवर्क पर सीधे भेजें।',
    distributeRoyalty: 'फ़ीस डिस्ट्रीब्यूट करें',
    txSuccessTitle: 'आर्क सेटलमेंट सफल',
    txSuccessDesc: 'आर्क टेस्टनेट पर आपका ट्रांजैक्शन तेजी से सेटल हो गया है।',
    viewExplorer: 'arcscan पर देखें ↗',
    close: 'बंद करें',
    connectWalletFirst: 'कृपया पहले अपना वॉलेट कनेक्ट करें',
    treasuryDepositing: 'ट्रेजरी वॉल्ट में ऑन-चेन जमा हो रहा है...',
    treasuryFailed: 'ट्रेजरी डिपॉजिट विफल रहा',
    feeDistributing: 'आर्क फ़ीस डिस्ट्रीब्यूट हो रही है...',
    feeFailed: 'फ़ीस डिस्ट्रीब्यूशन विफल रहा',
    handleRegistered: 'आर्क हैंडल रजिस्टर हो गया: ',
    txCancelled: 'ट्रांजैक्शन रद्द हुआ',
    nativeModeSelected: 'मोड: नेटिव usdc चयनित',
    autoSplitActivated: 'ऑटो-स्प्लिट नियम सक्रिय',
    cameraDenied: 'कैमरा अनुमति नहीं मिली',
    pointCamera: 'क्यूआर कोड पर कैमरा रखें',
    treasuryVaultTitle: 'आर्क ईल्ड वॉल्ट',
    treasuryVaultDesc: 'आर्क नेटवर्क पर प्रोग्रामेबल ईल्ड प्रोटोकॉल',
    currentVaultYield: 'वर्तमान वॉल्ट ईल्ड',
    depositedBalance: 'आपका जमा बैलेंस',
    estAnnualYield: 'अनुमानित वार्षिक ईल्ड',
    depositToVault: 'वॉल्ट में जमा करें',
    depositing: 'जमा हो रहा है...',
    scanned: 'स्कैन हुआ: ',
    taskHeader: 'आर्क बिल्डर इंसेंटिव और टास्क',
    taskStreakTitle: 'डेली सेटलमेंट स्ट्रीक',
    taskStreakDesc: '+0.5% ईल्ड बूस्ट अनलॉक करने के लिए 3 सेटलमेंट करें',
    taskAgentTitle: 'एजेंटिक माइक्रो-टास्क पिंग',
    taskAgentDesc: '0.0001 USDC पेआउट के लिए RPC सत्यापन पिंग चलाएं',
    taskAgentBtn: 'वेरिफिकेशन पिंग चलाएं',
    taskRebateActive: 'बिल्डर स्टैम्प के साथ 5% POS फ़ीस रीबेट सक्रिय है',
    taskRebateInactive: 'POS फ़ीस रीबेट अनलॉक करने के लिए बिल्डर स्टैम्प क्लेम करें'
  },
  ko: {
    title: 'ARC SETTLEMENT HUB',
    subtitle: 'arc 네트워크 기반 프로그래머블 usdc 정산 엔진',
    identityHeader: 'arc 멀티체인 신원',
    verified: '검증된 arc 빌더',
    notConnected: '지갑 연결해제됨',
    boundId: '연결된 arc up id',
    issueUpId: '핸들 등록',
    liveBalance: 'arc 실시간 잔액',
    multichainHeader: 'arc 생태계 자산 라우팅',
    workflowHeader: 'arc 빌더 온보딩 워크플로우',
    step1: '1. arc 신원 및 지갑 연결',
    step1Sub: 'arc 네트워크에서 확정적 신원 등록',
    done: '완료 ✓',
    pending: '대기 중',
    step2: '2. arc usdc 정산 실행',
    step2Sub: '실행 횟수: {count}회',
    run: '정산 실행',
    running: '실행 중...',
    step3: '3. arc 빌더 스탬프 발급',
    step3Sub: 'arc 생태계 검증 배지 발급',
    issued: '발급됨 ✓',
    claim: '스탬프 받기',
    placeholder: '@arc_id 또는 0x 지갑 주소 입력',
    payBtn: 'arc usdc 결제',
    processing: 'arc 정산 처리 중...',
    noTxConnected: '기록된 arc 정산 내역이 없습니다.',
    noTxDisconnected: '지갑을 연결하여 arc 내역을 확인하세요.',
    activityHeader: 'arc 네트워크 활동 및 검증 로그',
    downloadCsv: 'csv 내보내기 ↗',
    resourcesHeader: 'arc 생태계 인프라 링크',
    scanQr: 'qr 스캔',
    closeQr: '카메라 닫기',
    qrTitle: 'arc 동적 pos qr 인보이스',
    royaltyHeader: 'arc 프로그래머블 수수료 엔진',
    royaltyDesc: '크리에이터 수수료 또는 결제 분배를 arc에서 직접 실행합니다.',
    distributeRoyalty: '수수료 분배',
    txSuccessTitle: 'arc 정산 승인 완료',
    txSuccessDesc: 'arc testnet에서 초고속 확정성으로 트랜잭션이 완료되었습니다.',
    viewExplorer: 'arcscan에서 보기 ↗',
    close: '닫기',
    connectWalletFirst: '먼저 지갑을 연결해 주세요',
    treasuryDepositing: '트레저리 금고에 온체인 입금 중...',
    treasuryFailed: '트레저리 입금 실패',
    feeDistributing: 'arc 수수료 분배 중...',
    feeFailed: '수수료 분배 실패',
    handleRegistered: 'arc 핸들 등록 완료: ',
    txCancelled: '트랜잭션 취소됨',
    nativeModeSelected: '모드: 네이티브 usdc 선택됨',
    autoSplitActivated: '자동 분할 규칙 활성화됨',
    cameraDenied: '카메라 권한 거부됨',
    pointCamera: 'qr 코드에 카메라는 비춰주세요',
    treasuryVaultTitle: 'arc 수익 금고',
    treasuryVaultDesc: 'arc 네트워크 기반 프로그래머블 수익 프로토콜',
    currentVaultYield: '현재 금고 수익률',
    depositedBalance: '예치된 잔액',
    estAnnualYield: '예상 연간 수익',
    depositToVault: '금고에 입금',
    depositing: '입금 중...',
    scanned: '스캔됨: ',
    taskHeader: 'arc 빌더 인센티브 및 미션',
    taskStreakTitle: '일일 정산 스트릭',
    taskStreakDesc: '정산 3회 완료 시 +0.5% 수익률 부스트 해제',
    taskAgentTitle: '에이전틱 마이크로 태스크 핑',
    taskAgentDesc: '0.0001 USDC 보상을 위한 RPC 검증 핑 실행',
    taskAgentBtn: '검증 핑 실행',
    taskRebateActive: '빌더 스탬프 보유로 5% POS 수수료 환급 활성화됨',
    taskRebateInactive: 'POS 수수료 환급을 위해 빌더 스탬프를 받으세요'
  },
  es: {
    title: 'ARC SETTLEMENT HUB',
    subtitle: 'motor de liquidación usdc programable en red arc',
    identityHeader: 'identidad arc multi-cadena',
    verified: 'creador arc verificado',
    notConnected: 'billetera desconectada',
    boundId: 'id arc up vinculado',
    issueUpId: 'registrar nombre',
    liveBalance: 'saldo de tesorería arc',
    multichainHeader: 'enrutamiento de activos en red arc',
    workflowHeader: 'flujo de trabajo para creadores arc',
    step1: '1. vincular identidad arc y billetera',
    step1Sub: 'registra identidad de forma determinista en arc',
    done: 'hecho ✓',
    pending: 'pendiente',
    step2: '2. ejecutar liquidación usdc en arc',
    step2Sub: 'ejecutado: {count} liquidaciones',
    run: 'ejecutar',
    running: 'ejecutando...',
    step3: '3. reclamar sello de creador arc',
    step3Sub: 'emite insignia de verificación arc',
    issued: 'emitido ✓',
    claim: 'reclamar sello',
    placeholder: 'enviar a @arc_id o billetera 0x',
    payBtn: 'pagar con arc usdc',
    processing: 'procesando en red arc...',
    noTxConnected: 'no hay registros de liquidación en arc.',
    noTxDisconnected: 'conecte billetera para ver historial de arc.',
    activityHeader: 'registro de actividad y verificación arc',
    downloadCsv: 'exportar csv ↗',
    resourcesHeader: 'enlaces de infraestructura arc',
    scanQr: 'escanear qr',
    closeQr: 'cerrar cámara',
    qrTitle: 'factura qr pos dinámica arc',
    royaltyHeader: 'motor de tarifas programables arc',
    royaltyDesc: 'distribuya tarifas de creador o pagos divididos directamente en arc.',
    distributeRoyalty: 'distribuir tarifa',
    txSuccessTitle: 'liquidación arc confirmada',
    txSuccessDesc: 'su transacción se procesó con finalización sub-segundo en arc testnet.',
    viewExplorer: 'ver en arcscan ↗',
    close: 'cerrar',
    connectWalletFirst: 'por favor conecte su billetera primero',
    treasuryDepositing: 'depositando en bóveda de tesorería en cadena...',
    treasuryFailed: 'depósito de tesorería fallido',
    feeDistributing: 'distribuyendo tarifa arc...',
    feeFailed: 'distribución de tarifa fallida',
    handleRegistered: 'nombre de usuario arc registrado: ',
    txCancelled: 'transacción cancelada',
    nativeModeSelected: 'modo: usdc nativo seleccionado',
    autoSplitActivated: 'reglas de división automática configuradas',
    cameraDenied: 'permiso de cámara denegado',
    pointCamera: 'apunte la cámara al código qr',
    treasuryVaultTitle: 'bóveda de rendimiento arc',
    treasuryVaultDesc: 'protocolo de rendimiento programable en red arc',
    currentVaultYield: 'rendimiento actual de la bóveda',
    depositedBalance: 'su saldo depositado',
    estAnnualYield: 'rendimiento anual estimado',
    depositToVault: 'depositar en bóveda',
    depositing: 'depositando...',
    scanned: 'escaneado: ',
    taskHeader: 'incentivos y tareas de creador arc',
    taskStreakTitle: 'racha diaria de liquidación',
    taskStreakDesc: 'complete 3 liquidaciones para desbloquear +0.5% de rendimiento extra',
    taskAgentTitle: 'ping de microtarea de agente',
    taskAgentDesc: 'ejecute ping de verificación RPC para un pago de 0.0001 USDC',
    taskAgentBtn: 'ejecutar ping de verificación',
    taskRebateActive: 'reembolso del 5% en tarifas POS activo con sello de creador',
    taskRebateInactive: 'reclame el sello de creador para desbloquear reembolso en tarifas POS'
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
const DEFAULT_TREASURY = '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b21A0'

function RotatingArcCoinLogo() {
  return (
    <>
      <style>{`
        @keyframes spinArcLogo3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .arc-3d-coin {
          animation: spinArcLogo3d 5s linear infinite;
          transform-style: preserve-3d;
        }
        .arc-3d-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .arc-3d-back {
          transform: rotateY(180deg);
        }
      `}</style>
      <div className="w-10 h-10 [perspective:1000px] flex items-center justify-center shrink-0">
        <div className="relative w-full h-full arc-3d-coin cursor-pointer">
          {/* Front Side: ARC */}
          <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-tr from-purple-950 via-[#130b24] to-indigo-950 border border-purple-500/60 flex items-center justify-center arc-3d-face shadow-lg shadow-purple-950/80">
            <span className="text-purple-300 font-bold text-[11px] tracking-wider font-mono">
              ARC
            </span>
          </div>

          {/* Back Side: Bridge Icon */}
          <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-tr from-purple-950 via-[#130b24] to-indigo-950 border border-purple-500/60 flex items-center justify-center arc-3d-face arc-3d-back shadow-lg shadow-purple-950/80">
            <svg
              className="w-5 h-5 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 17h18" />
              <path d="M4 17c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              <path d="M8 17v-3" />
              <path d="M16 17v-3" />
            </svg>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address })
  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()

  const [lang, setLang] = useState<Lang>('en')
  const t = translations[lang] || translations.en

  const [activeTab, setActiveTab] = useState<'upi' | 'qr' | 'treasury'>('upi')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [transferMode, setTransferMode] = useState<'native' | 'erc20'>('native')
  
  const [practiceCount, setPracticeCount] = useState(1)
  const [stampIssued, setStampIssued] = useState(false)
  const [txLoading, setTxLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const [treasuryDeposit, setTreasuryDeposit] = useState('0.01')
  const [vaultBalance, setVaultBalance] = useState('0.00')

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

  const html5QrCodeRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentWallet = address ? address.toLowerCase() : ''
  const explorerBase = 'https://testnet.arcscan.app/tx/'

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedIds = localStorage.getItem('arc_registered_upids')
    if (savedIds) {
      try { setRegisteredIds(JSON.parse(savedIds)) } catch (e) {}
    }

    if (isConnected && currentWallet) {
      const historyKey = `arc_history_${currentWallet}`
      const savedHistory = localStorage.getItem(historyKey)
      if (savedHistory) {
        try { setActivities(JSON.parse(savedHistory)) } catch (e) { setActivities([]) }
      } else {
        setActivities([])
      }

      const vaultKey = `arc_vault_${currentWallet}`
      const savedVault = localStorage.getItem(vaultKey)
      if (savedVault) {
        setVaultBalance(savedVault)
      } else {
        setVaultBalance('0.00')
      }
    } else {
      setActivities([])
      setVaultBalance('0.00')
    }
  }, [isConnected, currentWallet])

  const startCamera = async () => {
    setIsScannerOpen(true)
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (html5QrCodeRef.current) {
          try { await html5QrCodeRef.current.stop() } catch (e) {}
        }
        const scanner = new Html5Qrcode('qr-reader-container')
        html5QrCodeRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            let cleanAddr = decodedText
            if (decodedText.includes('ethereum:')) {
              cleanAddr = decodedText.split('ethereum:')[1].split('@')[0].split('?')[0]
            }
            setRecipient(cleanAddr)
            setStatusMsg(`${t.scanned}${cleanAddr.slice(0, 10)}...`)
            stopCamera()
          },
          () => {}
        )
      } catch (err) {
        console.error('Camera access error', err)
        setStatusMsg(t.cameraDenied)
      }
    }, 200)
  }

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (e) {}
      html5QrCodeRef.current = null
    }
    setIsScannerOpen(false)
  }

  const resolveRecipientAddress = (input: string): `0x${string}` => {
    const clean = input.trim()
    if (clean.startsWith('0x') && clean.length === 42) {
      return clean as `0x${string}`
    }
    const cleanHandle = clean.toLowerCase().startsWith('@') ? clean.toLowerCase() : `@${clean.toLowerCase()}`
    for (const [wAddress, hName] of Object.entries(registeredIds)) {
      if (hName.toLowerCase() === cleanHandle) {
        return wAddress as `0x${string}`
      }
    }
    return DEFAULT_TREASURY as `0x${string}`
  }

  const saveActivity = (newAct: ActivityItem) => {
    if (!currentWallet || typeof window === 'undefined') return
    const historyKey = `arc_history_${currentWallet}`
    setActivities(prev => {
      const updated = [newAct, ...prev]
      localStorage.setItem(historyKey, JSON.stringify(updated))
      return updated
    })
  }

  const triggerSuccess = (title: string, amountStr: string, hash: string, latencyMs: number) => {
    const fullExplorerUrl = `${explorerBase}${hash}`
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
      setStatusMsg(t.connectWalletFirst)
      return
    }
    let cleanId = customUpId.trim().toLowerCase()
    if (!cleanId) return
    if (!cleanId.startsWith('@')) cleanId = `@${cleanId}`

    const updated = { ...registeredIds, [currentWallet]: cleanId }
    setRegisteredIds(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('arc_registered_upids', JSON.stringify(updated))
    }
    setCustomUpId('')
    setStatusMsg(`${t.handleRegistered}${cleanId}`)
  }

  const handlePayment = async () => {
    if (!isConnected) return alert(t.notConnected)
    if (!recipient) return alert(t.placeholder)

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
      setStatusMsg(t.txCancelled)
    } finally {
      setTxLoading(false)
    }
  }

  const handleTreasuryDeposit = async () => {
    if (!isConnected) return alert(t.notConnected)
    const startTime = performance.now()
    try {
      setTxLoading(true)
      setStatusMsg(t.treasuryDepositing)

      const depAmount = treasuryDeposit && !isNaN(Number(treasuryDeposit)) ? treasuryDeposit : '0.01'
      const targetTreasury = (DEFAULT_TREASURY.length === 42 ? DEFAULT_TREASURY : address) as `0x${string}`
      
      const hash = await sendTransactionAsync({
        to: targetTreasury,
        value: parseEther(depAmount),
      })

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      const newBal = (parseFloat(vaultBalance) + parseFloat(depAmount)).toFixed(2)
      setVaultBalance(newBal)
      if (currentWallet && typeof window !== 'undefined') {
        localStorage.setItem(`arc_vault_${currentWallet}`, newBal)
      }
      
      const amtSymbol = `${depAmount} USDC`
      const txTitle = `Treasury Vault On-Chain Deposit`

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
    } catch (e: any) {
      console.error('Treasury deposit error:', e)
      setStatusMsg(e?.shortMessage || t.treasuryFailed)
    } finally {
      setTxLoading(false)
    }
  }

  const handleRunSpeedTest = async () => {
    if (!isConnected) return alert(t.notConnected)
    setSpeedTestRunning(true)
    const startTime = performance.now()
    try {
      const hash = await sendTransactionAsync({
        to: address || (DEFAULT_TREASURY as `0x${string}`),
        value: parseEther('0.00001'),
      })
      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      triggerSuccess('Arc Network Speed Test Passed', '0.00001 USDC', hash, latencyMs)
    } catch (e) {
      console.error(e)
    } fontinally {
      setSpeedTestRunning(false)
    }
  }

  const handleRoyaltyPayout = async () => {
    if (!isConnected || !address) return alert(t.notConnected)
    const startTime = performance.now()
    const targetAddress = resolveRecipientAddress(royaltyRecipient)

    try {
      setTxLoading(true)
      setStatusMsg(t.feeDistributing)

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
      setStatusMsg(t.feeFailed)
    } finally {
      setTxLoading(false)
    }
  }

  const handlePracticeTx = async () => {
    if (!isConnected) return alert(t.notConnected)
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
      setStatusMsg(t.txCancelled)
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
    : 'connect wallet to generate arc qr'

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#05070a] text-slate-100 p-4 font-mono flex items-center justify-center">
        <p className="text-xs text-purple-400 animate-pulse">loading arc settlement engine...</p>
      </main>
    )
  }

  const activeResolvedAddress = recipient ? resolveRecipientAddress(recipient) : null
  const isStreakUnlocked = practiceCount >= 3
  const effectiveApy = isStreakUnlocked ? '5.35% apy' : '4.85% apy'

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-100 p-3 sm:p-6 font-mono relative overflow-x-hidden">
      
      <div className="max-w-3xl mx-auto space-y-4">
        
        <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#0a0d14] p-4 rounded-xl border border-purple-900/40 gap-3">
          <div className="flex items-center gap-3">
            
            {/* 3D Rotating Logo Component */}
            <RotatingArcCoinLogo />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">{t.title}</h1>
                <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/60 font-medium shrink-0">
                  PRIMARY
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-[#05070a] border border-slate-800 text-slate-300 text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="en">🌐 English</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="es">🇪🇸 Español</option>
            </select>
            
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </header>

        {statusMsg && (
          <div className="bg-purple-950/60 border border-purple-500/50 text-purple-200 p-2.5 rounded-lg text-xs flex justify-between items-center gap-2">
            <span className="truncate">{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-slate-400 hover:text-white px-1">✕</button>
          </div>
        )}

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{t.identityHeader}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isConnected ? t.verified : t.notConnected}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">{t.boundId}</span>
              <span className="font-semibold text-purple-300">{isConnected ? userUpId : '--'}</span>
            </div>
            <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">{t.liveBalance}</span>
              <span className="font-semibold text-emerald-400">
                {isConnected 
                  ? (balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 'Live USDC') 
                  : '--'}
              </span>
            </div>
          </div>

          {isConnected && (
            <div className="bg-[#05070a] p-2.5 rounded-lg border border-slate-800 flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="register handle (e.g. @bhupendra)" 
                value={customUpId}
                onChange={(e) => setCustomUpId(e.target.value)}
                className="bg-[#0a0d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full"
              />
              <button 
                onClick={handleRegisterUpId}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all font-medium shrink-0"
              >
                {t.issueUpId}
              </button>
            </div>
          )}

          <div className="pt-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-medium">{t.multichainHeader}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              
              <button 
                onClick={() => {
                  setTransferMode('native')
                  setActiveTab('upi')
                  setStatusMsg(t.nativeModeSelected)
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  transferMode === 'native' 
                    ? 'bg-purple-950/40 border-purple-500' 
                    : 'bg-[#05070a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <p className="text-purple-400 font-semibold text-[10px]">arc testnet</p>
                <p className="text-slate-200 mt-0.5 font-bold text-xs">native usdc</p>
                <p className="text-[9px] text-slate-400 mt-1">click to select mode</p>
              </button>

              <button 
                onClick={() => setCctpModalOpen(true)}
                className="bg-[#05070a] hover:border-emerald-500/50 p-2.5 rounded-lg border border-slate-800 text-left transition-all"
              >
                <p className="text-slate-400 font-semibold text-[10px]">circle cctp</p>
                <p className="text-emerald-400 mt-0.5 font-bold text-xs">cross-chain bridge ↗</p>
                <p className="text-[9px] text-slate-400 mt-1">click to test cctp</p>
              </button>

              <button 
                onClick={handleRunSpeedTest}
                disabled={speedTestRunning}
                className="bg-[#05070a] hover:border-indigo-500/50 p-2.5 rounded-lg border border-slate-800 text-left transition-all"
              >
                <p className="text-slate-400 font-semibold text-[10px]">deterministic engine</p>
                <p className="text-indigo-400 mt-0.5 font-bold text-xs">speed benchmark</p>
                <p className="text-[9px] text-slate-400 mt-1">{speedTestRunning ? 'testing...' : 'click to run test'}</p>
              </button>

              <button 
                onClick={() => setSplitModalOpen(true)}
                className="bg-[#05070a] hover:border-amber-500/50 p-2.5 rounded-lg border border-slate-800 text-left transition-all"
              >
                <p className="text-slate-400 font-semibold text-[10px]">payment ux</p>
                <p className="text-amber-400 mt-0.5 font-bold text-xs">auto-split splitter</p>
                <p className="text-[9px] text-slate-400 mt-1">click to configure</p>
              </button>

            </div>
          </div>
        </section>

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-indigo-900/40 space-y-3">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{t.taskHeader}</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-200 font-bold">{t.taskStreakTitle}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                  isStreakUnlocked 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {practiceCount}/3 txns
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{t.taskStreakDesc}</p>
            </div>

            <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-200 font-bold">{t.taskAgentTitle}</span>
                <button 
                  onClick={handlePracticeTx}
                  disabled={txLoading || !isConnected}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded transition-all font-medium"
                >
                  {t.taskAgentBtn}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">{t.taskAgentDesc}</p>
            </div>
          </div>

          <div className="bg-[#05070a] p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>pos fee status:</span>
            <span className={stampIssued ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {stampIssued ? t.taskRebateActive : t.taskRebateInactive}
            </span>
          </div>
        </section>

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-purple-900/40 space-y-2.5">
          <div>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{t.royaltyHeader}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">{t.royaltyDesc}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text"
              placeholder="address 0x... or @handle"
              value={royaltyRecipient}
              onChange={(e) => setRoyaltyRecipient(e.target.value)}
              className="flex-1 bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <input 
                type="text"
                placeholder="amount"
                value={royaltyAmount}
                onChange={(e) => setRoyaltyAmount(e.target.value)}
                className="w-1/2 sm:w-20 bg-[#05070a] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRoyaltyPayout}
                disabled={txLoading || !isConnected}
                className="w-1/2 sm:w-auto bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-lg px-3 py-2 transition-all shrink-0"
              >
                {t.distributeRoyalty}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-2.5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.workflowHeader}</h2>
          
          <div className="flex justify-between items-center bg-[#05070a] p-2.5 rounded-lg border border-slate-800/80 gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{t.step1}</p>
              <p className="text-[10px] text-slate-500 truncate">{t.step1Sub}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium shrink-0 ${
              isConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isConnected ? t.done : t.pending}
            </span>
          </div>

          <div className="flex justify-between items-center bg-[#05070a] p-2.5 rounded-lg border border-slate-800/80 gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{t.step2}</p>
              <p className="text-[10px] text-slate-500 truncate">{t.step2Sub.replace('{count}', practiceCount.toString())}</p>
            </div>
            <button 
              onClick={handlePracticeTx}
              disabled={txLoading || !isConnected}
              className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3 py-1 rounded-lg transition-all font-medium shrink-0"
            >
              {txLoading ? t.running : t.run}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#05070a] p-2.5 rounded-lg border border-slate-800/80 gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{t.step3}</p>
              <p className="text-[10px] text-slate-500 truncate">{t.step3Sub}</p>
            </div>
            <button 
              onClick={() => isConnected && setStampIssued(!stampIssued)}
              disabled={!isConnected}
              className={`text-xs px-2.5 py-1 rounded border font-medium transition-all shrink-0 ${
                stampIssued 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {stampIssued ? t.issued : t.claim}
            </button>
          </div>
        </section>

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex border-b border-slate-800 gap-1 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('upi')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 shrink-0 ${
                activeTab === 'upi' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              arc usdc transfer
            </button>
            <button 
              onClick={() => setActiveTab('qr')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 shrink-0 ${
                activeTab === 'qr' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              pos qr invoice
            </button>
            <button 
              onClick={() => setActiveTab('treasury')}
              className={`pb-2 px-3 text-xs font-medium transition-all border-b-2 shrink-0 ${
                activeTab === 'treasury' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              arc yield treasury
            </button>
          </div>

          {activeTab === 'upi' && (
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder={t.placeholder} 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1 bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={isScannerOpen ? stopCamera : startCamera}
                  className="bg-[#05070a] border border-slate-700 hover:border-purple-500 text-purple-400 text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 font-medium shrink-0"
                >
                  {isScannerOpen ? t.closeQr : t.scanQr}
                </button>
              </div>

              {recipient && activeResolvedAddress && (
                <div className="text-[10px] bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-slate-400 flex justify-between gap-2 overflow-hidden">
                  <span>resolved address:</span>
                  <span className="text-purple-300 font-mono truncate">{activeResolvedAddress}</span>
                </div>
              )}

              {isScannerOpen && (
                <div className="bg-[#05070a] p-3 rounded-lg border border-purple-500/50 space-y-2">
                  <div id="qr-reader-container" className="w-full h-48 rounded-lg overflow-hidden bg-black mx-auto max-w-xs" />
                  <p className="text-[10px] text-center text-slate-400">{t.pointCamera}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center bg-[#05070a] p-2 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px]">transfer route:</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setTransferMode('native')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      transferMode === 'native' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    native gas usdc
                  </button>
                  <button 
                    onClick={() => setTransferMode('erc20')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      transferMode === 'erc20' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    erc-20 contract
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-1/3 bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handlePayment}
                  disabled={txLoading || !isConnected}
                  className="w-2/3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-lg py-2 transition-all"
                >
                  {txLoading ? t.processing : `${t.payBtn} (${amount} usdc)`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-[#05070a] p-5 rounded-lg border border-slate-800 text-center space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t.qrTitle}</p>
              
              <div className="w-36 h-36 bg-slate-900 border border-purple-500/30 mx-auto rounded-lg flex flex-col items-center justify-center p-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(receiveQrData)}`} 
                  alt="arc receiver qr code"
                  className="w-28 h-28 rounded bg-white p-1"
                />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-purple-400">{userUpId}</p>
                <p className="text-[10px] text-slate-400 break-all max-w-xs mx-auto">{address || 'no wallet connected'}</p>
                <p className="text-[10px] text-emerald-400 font-semibold pt-1">network: arc testnet (usdc)</p>
              </div>
            </div>
          )}

          {activeTab === 'treasury' && (
            <div className="bg-[#05070a] p-3.5 rounded-lg border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-purple-300 uppercase">{t.treasuryVaultTitle}</h3>
                  <p className="text-[10px] text-slate-400">{t.treasuryVaultDesc}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">{t.currentVaultYield}</p>
                  <p className="text-xs font-bold text-emerald-400">{effectiveApy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#0a0d14] p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">{t.depositedBalance}</p>
                  <p className="text-xs font-bold text-purple-300 mt-0.5">{vaultBalance} usdc</p>
                </div>
                <div className="bg-[#0a0d14] p-2.5 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">{t.estAnnualYield}</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">
                    {(parseFloat(vaultBalance) * (isStreakUnlocked ? 0.0535 : 0.0485)).toFixed(4)} usdc
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={treasuryDeposit}
                  onChange={(e) => setTreasuryDeposit(e.target.value)}
                  placeholder="amount in usdc"
                  className="w-1/2 bg-[#0a0d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handleTreasuryDeposit}
                  disabled={txLoading || !isConnected}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium text-xs rounded-lg py-1.5 transition-all"
                >
                  {txLoading ? t.depositing : t.depositToVault}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-2.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.resourcesHeader}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <a 
              href="https://testnet.arcscan.app/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#05070a] hover:bg-[#0f1420] p-2.5 rounded-lg border border-purple-900/50 text-purple-300 transition-all font-medium flex items-center justify-between"
            >
              <span>arcscan explorer</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://faucet.circle.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#05070a] hover:bg-[#0f1420] p-2.5 rounded-lg border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>circle usdc faucet</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a 
              href="https://www.arc.io/" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#05070a] hover:bg-[#0f1420] p-2.5 rounded-lg border border-slate-800 text-slate-300 transition-all font-medium flex items-center justify-between"
            >
              <span>arc protocol docs</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </section>

        <section className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.activityHeader}</span>
            {isConnected && activities.length > 0 && (
              <button 
                onClick={handleDownloadCSV}
                className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-all"
              >
                {t.downloadCsv}
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {isConnected ? (
              activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="bg-[#05070a] p-2.5 rounded-lg border border-slate-800/80 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-purple-300 font-medium truncate">{act.title}</p>
                        {act.latencyMs && (
                          <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 py-0.2 rounded shrink-0">
                            {act.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{act.timestamp} • {act.amount}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <a 
                        href={act.explorerUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-purple-400 hover:underline text-[10px] block font-mono"
                      >
                        verify ↗ ({act.txHash})
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800/80 text-center text-slate-500 text-xs">
                  {t.noTxConnected}
                </div>
              )
            ) : (
              <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800/80 text-center text-slate-500 text-xs">
                {t.noTxDisconnected}
              </div>
            )}
          </div>
        </section>

      </div>

      {cctpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0d14] border border-emerald-500/40 w-full max-w-sm rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase">circle cctp native bridge</h3>
            <p className="text-[11px] text-slate-400">burn & mint native usdc across arc network via circle cctp protocol.</p>
            
            <div className="space-y-1 text-xs">
              <label className="text-slate-400 text-[10px]">transfer amount (usdc):</label>
              <input 
                type="text" 
                value={cctpAmount}
                onChange={(e) => setCctpAmount(e.target.value)}
                className="w-full bg-[#05070a] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={async () => {
                  setCctpModalOpen(false)
                  await handlePracticeTx()
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded-lg font-medium"
              >
                execute cctp bridge
              </button>
              <button 
                onClick={() => setCctpModalOpen(false)}
                className="w-1/3 bg-slate-800 text-slate-300 text-xs py-2 rounded-lg"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {splitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0d14] border border-amber-500/40 w-full max-w-sm rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase">programmable auto-splitter</h3>
            <p className="text-[11px] text-slate-400">automatically split incoming usdc settlements: 80% merchant, 15% treasury, 5% royalty fee.</p>
            
            <div className="bg-[#05070a] p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">merchant payout:</span>
                <span className="text-slate-200 font-bold">80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">vault treasury deposit:</span>
                <span className="text-emerald-400 font-bold">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">protocol fee:</span>
                <span className="text-purple-400 font-bold">5%</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setSplitModalOpen(false)
                setStatusMsg(t.autoSplitActivated)
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs py-2 rounded-lg font-medium"
            >
              activate auto-split rules
            </button>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0d14] border border-purple-500/40 w-full max-w-sm rounded-xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xl mx-auto border border-emerald-500/40">
              ✓
            </div>
            
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-white">{t.txSuccessTitle}</h3>
              <p className="text-[11px] text-slate-400">{t.txSuccessDesc}</p>
            </div>

            <div className="bg-[#05070a] p-3 rounded-lg border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <span>execution speed:</span>
                <span className="text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                  {successModal.latencyMs} ms
                </span>
              </div>
              <p className="text-purple-300 font-semibold truncate">{successModal.title}</p>
              <p className="text-emerald-400 font-bold">{successModal.amount}</p>
              <p className="text-slate-500 text-[9px] truncate">hash: {successModal.hash}</p>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <a 
                href={successModal.url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2 rounded-lg block"
              >
                {t.viewExplorer}
              </a>
              <button 
                onClick={() => setSuccessModal(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg font-medium"
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
