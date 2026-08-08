import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useWriteContract,
} from 'wagmi'
import {
  erc20Abi,
  formatUnits,
  isAddress,
  parseUnits,
} from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type Lang = 'en' | 'hi' | 'ko' | 'es'
type Tab = 'payment' | 'qr' | 'treasury' | 'assets'
type TransferMode = 'usdc' | 'native'

interface ActivityItem {
  id: string
  title: string
  timestamp: string
  amount: string
  txHash: string
  explorerUrl: string
  status: 'confirmed' | 'submitted' | 'failed'
  latencyMs?: number
}

interface ModalDetails {
  title: string
  amount: string
  hash: string
  url: string
  latencyMs?: number
}

interface RegisteredIds {
  [wallet: string]: string
}

interface NetworkBalance {
  name: string
  symbol: string
  balance: string
  type: 'EVM' | 'UTXO'
  explorerUrl?: string
  error?: string
}

/*
|--------------------------------------------------------------------------
| Arcsetu configuration
|--------------------------------------------------------------------------
*/

const ARC_CHAIN_ID = 5042002

// Existing address from your previous Arcsetu code.
const ARC_USDC_ADDRESS =
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`

// Existing treasury address from your previous code.
const DEFAULT_TREASURY =
  '0x85Bb410B9cB937340CdA2e3B3Da12C55eF2A67b' as `0x${string}`

const ARC_EXPLORER = 'https://testnet.arcscan.app'
const ARC_TX_EXPLORER = `${ARC_EXPLORER}/tx/`
const ARC_ADDRESS_EXPLORER = `${ARC_EXPLORER}/address/`

const USDC_DECIMALS = 6

const translations = {
  en: {
    title: 'ARCSETU',
    subtitle: 'Global programmable settlement & payment hub',
    connect: 'Connect wallet',
    connected: 'Connected',
    disconnected: 'Wallet disconnected',
    network: 'Network',
    correctNetwork: 'Arc Testnet',
    wrongNetwork: 'Wrong network',
    switchNetwork: 'Switch to Arc',
    identity: 'Arc identity',
    register: 'Register handle',
    handlePlaceholder: '@yourname',
    wallet: 'Wallet',
    balance: 'USDC balance',
    nativeBalance: 'Native balance',
    payment: 'Payment',
    qr: 'QR Pay',
    treasury: 'Treasury',
    assets: 'Assets',
    recipient: 'Recipient',
    recipientPlaceholder: '0x address or @handle',
    amount: 'Amount',
    sendUsdc: 'Send USDC',
    sendNative: 'Send native',
    sending: 'Sending...',
    scan: 'Scan QR',
    close: 'Close',
    receive: 'Receive',
    copy: 'Copy',
    copied: 'Copied',
    activity: 'Activity',
    noActivity: 'No transactions recorded yet.',
    explorer: 'View on ArcScan',
    export: 'Export CSV',
    treasuryTitle: 'Treasury',
    treasuryDesc: 'Programmable treasury settlement',
    treasuryAddress: 'Treasury address',
    deposit: 'Deposit USDC',
    depositAmount: 'Deposit amount',
    depositing: 'Depositing...',
    fee: 'Programmable fee',
    feeRecipient: 'Fee recipient',
    distribute: 'Distribute',
    distributing: 'Distributing...',
    royalty: 'Royalty / fee routing',
    merchant: 'Merchant',
    protocol: 'Protocol',
    vault: 'Vault',
    cctp: 'Circle CCTP',
    comingSoon: 'Integration ready',
    multiChain: 'Multi-chain assets',
    refresh: 'Refresh',
    loading: 'Loading...',
    status: 'Status',
    confirmed: 'Confirmed',
    submitted: 'Submitted',
    failed: 'Failed',
    connectedWallet: 'Connected wallet',
    sendMode: 'Transfer mode',
    usdcMode: 'USDC',
    nativeMode: 'Native gas token',
    qrTitle: 'Arcsetu payment QR',
    qrDesc: 'Scan this QR to pay this wallet',
    noWallet: 'Connect wallet to generate QR',
    treasuryBalance: 'Treasury balance',
    estimatedYield: 'Estimated yield',
    yieldNote: 'Demo display only — not a guaranteed APY',
    security: 'Security',
    securityNote:
      'Transactions are signed by your wallet. Arcsetu never asks for your private key.',
    invalidRecipient: 'Enter a valid 0x recipient address or registered handle.',
    invalidAmount: 'Enter a valid amount greater than zero.',
    connectFirst: 'Please connect your wallet first.',
    wrongChainMessage:
      'Please switch your wallet to Arc Testnet before sending transactions.',
    transactionCancelled: 'Transaction cancelled or failed.',
    transactionSubmitted: 'Transaction submitted successfully.',
    handleSaved: 'Arc handle saved locally.',
    copiedAddress: 'Address copied.',
    scannerError: 'Unable to access camera.',
    nativeWarning:
      'Native transfer sends the network gas token, not USDC.',
    balanceUnavailable: 'Balance unavailable',
  },

  hi: {
    title: 'ARCSETU',
    subtitle: 'ग्लोबल प्रोग्रामेबल सेटलमेंट और पेमेंट हब',
    connect: 'वॉलेट कनेक्ट करें',
    connected: 'कनेक्टेड',
    disconnected: 'वॉलेट कनेक्ट नहीं है',
    network: 'नेटवर्क',
    correctNetwork: 'Arc Testnet',
    wrongNetwork: 'गलत नेटवर्क',
    switchNetwork: 'Arc पर जाएँ',
    identity: 'Arc पहचान',
    register: 'हैंडल रजिस्टर करें',
    handlePlaceholder: '@आपकानाम',
    wallet: 'वॉलेट',
    balance: 'USDC बैलेंस',
    nativeBalance: 'नेटिव बैलेंस',
    payment: 'पेमेंट',
    qr: 'QR पे',
    treasury: 'ट्रेजरी',
    assets: 'एसेट्स',
    recipient: 'प्राप्तकर्ता',
    recipientPlaceholder: '0x पता या @handle',
    amount: 'राशि',
    sendUsdc: 'USDC भेजें',
    sendNative: 'नेटिव भेजें',
    sending: 'भेजा जा रहा है...',
    scan: 'QR स्कैन',
    close: 'बंद करें',
    receive: 'प्राप्त करें',
    copy: 'कॉपी',
    copied: 'कॉपी हुआ',
    activity: 'गतिविधि',
    noActivity: 'अभी कोई ट्रांजैक्शन रिकॉर्ड नहीं है।',
    explorer: 'ArcScan पर देखें',
    export: 'CSV एक्सपोर्ट',
    treasuryTitle: 'ट्रेजरी',
    treasuryDesc: 'प्रोग्रामेबल ट्रेजरी सेटलमेंट',
    treasuryAddress: 'ट्रेजरी पता',
    deposit: 'USDC जमा करें',
    depositAmount: 'जमा राशि',
    depositing: 'जमा हो रहा है...',
    fee: 'प्रोग्रामेबल फीस',
    feeRecipient: 'फीस प्राप्तकर्ता',
    distribute: 'डिस्ट्रीब्यूट',
    distributing: 'डिस्ट्रीब्यूट हो रहा है...',
    royalty: 'रॉयल्टी / फीस रूटिंग',
    merchant: 'मर्चेंट',
    protocol: 'प्रोटोकॉल',
    vault: 'वॉल्ट',
    cctp: 'Circle CCTP',
    comingSoon: 'इंटीग्रेशन के लिए तैयार',
    multiChain: 'मल्टी-चेन एसेट्स',
    refresh: 'रिफ्रेश',
    loading: 'लोड हो रहा है...',
    status: 'स्थिति',
    confirmed: 'कन्फर्म्ड',
    submitted: 'सबमिटेड',
    failed: 'विफल',
    connectedWallet: 'कनेक्टेड वॉलेट',
    sendMode: 'ट्रांसफर मोड',
    usdcMode: 'USDC',
    nativeMode: 'नेटिव गैस टोकन',
    qrTitle: 'Arcsetu पेमेंट QR',
    qrDesc: 'इस वॉलेट को पेमेंट करने के लिए QR स्कैन करें',
    noWallet: 'QR बनाने के लिए वॉलेट कनेक्ट करें',
    treasuryBalance: 'ट्रेजरी बैलेंस',
    estimatedYield: 'अनुमानित यील्ड',
    yieldNote: 'सिर्फ डेमो डिस्प्ले — गारंटीड APY नहीं',
    security: 'सुरक्षा',
    securityNote:
      'ट्रांजैक्शन आपके वॉलेट द्वारा साइन होते हैं। Arcsetu कभी private key नहीं मांगता।',
    invalidRecipient: 'सही 0x address या registered handle डालें।',
    invalidAmount: 'शून्य से अधिक सही राशि डालें।',
    connectFirst: 'पहले वॉलेट कनेक्ट करें।',
    wrongChainMessage:
      'ट्रांजैक्शन भेजने से पहले वॉलेट को Arc Testnet पर बदलें।',
    transactionCancelled: 'ट्रांजैक्शन रद्द या विफल हुआ।',
    transactionSubmitted: 'ट्रांजैक्शन सफलतापूर्वक भेज दिया गया।',
    handleSaved: 'Arc handle लोकली सेव हो गया।',
    copiedAddress: 'Address कॉपी हो गया।',
    scannerError: 'कैमरा एक्सेस नहीं हो पाया।',
    nativeWarning:
      'नेटिव ट्रांसफर नेटवर्क का गैस टोकन भेजता है, USDC नहीं।',
    balanceUnavailable: 'बैलेंस उपलब्ध नहीं',
  },

  ko: {
    title: 'ARCSETU',
    subtitle: '글로벌 프로그래머블 결제 및 정산 허브',
    connect: '지갑 연결',
    connected: '연결됨',
    disconnected: '지갑 연결 해제',
    network: '네트워크',
    correctNetwork: 'Arc Testnet',
    wrongNetwork: '잘못된 네트워크',
    switchNetwork: 'Arc로 전환',
    identity: 'Arc 신원',
    register: '핸들 등록',
    handlePlaceholder: '@yourname',
    wallet: '지갑',
    balance: 'USDC 잔액',
    nativeBalance: '네이티브 잔액',
    payment: '결제',
    qr: 'QR 결제',
    treasury: '트레저리',
    assets: '자산',
    recipient: '수신자',
    recipientPlaceholder: '0x 주소 또는 @handle',
    amount: '금액',
    sendUsdc: 'USDC 전송',
    sendNative: '네이티브 전송',
    sending: '전송 중...',
    scan: 'QR 스캔',
    close: '닫기',
    receive: '받기',
    copy: '복사',
    copied: '복사됨',
    activity: '활동',
    noActivity: '아직 거래 기록이 없습니다.',
    explorer: 'ArcScan에서 보기',
    export: 'CSV 내보내기',
    treasuryTitle: '트레저리',
    treasuryDesc: '프로그래머블 트레저리 정산',
    treasuryAddress: '트레저리 주소',
    deposit: 'USDC 예치',
    depositAmount: '예치 금액',
    depositing: '예치 중...',
    fee: '프로그래머블 수수료',
    feeRecipient: '수수료 수신자',
    distribute: '분배',
    distributing: '분배 중...',
    royalty: '로열티 / 수수료 라우팅',
    merchant: '가맹점',
    protocol: '프로토콜',
    vault: '볼트',
    cctp: 'Circle CCTP',
    comingSoon: '통합 준비 완료',
    multiChain: '멀티체인 자산',
    refresh: '새로고침',
    loading: '로드 중...',
    status: '상태',
    confirmed: '확인됨',
    submitted: '제출됨',
    failed: '실패',
    connectedWallet: '연결된 지갑',
    sendMode: '전송 모드',
    usdcMode: 'USDC',
    nativeMode: '네이티브 가스 토큰',
    qrTitle: 'Arcsetu 결제 QR',
    qrDesc: '이 지갑으로 결제하려면 QR을 스캔하세요',
    noWallet: 'QR을 생성하려면 지갑을 연결하세요',
    treasuryBalance: '트레저리 잔액',
    estimatedYield: '예상 수익',
    yieldNote: '데모 표시만 제공 — 보장된 APY가 아닙니다',
    security: '보안',
    securityNote:
      '모든 거래는 지갑에서 서명됩니다. Arcsetu는 개인 키를 요청하지 않습니다.',
    invalidRecipient: '유효한 0x 주소 또는 등록된 핸들을 입력하세요.',
    invalidAmount: '0보다 큰 유효한 금액을 입력하세요.',
    connectFirst: '먼저 지갑을 연결하세요.',
    wrongChainMessage:
      '거래 전 지갑을 Arc Testnet으로 전환하세요.',
    transactionCancelled: '거래가 취소되었거나 실패했습니다.',
    transactionSubmitted: '거래가 성공적으로 제출되었습니다.',
    handleSaved: 'Arc 핸들이 로컬에 저장되었습니다.',
    copiedAddress: '주소가 복사되었습니다.',
    scannerError: '카메라에 접근할 수 없습니다.',
    nativeWarning:
      '네이티브 전송은 USDC가 아닌 네트워크 가스 토큰을 전송합니다.',
    balanceUnavailable: '잔액을 사용할 수 없습니다.',
  },

  es: {
    title: 'ARCSETU',
    subtitle: 'Centro global de pagos y liquidación programable',
    connect: 'Conectar billetera',
    connected: 'Conectada',
    disconnected: 'Billetera desconectada',
    network: 'Red',
    correctNetwork: 'Arc Testnet',
    wrongNetwork: 'Red incorrecta',
    switchNetwork: 'Cambiar a Arc',
    identity: 'Identidad Arc',
    register: 'Registrar handle',
    handlePlaceholder: '@tunombre',
    wallet: 'Billetera',
    balance: 'Saldo USDC',
    nativeBalance: 'Saldo nativo',
    payment: 'Pago',
    qr: 'Pago QR',
    treasury: 'Tesorería',
    assets: 'Activos',
    recipient: 'Destinatario',
    recipientPlaceholder: 'dirección 0x o @handle',
    amount: 'Cantidad',
    sendUsdc: 'Enviar USDC',
    sendNative: 'Enviar nativo',
    sending: 'Enviando...',
    scan: 'Escanear QR',
    close: 'Cerrar',
    receive: 'Recibir',
    copy: 'Copiar',
    copied: 'Copiado',
    activity: 'Actividad',
    noActivity: 'No hay transacciones registradas.',
    explorer: 'Ver en ArcScan',
    export: 'Exportar CSV',
    treasuryTitle: 'Tesorería',
    treasuryDesc: 'Liquidación de tesorería programable',
    treasuryAddress: 'Dirección de tesorería',
    deposit: 'Depositar USDC',
    depositAmount: 'Cantidad de depósito',
    depositing: 'Depositando...',
    fee: 'Tarifa programable',
    feeRecipient: 'Destinatario de tarifa',
    distribute: 'Distribuir',
    distributing: 'Distribuyendo...',
    royalty: 'Royalty / routing de tarifas',
    merchant: 'Comerciante',
    protocol: 'Protocolo',
    vault: 'Bóveda',
    cctp: 'Circle CCTP',
    comingSoon: 'Listo para integración',
    multiChain: 'Activos multicadena',
    refresh: 'Actualizar',
    loading: 'Cargando...',
    status: 'Estado',
    confirmed: 'Confirmada',
    submitted: 'Enviada',
    failed: 'Fallida',
    connectedWallet: 'Billetera conectada',
    sendMode: 'Modo de transferencia',
    usdcMode: 'USDC',
    nativeMode: 'Token nativo de gas',
    qrTitle: 'QR de pago Arcsetu',
    qrDesc: 'Escanea este QR para pagar a esta billetera',
    noWallet: 'Conecta una billetera para generar el QR',
    treasuryBalance: 'Saldo de tesorería',
    estimatedYield: 'Rendimiento estimado',
    yieldNote: 'Solo demostración — APY no garantizado',
    security: 'Seguridad',
    securityNote:
      'Las transacciones son firmadas por tu billetera. Arcsetu nunca solicita tu clave privada.',
    invalidRecipient: 'Introduce una dirección 0x válida o un handle registrado.',
    invalidAmount: 'Introduce una cantidad válida mayor que cero.',
    connectFirst: 'Conecta primero tu billetera.',
    wrongChainMessage:
      'Cambia tu billetera a Arc Testnet antes de enviar transacciones.',
    transactionCancelled: 'Transacción cancelada o fallida.',
    transactionSubmitted: 'Transacción enviada correctamente.',
    handleSaved: 'Handle Arc guardado localmente.',
    copiedAddress: 'Dirección copiada.',
    scannerError: 'No se pudo acceder a la cámara.',
    nativeWarning:
      'La transferencia nativa envía el token de gas de la red, no USDC.',
    balanceUnavailable: 'Saldo no disponible',
  },
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const publicClient = usePublicClient()

  const {
    data: nativeBalanceData,
    refetch: refetchNativeBalance,
  } = useBalance({
    address,
    query: {
      enabled: Boolean(address),
    },
  })

  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()

  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const [activeTab, setActiveTab] = useState<Tab>('payment')
  const [transferMode, setTransferMode] =
    useState<TransferMode>('usdc')

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('1')

  const [customHandle, setCustomHandle] = useState('')
  const [registeredIds, setRegisteredIds] =
    useState<RegisteredIds>({})

  const [usdcBalance, setUsdcBalance] = useState('0.000000')
  const [usdcLoading, setUsdcLoading] = useState(false)

  const [activities, setActivities] =
    useState<ActivityItem[]>([])

  const [statusMsg, setStatusMsg] = useState('')
  const [txLoading, setTxLoading] = useState(false)

  const [successModal, setSuccessModal] =
    useState<ModalDetails | null>(null)

  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const scannerRef = useRef<any>(null)

  const [treasuryAmount, setTreasuryAmount] = useState('1')
  const [feeRecipient, setFeeRecipient] = useState('')
  const [feeAmount, setFeeAmount] = useState('0.05')
  const [feeLoading, setFeeLoading] = useState(false)

  const [copied, setCopied] = useState('')

  const t = translations[lang]

  const currentWallet = address?.toLowerCase() || ''

  const isArcNetwork = chainId === ARC_CHAIN_ID

  const userHandle =
    currentWallet && registeredIds[currentWallet]
      ? registeredIds[currentWallet]
      : address
        ? `@ARC-${address.slice(-5)}`
        : '--'

  const receiveQrData = useMemo(() => {
    if (!address) return ''
    return `ethereum:${address}@${ARC_CHAIN_ID}`
  }, [address])

  /*
  |--------------------------------------------------------------------------
  | Mount
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setMounted(true)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Local storage
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    const savedIds =
      localStorage.getItem('arcsetu_registered_handles')

    if (savedIds) {
      try {
        setRegisteredIds(JSON.parse(savedIds))
      } catch {
        setRegisteredIds({})
      }
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    if (!currentWallet) {
      setActivities([])
      return
    }

    const key = `arcsetu_activity_${currentWallet}`

    const saved = localStorage.getItem(key)

    if (saved) {
      try {
        setActivities(JSON.parse(saved))
      } catch {
        setActivities([])
      }
    } else {
      setActivities([])
    }
  }, [mounted, currentWallet])

  /*
  |--------------------------------------------------------------------------
  | USDC balance
  |--------------------------------------------------------------------------
  */

  const fetchUsdcBalance = async () => {
    if (!address || !publicClient) {
      setUsdcBalance('0.000000')
      return
    }

    try {
      setUsdcLoading(true)

      const rawBalance = await publicClient.readContract({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      })

      setUsdcBalance(
        Number(formatUnits(rawBalance, USDC_DECIMALS)).toFixed(6)
      )
    } catch (error) {
      console.error('USDC balance error:', error)
      setUsdcBalance('0.000000')
    } finally {
      setUsdcLoading(false)
    }
  }

  useEffect(() => {
    if (!mounted) return

    fetchUsdcBalance()
  }, [mounted, address, publicClient, chainId])

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const saveActivity = (activity: ActivityItem) => {
    if (!currentWallet || typeof window === 'undefined') return

    setActivities((previous) => {
      const updated = [activity, ...previous].slice(0, 100)

      localStorage.setItem(
        `arcsetu_activity_${currentWallet}`,
        JSON.stringify(updated)
      )

      return updated
    })
  }

  const cleanError = (error: any) => {
    const message =
      error?.shortMessage ||
      error?.message ||
      'Transaction failed.'

    if (
      message.toLowerCase().includes('user rejected') ||
      message.toLowerCase().includes('user denied')
    ) {
      return t.transactionCancelled
    }

    return message.slice(0, 180)
  }

  const validateReady = () => {
    if (!isConnected || !address) {
      setStatusMsg(t.connectFirst)
      return false
    }

    if (!isArcNetwork) {
      setStatusMsg(t.wrongChainMessage)
      return false
    }

    return true
  }

  const resolveRecipient = (
    input: string
  ): `0x${string}` | null => {
    const clean = input.trim()

    if (isAddress(clean)) {
      return clean as `0x${string}`
    }

    const normalized = clean.startsWith('@')
      ? clean.toLowerCase()
      : `@${clean.toLowerCase()}`

    for (const [wallet, handle] of Object.entries(
      registeredIds
    )) {
      if (handle.toLowerCase() === normalized) {
        return wallet as `0x${string}`
      }
    }

    return null
  }

  const validateAmount = (value: string) => {
    const numeric = Number(value)

    return (
      Number.isFinite(numeric) &&
      numeric > 0 &&
      value.trim() !== ''
    )
  }

  const shortAddress = (value: string) => {
    if (!value) return ''
    return `${value.slice(0, 6)}...${value.slice(-4)}`
  }

  const addActivity = async (
    title: string,
    amountText: string,
    hash: `0x${string}`,
    startTime: number
  ) => {
    let latencyMs = Math.round(performance.now() - startTime)

    let confirmed = false

    try {
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })

        confirmed = receipt.status === 'success'

        latencyMs = Math.round(performance.now() - startTime)
      }
    } catch {
      confirmed = false
    }

    const item: ActivityItem = {
      id: `${Date.now()}-${hash}`,
      title,
      timestamp: new Date().toLocaleString(),
      amount: amountText,
      txHash: hash,
      explorerUrl: `${ARC_TX_EXPLORER}${hash}`,
      status: confirmed ? 'confirmed' : 'submitted',
      latencyMs,
    }

    saveActivity(item)

    setSuccessModal({
      title,
      amount: amountText,
      hash,
      url: `${ARC_TX_EXPLORER}${hash}`,
      latencyMs,
    })

    await fetchUsdcBalance()

    try {
      await refetchNativeBalance()
    } catch {}

    return confirmed
  }

  /*
  |--------------------------------------------------------------------------
  | Handle registration
  |--------------------------------------------------------------------------
  */

  const registerHandle = () => {
    if (!currentWallet) {
      setStatusMsg(t.connectFirst)
      return
    }

    let value = customHandle.trim().toLowerCase()

    if (!value) return

    if (!value.startsWith('@')) {
      value = `@${value}`
    }

    const updated = {
      ...registeredIds,
      [currentWallet]: value,
    }

    setRegisteredIds(updated)

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'arcsetu_registered_handles',
        JSON.stringify(updated)
      )
    }

    setCustomHandle('')
    setStatusMsg(t.handleSaved)
  }

  /*
  |--------------------------------------------------------------------------
  | USDC transfer
  |--------------------------------------------------------------------------
  */

  const handleUsdcPayment = async () => {
    if (!validateReady()) return

    const target = resolveRecipient(recipient)

    if (!target) {
      setStatusMsg(t.invalidRecipient)
      return
    }

    if (!validateAmount(amount)) {
      setStatusMsg(t.invalidAmount)
      return
    }

    try {
      setTxLoading(true)
      setStatusMsg(t.sending)

      const startTime = performance.now()

      const value = parseUnits(amount, USDC_DECIMALS)

      if (Number(usdcBalance) < Number(amount)) {
        setStatusMsg(
          `${t.balance}: ${usdcBalance} USDC`
        )
        return
      }

      const hash = await writeContractAsync({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [target, value],
      })

      await addActivity(
        `USDC Transfer → ${shortAddress(target)}`,
        `${amount} USDC`,
        hash,
        startTime
      )

      setStatusMsg(t.transactionSubmitted)
    } catch (error: any) {
      console.error(error)
      setStatusMsg(cleanError(error))
    } finally {
      setTxLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Native token transfer
  |--------------------------------------------------------------------------
  */

  const handleNativePayment = async () => {
    if (!validateReady()) return

    const target = resolveRecipient(recipient)

    if (!target) {
      setStatusMsg(t.invalidRecipient)
      return
    }

    if (!validateAmount(amount)) {
      setStatusMsg(t.invalidAmount)
      return
    }

    try {
      setTxLoading(true)
      setStatusMsg(t.sending)

      const startTime = performance.now()

      const value = parseUnits(amount, 18)

      const hash = await sendTransactionAsync({
        to: target,
        value,
      })

      await addActivity(
        `Native Transfer → ${shortAddress(target)}`,
        `${amount} ${nativeBalanceData?.symbol || 'native'}`,
        hash,
        startTime
      )

      setStatusMsg(t.transactionSubmitted)
    } catch (error: any) {
      console.error(error)
      setStatusMsg(cleanError(error))
    } finally {
      setTxLoading(false)
    }
  }

  const handlePayment = async () => {
    if (transferMode === 'usdc') {
      await handleUsdcPayment()
    } else {
      await handleNativePayment()
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Treasury deposit
  |--------------------------------------------------------------------------
  */

  const handleTreasuryDeposit = async () => {
    if (!validateReady()) return

    if (!validateAmount(treasuryAmount)) {
      setStatusMsg(t.invalidAmount)
      return
    }

    try {
      setTxLoading(true)
      setStatusMsg(t.depositing)

      const startTime = performance.now()

      const value = parseUnits(
        treasuryAmount,
        USDC_DECIMALS
      )

      if (Number(usdcBalance) < Number(treasuryAmount)) {
        setStatusMsg(
          `${t.balance}: ${usdcBalance} USDC`
        )
        return
      }

      const hash = await writeContractAsync({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [DEFAULT_TREASURY, value],
      })

      await addActivity(
        'Treasury USDC Deposit',
        `${treasuryAmount} USDC`,
        hash,
        startTime
      )

      setStatusMsg(t.transactionSubmitted)
    } catch (error: any) {
      console.error(error)
      setStatusMsg(cleanError(error))
    } finally {
      setTxLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Programmable fee / royalty payout
  |--------------------------------------------------------------------------
  */

  const handleFeeDistribution = async () => {
    if (!validateReady()) return

    const target = resolveRecipient(feeRecipient)

    if (!target) {
      setStatusMsg(t.invalidRecipient)
      return
    }

    if (!validateAmount(feeAmount)) {
      setStatusMsg(t.invalidAmount)
      return
    }

    try {
      setFeeLoading(true)
      setStatusMsg(t.distributing)

      const startTime = performance.now()

      const value = parseUnits(
        feeAmount,
        USDC_DECIMALS
      )

      if (Number(usdcBalance) < Number(feeAmount)) {
        setStatusMsg(
          `${t.balance}: ${usdcBalance} USDC`
        )
        return
      }

      const hash = await writeContractAsync({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [target, value],
      })

      await addActivity(
        `Programmable Fee → ${shortAddress(target)}`,
        `${feeAmount} USDC`,
        hash,
        startTime
      )

      setStatusMsg(t.transactionSubmitted)
    } catch (error: any) {
      console.error(error)
      setStatusMsg(cleanError(error))
    } finally {
      setFeeLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | QR scanner
  |--------------------------------------------------------------------------
  */

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch {}

    scannerRef.current = null
    setScannerOpen(false)
  }

  const startScanner = async () => {
    setScannerError('')
    setScannerOpen(true)

    setTimeout(async () => {
      try {
        const module = await import('html5-qrcode')
        const Html5Qrcode = module.Html5Qrcode

        const scanner = new Html5Qrcode(
          'arcsetu-qr-reader'
        )

        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: {
              width: 220,
              height: 220,
            },
          },
          async (decodedText: string) => {
            let clean = decodedText.trim()

            if (clean.includes('ethereum:')) {
              clean = clean
                .replace('ethereum:', '')
                .split('@')[0]
                .split('?')[0]
            }

            if (isAddress(clean)) {
              setRecipient(clean)
              setStatusMsg(
                `${t.recipient}: ${shortAddress(clean)}`
              )
            } else {
              setRecipient(clean)
              setStatusMsg(
                `${t.recipient}: ${clean}`
              )
            }

            await stopScanner()
          },
          () => {}
        )
      } catch (error) {
        console.error(error)
        setScannerError(t.scannerError)
      }
    }, 250)
  }

  useEffect(() => {
    return () => {
      try {
        scannerRef.current?.stop()
      } catch {}
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Copy
  |--------------------------------------------------------------------------
  */

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      setStatusMsg(t.copiedAddress)

      setTimeout(() => {
        setCopied('')
      }, 1500)
    } catch {
      setStatusMsg('Copy failed.')
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CSV
  |--------------------------------------------------------------------------
  */

  const exportCsv = () => {
    if (!activities.length) return

    const headers = [
      'ID',
      'Title',
      'Timestamp',
      'Amount',
      'TxHash',
      'Status',
      'LatencyMs',
      'ExplorerUrl',
    ]

    const rows = activities.map((item) =>
      [
        item.id,
        item.title,
        item.timestamp,
        item.amount,
        item.txHash,
        item.status,
        item.latencyMs || '',
        item.explorerUrl,
      ]
        .map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(',')
    )

    const csv =
      headers.join(',') +
      '\n' +
      rows.join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = `arcsetu_activity_${Date.now()}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /*
  |--------------------------------------------------------------------------
  | Multi-chain balance architecture
  |--------------------------------------------------------------------------
  */

  const fetchMultiChainBalances = async (): Promise<
    NetworkBalance[]
  > => {
    if (!address) return []

    /*
     * This function is intentionally architecture-ready.
     *
     * Arcsetu can later connect:
     * Ethereum
     * Arc
     * Jiva
     * Bitcoin
     * Base
     * other supported networks
     *
     * without changing the main UI architecture.
     */

    return [
      {
        name: 'Arc Testnet',
        symbol: 'USDC',
        balance: usdcBalance,
        type: 'EVM',
        explorerUrl: `${ARC_ADDRESS_EXPLORER}${address}`,
      },
    ]
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#05070a] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-600 text-white font-black">
            ARC
          </div>

          <p className="text-xs text-purple-400 animate-pulse">
            loading arcsetu...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-100 font-mono px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl space-y-4">

        {/* HEADER */}

        <header className="rounded-2xl border border-purple-900/50 bg-[#0a0d14] p-4 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 text-sm font-black shadow-lg">
                ARC
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-black tracking-tight text-white">
                    {t.title}
                  </h1>

                  <span className="rounded border border-purple-700/60 bg-purple-950 px-1.5 py-0.5 text-[8px] text-purple-300">
                    GLOBAL
                  </span>
                </div>

                <p className="truncate text-[10px] text-slate-400 sm:text-xs">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(event) =>
                  setLang(event.target.value as Lang)
                }
                className="rounded-lg border border-slate-800 bg-[#05070a] px-2 py-2 text-xs text-slate-300 outline-none focus:border-purple-500"
              >
                <option value="en">🌐 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="ko">🇰🇷 한국어</option>
                <option value="es">🇪🇸 Español</option>
              </select>

              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="address"
              />
            </div>
          </div>
        </header>

        {/* STATUS */}

        {statusMsg && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-2.5 text-xs text-purple-200">
            <span className="break-words">
              {statusMsg}
            </span>

            <button
              onClick={() => setStatusMsg('')}
              className="shrink-0 text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* IDENTITY + BALANCES */}

        <section className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-purple-400">
                {t.identity}
              </p>

              <p className="mt-1 text-[9px] text-slate-500">
                {t.connectedWallet}
              </p>
            </div>

            <span
              className={`rounded-full border px-2 py-1 text-[9px] ${
                isConnected && isArcNetwork
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : isConnected
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
              }`}
            >
              {!isConnected
                ? t.disconnected
                : isArcNetwork
                  ? t.connected
                  : t.wrongNetwork}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3">
              <p className="text-[9px] uppercase text-slate-500">
                {t.wallet}
              </p>

              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-purple-300">
                  {address
                    ? shortAddress(address)
                    : '--'}
                </span>

                {address && (
                  <button
                    onClick={() => copyText(address)}
                    className="rounded bg-slate-800 px-2 py-1 text-[9px] text-slate-300"
                  >
                    {copied === address
                      ? t.copied
                      : t.copy}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3">
              <p className="text-[9px] uppercase text-slate-500">
                {t.balance}
              </p>

              <p className="mt-1 text-sm font-bold text-emerald-400">
                {isConnected
                  ? usdcLoading
                    ? t.loading
                    : `${usdcBalance} USDC`
                  : '--'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3">
              <p className="text-[9px] uppercase text-slate-500">
                {t.nativeBalance}
              </p>

              <p className="mt-1 text-sm font-bold text-indigo-400">
                {nativeBalanceData
                  ? `${Number(nativeBalanceData.formatted).toFixed(6)} ${nativeBalanceData.symbol}`
                  : '--'}
              </p>
            </div>
          </div>

          {isConnected && (
            <>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={customHandle}
                  onChange={(event) =>
                    setCustomHandle(event.target.value)
                  }
                  placeholder={t.handlePlaceholder}
                  className="flex-1 rounded-xl border border-slate-800 bg-[#05070a] px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500"
                />

                <button
                  onClick={registerHandle}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500"
                >
                  {t.register}
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-purple-900/40 bg-purple-950/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] uppercase text-slate-500">
                    {t.identity}
                  </span>

                  <span className="text-xs font-bold text-purple-300">
                    {userHandle}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* NETWORK STATUS */}

        <section className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                {t.network}
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {isArcNetwork
                  ? 'Arc Testnet'
                  : isConnected
                    ? t.wrongNetwork
                    : '--'}
              </p>

              <p className="mt-1 text-[9px] text-slate-500">
                Chain ID: {chainId || '--'}
              </p>
            </div>

            {isConnected && !isArcNetwork && (
              <button
                onClick={() => {
                  setStatusMsg(t.wrongChainMessage)
                }}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400"
              >
                {t.switchNetwork}
              </button>
            )}
          </div>
        </section>

        {/* MAIN TABS */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0d14]">

          <div className="flex overflow-x-auto border-b border-slate-800">
            {[
              ['payment', t.payment],
              ['qr', t.qr],
              ['treasury', t.treasury],
              ['assets', t.assets],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(key as Tab)
                }
                className={`shrink-0 border-b-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wide ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* PAYMENT */}

            {activeTab === 'payment' && (
              <div className="space-y-3">

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-purple-400">
                    {t.payment}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-500">
                    Secure wallet-signed settlement
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setTransferMode('usdc')
                    }
                    className={`rounded-xl border p-3 text-left ${
                      transferMode === 'usdc'
                        ? 'border-purple-500 bg-purple-950/30'
                        : 'border-slate-800 bg-[#05070a]'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">
                      {t.usdcMode}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      6 decimal ERC-20 asset
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      setTransferMode('native')
                    }
                    className={`rounded-xl border p-3 text-left ${
                      transferMode === 'native'
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-slate-800 bg-[#05070a]'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">
                      {t.nativeMode}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      Network gas asset
                    </p>
                  </button>
                </div>

                {transferMode === 'native' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] text-amber-300">
                    ⚠ {t.nativeWarning}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[9px] uppercase text-slate-500">
                    {t.recipient}
                  </label>

                  <div className="flex gap-2">
                    <input
                      value={recipient}
                      onChange={(event) =>
                        setRecipient(event.target.value)
                      }
                      placeholder={
                        t.recipientPlaceholder
                      }
                      className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-[#05070a] px-3 py-3 text-xs text-slate-200 outline-none focus:border-purple-500"
                    />

                    <button
                      onClick={
                        scannerOpen
                          ? stopScanner
                          : startScanner
                      }
                      className="rounded-xl border border-slate-700 bg-[#05070a] px-3 text-xs text-purple-300"
                    >
                      {scannerOpen
                        ? t.close
                        : t.scan}
                    </button>
                  </div>
                </div>

                {scannerOpen && (
                  <div className="rounded-xl border border-purple-500/40 bg-black p-3">
                    <div
                      id="arcsetu-qr-reader"
                      className="mx-auto min-h-[230px] max-w-sm overflow-hidden rounded-xl"
                    />

                    {scannerError && (
                      <p className="mt-2 text-center text-[10px] text-red-400">
                        {scannerError}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[9px] uppercase text-slate-500">
                    {t.amount}
                  </label>

                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#05070a] px-3 py-3 text-xs text-slate-200 outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={
                    txLoading ||
                    !isConnected ||
                    !isArcNetwork
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-black text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-800 disabled:from-slate-800 disabled:to-slate-800"
                >
                  {txLoading
                    ? t.sending
                    : transferMode === 'usdc'
                      ? `${t.sendUsdc} • ${amount} USDC`
                      : `${t.sendNative} • ${amount}`}
                </button>
              </div>
            )}

            {/* QR */}

            {activeTab === 'qr' && (
              <div className="space-y-4 text-center">

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                    {t.qrTitle}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-500">
                    {t.qrDesc}
                  </p>
                </div>

                {address ? (
                  <>
                    <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border border-purple-500/30 bg-white p-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          receiveQrData
                        )}`}
                        alt="Arcsetu payment QR"
                        className="h-full w-full"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-black text-purple-300">
                        {userHandle}
                      </p>

                      <p className="mt-1 break-all text-[9px] text-slate-500">
                        {address}
                      </p>

                      <button
                        onClick={() =>
                          copyText(address)
                        }
                        className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-[10px] text-slate-200"
                      >
                        {copied === address
                          ? t.copied
                          : t.copy}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-[#05070a] p-8 text-xs text-slate-500">
                    {t.noWallet}
                  </div>
                )}
              </div>
            )}

            {/* TREASURY */}

            {activeTab === 'treasury' && (
              <div className="space-y-4">

                <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-4">
                  <p className="text-xs font-black uppercase text-purple-300">
                    {t.treasuryTitle}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {t.treasuryDesc}
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-800 bg-[#05070a] p-3">
                    <p className="text-[9px] uppercase text-slate-500">
                      {t.treasuryAddress}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs text-purple-300">
                        {DEFAULT_TREASURY}
                      </span>

                      <button
                        onClick={() =>
                          copyText(DEFAULT_TREASURY)
                        }
                        className="rounded-lg bg-slate-800 px-2 py-1 text-[9px]"
                      >
                        {t.copy}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#05070a] p-4">
                  <p className="text-[9px] uppercase text-slate-500">
                    {t.depositAmount}
                  </p>

                  <div className="mt-2 flex gap-2">
                    <input
                      inputMode="decimal"
                      value={treasuryAmount}
                      onChange={(event) =>
                        setTreasuryAmount(
                          event.target.value
                        )
                      }
                      className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-[#0a0d14] px-3 py-2.5 text-xs outline-none focus:border-purple-500"
                    />

                    <button
                      onClick={handleTreasuryDeposit}
                      disabled={
                        txLoading ||
                        !isConnected ||
                        !isArcNetwork
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:bg-slate-800"
                    >
                      {txLoading
                        ? t.depositing
                        : t.deposit}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#05070a] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">
                        {t.cctp}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-500">
                        Circle cross-chain settlement architecture
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[8px] text-emerald-400">
                      {t.comingSoon}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ASSETS */}

            {activeTab === 'assets' && (
              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-purple-400">
                      {t.multiChain}
                    </p>

                    <p className="mt-1 text-[9px] text-slate-500">
                      Arcsetu multi-network architecture
                    </p>
                  </div>

                  <button
                    onClick={fetchUsdcBalance}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-[9px] text-slate-300"
                  >
                    {t.refresh}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Arc Testnet
                      </span>

                      <span className="text-[8px] text-purple-400">
                        EVM
                      </span>
                    </div>

                    <p className="mt-3 text-xl font-black text-emerald-400">
                      {usdcBalance}
                    </p>

                    <p className="text-[9px] text-slate-500">
                      USDC
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#05070a] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Native asset
                      </span>

                      <span className="text-[8px] text-indigo-400">
                        GAS
                      </span>
                    </div>

                    <p className="mt-3 text-xl font-black text-indigo-400">
                      {nativeBalanceData
                        ? Number(
                            nativeBalanceData.formatted
                          ).toFixed(6)
                        : '0.000000'}
                    </p>

                    <p className="text-[9px] text-slate-500">
                      {nativeBalanceData?.symbol ||
                        'native'}
                    </p>
                  </div>

                </div>

                <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3 text-[9px] leading-5 text-slate-500">
                  Multi-chain adapters can be attached here
                  for Arc, Ethereum, Base, Bitcoin and other
                  supported networks without changing the
                  payment UI.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PROGRAMMABLE FEE ENGINE */}

        <section className="rounded-2xl border border-purple-900/50 bg-[#0a0d14] p-4">

          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-purple-400">
              {t.royalty}
            </p>

            <p className="mt-1 text-[9px] text-slate-500">
              Merchant • Treasury • Protocol fee routing
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3">
              <p className="text-[9px] text-slate-500">
                {t.merchant}
              </p>

              <p className="mt-1 text-lg font-black text-white">
                80%
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3">
              <p className="text-[9px] text-slate-500">
                {t.vault}
              </p>

              <p className="mt-1 text-lg font-black text-emerald-400">
                15%
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#05070a] p-3">
              <p className="text-[9px] text-slate-500">
                {t.protocol}
              </p>

              <p className="mt-1 text-lg font-black text-purple-400">
                5%
              </p>
            </div>

          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

            <input
              value={feeRecipient}
              onChange={(event) =>
                setFeeRecipient(event.target.value)
              }
              placeholder={t.feeRecipient}
              className="rounded-xl border border-slate-800 bg-[#05070a] px-3 py-2.5 text-xs outline-none focus:border-purple-500 sm:col-span-2"
            />

            <div className="flex gap-2">
              <input
                inputMode="decimal"
                value={feeAmount}
                onChange={(event) =>
                  setFeeAmount(event.target.value)
                }
                className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-[#05070a] px-3 py-2.5 text-xs outline-none focus:border-purple-500"
              />

              <button
                onClick={handleFeeDistribution}
                disabled={
                  feeLoading ||
                  !isConnected ||
                  !isArcNetwork
                }
                className="rounded-xl bg-purple-600 px-3 py-2 text-[10px] font-bold text-white disabled:bg-slate-800"
              >
                {feeLoading
                  ? t.distributing
                  : t.distribute}
              </button>
            </div>

          </div>
        </section>

        {/* SECURITY */}

        <section className="rounded-2xl border border-emerald-900/40 bg-[#0a0d14] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            {t.security}
          </p>

          <p className="mt-2 text-[10px] leading-5 text-slate-400">
            {t.securityNote}
          </p>
        </section>

        {/* ACTIVITY */}

        <section className="rounded-2xl border border-slate-800 bg-[#0a0d14] p-4">

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {t.activity}
              </p>

              <p className="mt-1 text-[9px] text-slate-600">
                {activities.length} records
              </p>
            </div>

            {activities.length > 0 && (
              <button
                onClick={exportCsv}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-[9px] text-slate-300"
              >
                {t.export}
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">

            {activities.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-[#05070a] p-6 text-center text-[10px] text-slate-600">
                {t.noActivity}
              </div>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-[#05070a] p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-purple-300">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-600">
                        {item.timestamp}
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-emerald-400">
                        {item.amount}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-[8px] ${
                          item.status ===
                          'confirmed'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : item.status ===
                                'submitted'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {item.status ===
                        'confirmed'
                          ? t.confirmed
                          : item.status ===
                              'submitted'
                            ? t.submitted
                            : t.failed}
                      </span>

                      <a
                        href={item.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-purple-950 px-2.5 py-1.5 text-[9px] text-purple-300 hover:bg-purple-900"
                      >
                        {t.explorer} ↗
                      </a>
                    </div>

                  </div>

                  <p className="mt-2 truncate border-t border-slate-800 pt-2 text-[8px] text-slate-600">
                    {item.txHash}
                  </p>
                </div>
              ))
            )}

          </div>
        </section>

        {/* FOOTER */}

        <footer className="pb-6 text-center">
          <div className="flex flex-wrap justify-center gap-3 text-[9px] text-slate-600">
            <a
              href={ARC_EXPLORER}
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400"
            >
              ArcScan ↗
            </a>

            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400"
            >
              Circle Faucet ↗
            </a>

            <a
              href="https://www.arc.io/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400"
            >
              Arc ↗
            </a>
          </div>

          <p className="mt-3 text-[8px] text-slate-700">
            ARCSETU • programmable global settlement
            infrastructure
          </p>
        </footer>

      </div>

      {/* SUCCESS MODAL */}

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl border border-purple-500/40 bg-[#0a0d14] p-5 shadow-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-2xl text-emerald-400">
              ✓
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-base font-black text-white">
                {t.transactionSubmitted}
              </h3>

              <p className="mt-1 text-[10px] text-slate-500">
                {successModal.title}
              </p>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-[#05070a] p-3">

              <div className="flex justify-between gap-3">
                <span className="text-[9px] text-slate-500">
                  {t.amount}
                </span>

                <span className="text-xs font-bold text-emerald-400">
                  {successModal.amount}
                </span>
              </div>

              {successModal.latencyMs !==
                undefined && (
                <div className="flex justify-between gap-3">
                  <span className="text-[9px] text-slate-500">
                    execution
                  </span>

                  <span className="text-[10px] text-purple-300">
                    {successModal.latencyMs} ms
                  </span>
                </div>
              )}

              <div>
                <p className="text-[9px] text-slate-500">
                  tx hash
                </p>

                <p className="mt-1 break-all text-[8px] text-slate-600">
                  {successModal.hash}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">

              <a
                href={successModal.url}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-xl bg-purple-600 py-3 text-center text-xs font-bold text-white hover:bg-purple-500"
              >
                {t.explorer} ↗
              </a>

              <button
                onClick={() =>
                  setSuccessModal(null)
                }
                className="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700"
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
