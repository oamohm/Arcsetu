import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount, useBalance, useWriteContract, useSendTransaction, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { defineChain, parseUnits } from 'viem'

export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000'

export const erc20Abi = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.arcscan.app'],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
})

const config = getDefaultConfig({
  appName: 'Arc Settlement Hub',
  projectId: 'YOUR_PROJECT_ID',
  chains: [arcTestnet, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})

const queryClient = new QueryClient()

interface TxLog {
  id: string
  type: string
  amount: string
  to: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
  hash?: string
}

type SupportedLocale = 'en' | 'hi' | 'es' | 'zh' | 'fr' | 'ar'

function DashboardContent() {
  const { address, isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  const [mounted, setMounted] = useState(false)
  const [arcId, setArcId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [feeAddress, setFeeAddress] = useState('')
  const [feeAmount, setFeeAmount] = useState('0.05')
  const [activeTab, setActiveTab] = useState<'transfer' | 'pos' | 'treasury'>('transfer')
  const [transferRoute, setTransferRoute] = useState<'native' | 'erc20'>('native')
  const [locale, setLocale] = useState<SupportedLocale>('en')
  
  const [selectedRoute, setSelectedRoute] = useState<'native' | 'cctp' | 'speed' | 'splitter'>('native')
  const [settlementCount, setSettlementCount] = useState(0)
  const [builderStamp, setBuilderStamp] = useState(false)
  const [txLogs, setTxLogs] = useState<TxLog[]>([])
  
  const [posAmount, setPosAmount] = useState('5.0')
  const [posQrGenerated, setPosQrGenerated] = useState(false)
  const [treasuryDeposit, setTreasuryDeposit] = useState('100')
  const [treasuryBalance, setTreasuryBalance] = useState('1450.25')

  // erc-20 token balance explicitly bound
  const { data: balanceData, refetch: refetchBalance, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance({
    address: address,
    token: transferRoute === 'erc20' ? (ARC_USDC_ADDRESS as `0x${string}`) : undefined,
    chainId: arcTestnet.id,
    query: {
      refetchInterval: 3000,
      enabled: Boolean(address),
    }
  })

  const { sendTransactionAsync, isPending: isSendPending } = useSendTransaction()
  const { writeContractAsync, isPending: isContractPending } = useWriteContract()

  const isTxPending = isSendPending || isContractPending

  useEffect(() => {
    setMounted(true)
    
    try {
      const savedLogs = localStorage.getItem('arc_settlement_logs')
      if (savedLogs) setTxLogs(JSON.parse(savedLogs))

      const savedId = localStorage.getItem('arc_bound_id')
      if (savedId) setArcId(savedId)

      const savedCount = localStorage.getItem('arc_settlement_count')
      if (savedCount) setSettlementCount(parseInt(savedCount, 10))

      const savedStamp = localStorage.getItem('arc_builder_stamp')
      if (savedStamp) setBuilderStamp(savedStamp === 'true')
    } catch (err) {
      console.error('hydration storage parse error', err)
    }
  }, [])

  if (!mounted) return null

  const saveLog = (newLog: TxLog) => {
    setTxLogs((prev) => {
      const updated = [newLog, ...prev]
      try {
        localStorage.setItem('arc_settlement_logs', JSON.stringify(updated))
      } catch (e) {
        console.error('failed writing log', e)
      }
      return updated
    })
  }

  const handleSaveArcId = (val: string) => {
    setArcId(val)
    localStorage.setItem('arc_bound_id', val)
  }

  const walletActive = isConnected

  const ensureArcChain = async () => {
    if (currentChainId !== arcTestnet.id && switchChain) {
      try {
        await switchChain({ chainId: arcTestnet.id })
      } catch (e) {
        console.warn('chain switch bypassed', e)
      }
    }
  }

  const handlePay = async () => {
    if (!recipient || !amount) return
    const logId = 'tx_' + Date.now()
    
    await ensureArcChain()

    try {
      let hash = ''
      if (transferRoute === 'native') {
        hash = await sendTransactionAsync({
          to: recipient as `0x${string}`,
          value: parseUnits(amount, 18),
          chainId: arcTestnet.id,
        })
      } else {
        hash = await writeContractAsync({
          address: ARC_USDC_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, parseUnits(amount, 6)],
        })
      }

      saveLog({
        id: logId,
        type: 'USDC Transfer',
        amount: `${amount} USDC`,
        to: recipient,
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchBalance()
    } catch (e) {
      console.error('transfer error', e)
      saveLog({
        id: logId,
        type: 'USDC Transfer (Failed)',
        amount: `${amount} USDC`,
        to: recipient,
        timestamp: new Date().toLocaleTimeString(),
        status: 'failed',
      })
    }
  }

  const handleDistributeFee = async () => {
    if (!feeAddress || !feeAmount) return
    const logId = 'fee_' + Date.now()

    await ensureArcChain()

    try {
      const hash = await sendTransactionAsync({
        to: feeAddress as `0x${string}`,
        value: parseUnits(feeAmount, 18),
        chainId: arcTestnet.id,
      })

      saveLog({
        id: logId,
        type: 'Fee Distribution',
        amount: `${feeAmount} USDC`,
        to: feeAddress,
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchBalance()
    } catch (e) {
      console.error('fee distribution error', e)
      saveLog({
        id: logId,
        type: 'Fee Distribution (Failed)',
        amount: `${feeAmount} USDC`,
        to: feeAddress,
        timestamp: new Date().toLocaleTimeString(),
        status: 'failed',
      })
    }
  }

  const handleRunSettlement = async () => {
    if (!walletActive || !address) return
    await ensureArcChain()
    const logId = 'settle_' + Date.now()

    try {
      const hash = await sendTransactionAsync({
        to: address as `0x${string}`,
        value: parseUnits('0.0001', 18),
        chainId: arcTestnet.id,
      })

      const newCount = settlementCount + 1
      setSettlementCount(newCount)
      localStorage.setItem('arc_settlement_count', newCount.toString())
      
      saveLog({
        id: logId,
        type: 'Deterministic Settlement Engine Test',
        amount: '0.0001 USDC',
        to: address,
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchBalance()
    } catch (e) {
      console.error('settlement test error', e)
    }
  }

  const handleClaimStamp = () => {
    if (walletActive) {
      setBuilderStamp(true)
      localStorage.setItem('arc_builder_stamp', 'true')
      saveLog({
        id: 'stamp_' + Date.now(),
        type: 'Arc Builder Badge Verification Stamp Issue',
        amount: 'N/A',
        to: address || 'Arc Network Identity',
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
      })
    }
  }

  const handleTreasuryDeposit = () => {
    if (!treasuryDeposit) return
    const current = parseFloat(treasuryBalance)
    const added = parseFloat(treasuryDeposit)
    const updated = (current + added).toFixed(2)
    setTreasuryBalance(updated)
    
    saveLog({
      id: 'yield_' + Date.now(),
      type: 'Treasury Yield Vault Deposit',
      amount: `${treasuryDeposit} USDC`,
      to: 'Arc Yield Vault (4.8% APY)',
      timestamp: new Date().toLocaleTimeString(),
      status: 'completed',
    })
  }

  const clearHistory = () => {
    setTxLogs([])
    localStorage.removeItem('arc_settlement_logs')
  }

  const t = {
    en: {
      title: 'ARC SETTLEMENT HUB',
      badge: 'PRIMARY',
      subtitle: 'programmable usdc settlement engine on the arc network',
      identity: 'arc multi-chain identity',
      statusDisc: 'wallet disconnected',
      statusConn: 'wallet active',
      boundId: 'bound arc up id',
      treasuryBal: 'arc native balance',
      routing: 'arc ecosystem asset routing',
      testnet: 'arc testnet',
      nativeUsdc: 'native usdc',
      cctp: 'circle cctp',
      crossBridge: 'cross-chain bridge',
      detEngine: 'deterministic engine',
      speedBench: 'speed benchmark',
      paymentUx: 'payment ux',
      splitSplitter: 'auto-split splitter',
      feeEngine: 'arc programmable fee engine',
      feeDesc: 'distribute creator fees, split payments, or send cross-chain royalties natively on arc.',
      feePlaceholder: 'address 0x...',
      distributeFee: 'distribute fee',
      workflow: 'arc builder onboarding workflow',
      wf1Title: '1. bind arc identity & wallet',
      wf1Desc: 'deterministically registers identity on arc network',
      wf1Pending: 'pending',
      wf1Complete: 'completed',
      wf2Title: '2. execute arc usdc settlement',
      wf2Desc: `executed: ${settlementCount} settlement txns`,
      runSettlement: 'run settlement (0.0001 usdc)',
      wf3Title: '3. claim arc builder stamp',
      wf3Desc: 'issues arc ecosystem verification badge',
      claimStamp: builderStamp ? 'stamp claimed' : 'claim stamp',
      tabTransfer: 'arc usdc transfer',
      tabPos: 'pos qr invoice',
      tabTreasury: 'arc yield treasury',
      sendPlaceholder: 'send to 0x wallet address',
      scanQr: 'refresh balance',
      transferRoute: 'transfer route:',
      gasUsdc: 'native gas usdc',
      erc20: 'erc-20 contract',
      payButton: (amt: string) => isTxPending ? 'processing transaction...' : `pay via arc usdc (${amt} usdc)`,
      infra: 'arc ecosystem infrastructure links',
      explorer: 'arcscan explorer',
      faucet: 'circle usdc faucet',
      docs: 'arcscan testnet portal',
      logsTitle: 'arc network activity & verification logs',
      logsDefault: 'connect wallet to view arc settlement activity.',
      logsActive: (addr: string) => `connected via wagmi: ${addr}`,
      clearLogs: 'clear history',
      footer: 'arc settlement engine · built for decentralized scale'
    },
    hi: {
      title: 'आर्क सेटलमेंट हब',
      badge: 'प्राथमिक',
      subtitle: 'आर्क नेटवर्क पर प्रोग्रामेबल यूएसडीसी सेटलमेंट इंजन',
      identity: 'आर्क मल्टी-चेन पहचान',
      statusDisc: 'वॉलेट डिस्कनेक्टेड',
      statusConn: 'वॉलेट सक्रिय',
      boundId: 'बाउंड आर्क अप आईडी',
      treasuryBal: 'आर्क नेटिव बैलेंस',
      routing: 'आर्क इकोसिस्टम एसेट रूटिंग',
      testnet: 'आर्क टेस्टनेट',
      nativeUsdc: 'मूल यूएसडीसी',
      cctp: 'सर्कल सीसीटीपी',
      crossBridge: 'क्रॉस-चेन ब्रिज',
      detEngine: 'डिटर्मिनिस्टिक इंजन',
      speedBench: 'स्पीड बेंचमार्क',
      paymentUx: 'पेमेंट यूएक्स',
      splitSplitter: 'ऑटो-स्प्लिट स्पलीटर',
      feeEngine: 'आर्क प्रोग्रामेबल फीस इंजन',
      feeDesc: 'रॉयल्टी या क्रिएटर फीस को आर्क पर मूल रूप से वितरित करें।',
      feePlaceholder: 'पता 0x...',
      distributeFee: 'फीस वितरित करें',
      workflow: 'आर्क बिल्डर ऑनबोर्डिंग वर्कफ़्लो',
      wf1Title: '1. आर्क पहचान और वॉलेट बांधें',
      wf1Desc: 'आर्क नेटवर्क पर पहचान को निश्चित रूप से पंजीकृत करता है',
      wf1Pending: 'लंबित',
      wf1Complete: 'पूर्ण',
      wf2Title: '2. आर्क यूएसडीसी सेटलमेंट निष्पादित करें',
      wf2Desc: `निष्पादित: ${settlementCount} सेटलमेंट लेन-देन`,
      runSettlement: 'सेटलमेंट चलाएं (0.0001 usdc)',
      wf3Title: '3. आर्क बिल्डर स्टाम्प का दावा करें',
      wf3Desc: 'आर्क इकोसिस्टम सत्यापन बैज जारी करता है',
      claimStamp: builderStamp ? 'स्टाम्प प्राप्त हुआ' : 'स्टाम्प का दावा करें',
      tabTransfer: 'आर्क यूएसडीसी ट्रांसफर',
      tabPos: 'पीओएस क्यूआर इनवॉइस',
      tabTreasury: 'आर्क यील्ड ट्रेजरी',
      sendPlaceholder: '0x वॉलेट पते पर भेजें',
      scanQr: 'बैलेंस रिफ्रेश करें',
      transferRoute: 'ट्रांसफर रूट:',
      gasUsdc: 'मूल गैस यूएसडीसी',
      erc20: 'ईआरसी-20 अनुबंध',
      payButton: (amt: string) => isTxPending ? 'प्रोसेस हो रहा है...' : `आर्क यूएसडीसी भुगतान करें (${amt} यूएसडीसी)`,
      infra: 'आर्क इकोसिस्टम इंफ्रास्ट्रक्चर लिंक',
      explorer: 'आर्कस्केन एक्सप्लोरर',
      faucet: 'सर्कल यूएसडीसी फॉसेट',
      docs: 'आर्कस्केन पोर्टल',
      logsTitle: 'आर्क नेटवर्क गतिविधि और सत्यापन लॉग',
      logsDefault: 'आर्क सेटलमेंट गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
      logsActive: (addr: string) => `वाग्मी (Wagmi) से कनेक्टेड: ${addr}`,
      clearLogs: 'हिस्ट्री साफ़ करें',
      footer: 'आर्क सेटलमेंट इंजन · विकेंद्रीकृत पैमाने के लिए निर्मित'
    },
    es: {
      title: 'CENTRO DE LIQUIDACIÓN ARC',
      badge: 'PRIMARIO',
      subtitle: 'motor de liquidación programable de usdc en la red arc',
      identity: 'identidad multicadena arc',
      statusDisc: 'billetera desconectada',
      statusConn: 'billetera activa',
      boundId: 'id arc vinculada',
      treasuryBal: 'saldo nativo arc',
      routing: 'enrutamiento de activos del ecosistema arc',
      testnet: 'red de prueba arc',
      nativeUsdc: 'usdc nativo',
      cctp: 'circle cctp',
      crossBridge: 'puente entre cadenas',
      detEngine: 'motor determinista',
      speedBench: 'prueba de velocidad',
      paymentUx: 'ux de pago',
      splitSplitter: 'divisor automático',
      feeEngine: 'motor de tarifas programable arc',
      feeDesc: 'distribuya tarifas de creador, divida pagos o envíe regalías de forma nativa.',
      feePlaceholder: 'dirección 0x...',
      distributeFee: 'distribuir tarifa',
      workflow: 'flujo de trabajo para desarrolladores',
      wf1Title: '1. vincular identidad y billetera arc',
      wf1Desc: 'registra identidad de forma determinista en la red arc',
      wf1Pending: 'pendiente',
      wf1Complete: 'completado',
      wf2Title: '2. ejecutar liquidación usdc arc',
      wf2Desc: `ejecutado: ${settlementCount} transacciones`,
      runSettlement: 'ejecutar liquidación (0.0001 usdc)',
      wf3Title: '3. reclamar sello de desarrollador arc',
      wf3Desc: 'emite insignia de verificación del ecosistema arc',
      claimStamp: builderStamp ? 'sello reclamado' : 'reclamar sello',
      tabTransfer: 'transferencia usdc arc',
      tabPos: 'factura pos qr',
      tabTreasury: 'tesorería de rendimiento arc',
      sendPlaceholder: 'enviar a dirección de billetera 0x',
      scanQr: 'actualizar saldo',
      transferRoute: 'ruta de transferencia:',
      gasUsdc: 'usdc gas nativo',
      erc20: 'contrato erc-20',
      payButton: (amt: string) => isTxPending ? 'procesando transacción...' : `pagar vía arc usdc (${amt} usdc)`,
      infra: 'enlaces de infraestructura del ecosistema arc',
      explorer: 'explorador arcscan',
      faucet: 'faucet circle usdc',
      docs: 'portal arcscan testnet',
      logsTitle: 'registros de actividad y verificación de la red arc',
      logsDefault: 'conecte la billetera para ver la actividad de liquidación.',
      logsActive: (addr: string) => `conectado vía wagmi: ${addr}`,
      clearLogs: 'borrar historial',
      footer: 'motor de liquidación arc · construido para escala descentralizada'
    },
    zh: {
      title: 'ARC 结算中心',
      badge: '主网',
      subtitle: 'ARC 网络上的可编程 USDC 结算引擎',
      identity: 'ARC 多链身份',
      statusDisc: '钱包未连接',
      statusConn: '钱包已连接',
      boundId: '已绑定 ARC 身份 ID',
      treasuryBal: 'ARC 原生余额',
      routing: 'ARC 生态系统资产路由',
      testnet: 'ARC 测试网',
      nativeUsdc: '原生 USDC',
      cctp: 'Circle CCTP',
      crossBridge: '跨链桥',
      detEngine: '确定性引擎',
      speedBench: '速度基准',
      paymentUx: '支付 UX',
      splitSplitter: '自动分账器',
      feeEngine: 'ARC 可编程费用引擎',
      feeDesc: '在 ARC 原生分发放创作者费用、拆分支付或跨链版税。',
      feePlaceholder: '地址 0x...',
      distributeFee: '分派费用',
      workflow: 'ARC 开发者入职流程',
      wf1Title: '1. 绑定 ARC 身份与钱包',
      wf1Desc: '在 ARC 网络上确定性注册身份',
      wf1Pending: '等待中',
      wf1Complete: '已完成',
      wf2Title: '2. 执行 ARC USDC 结算',
      wf2Desc: `已执行: ${settlementCount} 次结算交易`,
      runSettlement: '运行结算 (0.0001 usdc)',
      wf3Title: '3. 申领 ARC 开发者勋章',
      wf3Desc: '颁发 ARC 生态系统验证徽章',
      claimStamp: builderStamp ? '勋章已申领' : '申领勋章',
      tabTransfer: 'ARC USDC 转账',
      tabPos: 'POS 二维码发票',
      tabTreasury: 'ARC 收益金库',
      sendPlaceholder: '发送至 0x 钱包地址',
      scanQr: '刷新余额',
      transferRoute: '转账路由:',
      gasUsdc: '原生 Gas USDC',
      erc20: 'ERC-20 合约',
      payButton: (amt: string) => isTxPending ? '正在处理交易...' : `通过 ARC USDC 支付 (${amt} USDC)`,
      infra: 'ARC 生态基础设施链接',
      explorer: 'ArcScan 区块浏览器',
      faucet: 'Circle USDC 水龙头',
      docs: 'ArcScan 测试网入口',
      logsTitle: 'ARC 网络活动与验证日志',
      logsDefault: '连接钱包以查看 ARC 结算活动。',
      logsActive: (addr: string) => `通过 Wagmi 连接: ${addr}`,
      clearLogs: '清除历史',
      footer: 'ARC 结算引擎 · 为去中心化规模打造'
    },
    fr: {
      title: 'CENTRE DE RÈGLEMENT ARC',
      badge: 'PRIMAIRE',
      subtitle: 'moteur de règlement usdc programmable sur le réseau arc',
      identity: 'identité multi-chaîne arc',
      statusDisc: 'portefeuille déconnecté',
      statusConn: 'portefeuille actif',
      boundId: 'id arc lié',
      treasuryBal: 'solde natif arc',
      routing: 'routage d\'actifs de l\'écosystème arc',
      testnet: 'réseau de test arc',
      nativeUsdc: 'usdc natif',
      cctp: 'circle cctp',
      crossBridge: 'pont inter-chaînes',
      detEngine: 'moteur déterministe',
      speedBench: 'test de vitesse',
      paymentUx: 'ux de paiement',
      splitSplitter: 'répartiteur automatique',
      feeEngine: 'moteur de frais programmable arc',
      feeDesc: 'distribuez les frais de créateur, divisez les paiements ou envoyez des redevances nativement.',
      feePlaceholder: 'adresse 0x...',
      distributeFee: 'distribuer les frais',
      workflow: 'flux d\'intégration des développeurs',
      wf1Title: '1. lier l\'identité et le portefeuille arc',
      wf1Desc: 'enregistre de manière déterministe l\'identité sur le réseau arc',
      wf1Pending: 'en attente',
      wf1Complete: 'terminé',
      wf2Title: '2. exécuter le règlement usdc arc',
      wf2Desc: `exécuté: ${settlementCount} transactions`,
      runSettlement: 'exécuter le règlement (0.0001 usdc)',
      wf3Title: '3. réclamer le badge développeur arc',
      wf3Desc: 'délivre le badge de vérification de l\'écosystème arc',
      claimStamp: builderStamp ? 'badge réclamé' : 'réclamer le badge',
      tabTransfer: 'transfert usdc arc',
      tabPos: 'facture pos qr',
      tabTreasury: 'trésorerie de rendement arc',
      sendPlaceholder: 'envoyer à l\'adresse du portefeuille 0x',
      scanQr: 'rafraîchir le solde',
      transferRoute: 'route de transfert:',
      gasUsdc: 'usdc gas natif',
      erc20: 'contrat erc-20',
      payButton: (amt: string) => isTxPending ? 'traitement de la transaction...' : `payer via arc usdc (${amt} usdc)`,
      infra: 'liens d\'infrastructure de l\'écosystème arc',
      explorer: 'explorateur arcscan',
      faucet: 'robinet circle usdc',
      docs: 'portail arcscan testnet',
      logsTitle: 'journaux d\'activité et de vérification du réseau arc',
      logsDefault: 'connectez votre portefeuille pour voir l\'activité de règlement.',
      logsActive: (addr: string) => `connecté via wagmi: ${addr}`,
      clearLogs: 'effacer l\'historique',
      footer: 'moteur de règlement arc · conçu pour l\'échelle décentralisée'
    },
    ar: {
      title: 'مركز تسوية آرك',
      badge: 'الرئيسي',
      subtitle: 'محرك تسوية USDC القابل للبرمجة على شبكة آرك',
      identity: 'هوية آرك متعددة السلاسل',
      statusDisc: 'المحفظة غير متصلة',
      statusConn: 'المحفظة نشطة',
      boundId: 'معرف آرك المرتبط',
      treasuryBal: 'رصيد آرك الأصلي',
      routing: 'توجيه أصول منظومة آرك',
      testnet: 'شبكة اختبار آرك',
      nativeUsdc: 'USDC الأصلي',
      cctp: 'Circle CCTP',
      crossBridge: 'جسر عبر السلاسل',
      detEngine: 'محرك محدد',
      speedBench: 'مؤشر السرعة',
      paymentUx: 'تجربة دفع',
      splitSplitter: 'موزع تلقائي',
      feeEngine: 'محرك رسوم آرك القابل للبرمجة',
      feeDesc: 'توزيع رسوم المبدعين أو تقسيم المدفوعات محليًا على شبكة آرك.',
      feePlaceholder: 'العنوان 0x...',
      distributeFee: 'توزيع الرسوم',
      workflow: 'مسار إعداد مطوري آرك',
      wf1Title: '1. ربط هوية آرك والمحفظة',
      wf1Desc: 'تسجيل الهوية بشكل حتمي على شبكة آرك',
      wf1Pending: 'قيد الانتظار',
      wf1Complete: 'مكتمل',
      wf2Title: '2. تنفيذ تسوية آرك USDC',
      wf2Desc: `تم التنفيذ: ${settlementCount} معاملات تسوية`,
      runSettlement: 'تشغيل التسوية (0.0001 usdc)',
      wf3Title: '3. المطالبة بختم مطور آرك',
      wf3Desc: 'إصدار شارة التحقق من منظومة آرك',
      claimStamp: builderStamp ? 'تم استلام الختم' : 'المطالبة بالختم',
      tabTransfer: 'تحويل آرك USDC',
      tabPos: 'فاتورة POS QR',
      tabTreasury: 'خزانة عوائد آرك',
      sendPlaceholder: 'إرسال إلى عنوان محفظة 0x',
      scanQr: 'تحديث الرصيد',
      transferRoute: 'مسار التحويل:',
      gasUsdc: 'رسوم USDC الأصلية',
      erc20: 'عقد ERC-20',
      payButton: (amt: string) => isTxPending ? 'جاري معالجة المعاملة...' : `الدفع عبر آرك USDC (${amt} USDC)`,
      infra: 'روابط البنية التحتية لمنظومة آرك',
      explorer: 'مستكشف ArcScan',
      faucet: 'صنبور Circle USDC',
      docs: 'بوابة ArcScan Testnet',
      logsTitle: 'سجلات نشاط والتحقق لشبكة آرك',
      logsDefault: 'قم بتوصيل المحفظة لعرض نشاط التسوية.',
      logsActive: (addr: string) => `متصل عبر Wagmi: ${addr}`,
      clearLogs: 'مسح السجل',
      footer: 'محرك تسوية آرك · صُمم للتوسع اللامركزي'
    }
  }[locale]

  const displayBalance = () => {
    if (!walletActive) return '--'
    if (isBalanceLoading && !balanceData) return 'fetching...'
    if (isBalanceError) return '0.0000 USDC'
    if (balanceData) {
      return `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    }
    return '0.0000 USDC'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a192f', color: '#f1f5f9', padding: '16px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between', alignItems: 'stretch', backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: 'radial-gradient(circle, #1e3a8a 0%, #0a192f 100%)', borderRadius: '10px', border: '1px solid rgba(250, 204, 21, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '24px' }}>
            🌁
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              {t.title}
              <span style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>{t.badge}</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{t.subtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <select 
            value={locale}
            onChange={(e) => setLocale(e.target.value as SupportedLocale)}
            style={{ fontSize: '12px', background: 'rgba(30, 41, 59, 0.8)', color: '#cbd5e1', padding: '8px 10px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', outline: 'none' }}
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="es">Español (ES)</option>
            <option value="zh">中文 (ZH)</option>
            <option value="fr">Français (FR)</option>
            <option value="ar">العربية (AR)</option>
          </select>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </header>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', margin: 0 }}>{t.identity}</h2>
          <span style={{ fontSize: '10px', background: walletActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: walletActive ? '#4ade80' : '#f87171', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${walletActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
            {walletActive ? t.statusConn : t.statusDisc}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input 
              type="text" 
              placeholder={t.boundId}
              value={arcId}
              onChange={(e) => handleSaveArcId(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#f1f5f9', fontSize: '12px' }}
            />
            <span style={{ fontSize: '10px', color: '#475569' }}>{arcId ? 'saved' : '--'}</span>
          </div>
          <div style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span>{t.treasuryBal}</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
              {displayBalance()}
            </span>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>{t.routing}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          
          <div 
            onClick={() => {
              setSelectedRoute('native')
              saveLog({
                id: 'route_' + Date.now(),
                type: 'Route Node Switch',
                amount: 'Native USDC Selected',
                to: 'Arc Core Pipeline',
                timestamp: new Date().toLocaleTimeString(),
                status: 'completed'
              })
            }}
            style={{ 
              backgroundColor: '#0a192f', 
              padding: '12px', 
              borderRadius: '8px', 
              border: selectedRoute === 'native' ? '1px solid #c084fc' : '1px solid #1e1b4b',
              cursor: 'pointer'
            }}
          >
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.testnet}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.nativeUsdc}</p>
            <p style={{ fontSize: '9px', color: selectedRoute === 'native' ? '#c084fc' : '#64748b', margin: 0 }}>
              {selectedRoute === 'native' ? '✓ active' : 'click to select'}
            </p>
          </div>

          <div 
            onClick={() => {
              setSelectedRoute('cctp')
              saveLog({
                id: 'route_' + Date.now(),
                type: 'Route Node Switch',
                amount: 'Circle CCTP Selected',
                to: 'Cross-Chain Bridge Engine',
                timestamp: new Date().toLocaleTimeString(),
                status: 'completed'
              })
            }}
            style={{ 
              backgroundColor: '#0a192f', 
              padding: '12px', 
              borderRadius: '8px', 
              border: selectedRoute === 'cctp' ? '1px solid #c084fc' : '1px solid #1e1b4b',
              cursor: 'pointer'
            }}
          >
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.cctp}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.crossBridge}</p>
            <p style={{ fontSize: '9px', color: selectedRoute === 'cctp' ? '#c084fc' : '#64748b', margin: 0 }}>
              {selectedRoute === 'cctp' ? '✓ active' : 'click to test cctp'}
            </p>
          </div>

          <div 
            onClick={() => {
              setSelectedRoute('speed')
              saveLog({
                id: 'route_' + Date.now(),
                type: 'Speed Benchmark Test',
                amount: 'Deterministic Benchmark Executed',
                to: 'Execution Time: ~180ms',
                timestamp: new Date().toLocaleTimeString(),
                status: 'completed'
              })
            }}
            style={{ 
              backgroundColor: '#0a192f', 
              padding: '12px', 
              borderRadius: '8px', 
              border: selectedRoute === 'speed' ? '1px solid #c084fc' : '1px solid #1e1b4b',
              cursor: 'pointer'
            }}
          >
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.detEngine}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.speedBench}</p>
            <p style={{ fontSize: '9px', color: selectedRoute === 'speed' ? '#c084fc' : '#64748b', margin: 0 }}>
              {selectedRoute === 'speed' ? '✓ active' : 'click to run test'}
            </p>
          </div>

          <div 
            onClick={() => {
              setSelectedRoute('splitter')
              saveLog({
                id: 'route_' + Date.now(),
                type: 'Auto-Split Engine',
                amount: 'Payment Splitter Initialized',
                to: 'Auto-Route 80/20 Vault',
                timestamp: new Date().toLocaleTimeString(),
                status: 'completed'
              })
            }}
            style={{ 
              backgroundColor: '#0a192f', 
              padding: '12px', 
              borderRadius: '8px', 
              border: selectedRoute === 'splitter' ? '1px solid #c084fc' : '1px solid #1e1b4b',
              cursor: 'pointer'
            }}
          >
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.paymentUx}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.splitSplitter}</p>
            <p style={{ fontSize: '9px', color: selectedRoute === 'splitter' ? '#c084fc' : '#64748b', margin: 0 }}>
              {selectedRoute === 'splitter' ? '✓ active' : 'click to configure'}
            </p>
          </div>

        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>{t.feeEngine}</h2>
        <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '12px', marginTop: 0 }}>{t.feeDesc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder={t.feePlaceholder}
            value={feeAddress}
            onChange={(e) => setFeeAddress(e.target.value)}
            style={{ flex: 1, backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
          />
          <input 
            type="text" 
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            style={{ width: '100px', backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', textAlign: 'center', outline: 'none' }}
          />
          <button 
            onClick={handleDistributeFee}
            disabled={!walletActive || !feeAddress || isTxPending}
            style={{ backgroundColor: walletActive && feeAddress ? '#2563eb' : '#1e293b', color: '#ffffff', fontSize: '12px', fontWeight: '600', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: walletActive && feeAddress ? 'pointer' : 'not-allowed' }}
          >
            {isTxPending ? 'processing fee distribution...' : t.distributeFee}
          </button>
        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>{t.workflow}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>{t.wf1Title}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{t.wf1Desc}</p>
            </div>
            <span style={{ fontSize: '10px', backgroundColor: walletActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: walletActive ? '#4ade80' : '#fbbf24', padding: '4px 8px', borderRadius: '4px', border: `1px solid ${walletActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` }}>
              {walletActive ? t.wf1Complete : t.wf1Pending}
            </span>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>{t.wf2Title}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{t.wf2Desc}</p>
            </div>
            <button 
              onClick={handleRunSettlement}
              disabled={!walletActive || isTxPending}
              style={{ backgroundColor: walletActive ? 'rgba(147, 51, 234, 0.8)' : '#1e293b', color: '#ffffff', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: walletActive ? 'pointer' : 'not-allowed' }}
            >
              {isTxPending ? 'processing...' : t.runSettlement}
            </button>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>{t.wf3Title}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{t.wf3Desc}</p>
            </div>
            <button 
              onClick={handleClaimStamp}
              disabled={!walletActive || builderStamp}
              style={{ backgroundColor: builderStamp ? 'rgba(34, 197, 94, 0.2)' : '#1e293b', color: builderStamp ? '#4ade80' : '#cbd5e1', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: walletActive && !builderStamp ? 'pointer' : 'not-allowed' }}
            >
              {t.claimStamp}
            </button>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #1e1b4b', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: '600' }}>
          <button onClick={() => setActiveTab('transfer')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: activeTab === 'transfer' ? '#c084fc' : '#94a3b8', borderBottom: activeTab === 'transfer' ? '2px solid #c084fc' : 'none', paddingBottom: '4px' }}>{t.tabTransfer}</button>
          <button onClick={() => setActiveTab('pos')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: activeTab === 'pos' ? '#c084fc' : '#94a3b8', borderBottom: activeTab === 'pos' ? '2px solid #c084fc' : 'none', paddingBottom: '4px' }}>{t.tabPos}</button>
          <button onClick={() => setActiveTab('treasury')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: activeTab === 'treasury' ? '#c084fc' : '#94a3b8', borderBottom: activeTab === 'treasury' ? '2px solid #c084fc' : 'none', paddingBottom: '4px' }}>{t.tabTreasury}</button>
        </div>

        {activeTab === 'transfer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder={t.sendPlaceholder}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ flex: 1, backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
              />
              <button onClick={() => refetchBalance()} style={{ backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '12px', padding: '0 12px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}>{t.scanQr}</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a192f', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e1b4b', fontSize: '10px', color: '#94a3b8' }}>
              <span>{t.transferRoute}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span onClick={() => setTransferRoute('native')} style={{ padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: transferRoute === 'native' ? 'rgba(168, 85, 247, 0.2)' : '#1e293b', color: transferRoute === 'native' ? '#d8b4fe' : '#64748b', border: transferRoute === 'native' ? '1px solid rgba(168, 85, 247, 0.3)' : 'none' }}>{t.gasUsdc}</span>
                <span onClick={() => setTransferRoute('erc20')} style={{ padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: transferRoute === 'erc20' ? 'rgba(168, 85, 247, 0.2)' : '#1e293b', color: transferRoute === 'erc20' ? '#d8b4fe' : '#64748b', border: transferRoute === 'erc20' ? '1px solid rgba(168, 85, 247, 0.3)' : 'none' }}>{t.erc20}</span>
              </div>
            </div>
            <input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
            />
            <button 
              onClick={handlePay}
              disabled={!walletActive || !recipient || isTxPending}
              style={{ width: '100%', backgroundColor: walletActive && recipient ? '#9333ea' : '#1e293b', color: '#ffffff', fontWeight: '500', fontSize: '12px', padding: '12px', borderRadius: '8px', border: 'none', cursor: walletActive && recipient ? 'pointer' : 'not-allowed' }}
            >
              {t.payButton(amount)}
            </button>
          </div>
        )}

        {activeTab === 'pos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>generate merchant QR invoice for instant USDC settlement</p>
            <input 
              type="text" 
              placeholder="Invoice Amount (USDC)"
              value={posAmount}
              onChange={(e) => setPosAmount(e.target.value)}
              style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
            />
            <button 
              onClick={() => setPosQrGenerated(true)}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              generate pos invoice qr
            </button>
            {posQrGenerated && (
              <div style={{ backgroundColor: '#0a192f', border: '1px solid #1e3a8a', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#4ade80', margin: '0 0 8px 0' }}>invoice active: {posAmount} USDC</p>
                <div style={{ width: '120px', height: '120px', margin: '0 auto', background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', borderRadius: '8px', padding: '4px' }}>
                  [QR DATA: arc:{address || '0x00'}?amt={posAmount}]
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'treasury' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>arc treasury vault balance:</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{treasuryBalance} USDC</span>
            </div>
            <input 
              type="text" 
              placeholder="Deposit Amount"
              value={treasuryDeposit}
              onChange={(e) => setTreasuryDeposit(e.target.value)}
              style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
            />
            <button 
              onClick={handleTreasuryDeposit}
              style={{ backgroundColor: '#16a34a', color: '#ffffff', fontSize: '12px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              deposit to arc yield vault (4.8% APY)
            </button>
          </div>
        )}

      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>{t.infra}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>{t.explorer}</span>
            <span style={{ color: '#475569' }}>→</span>
          </a>
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>{t.faucet}</span>
            <span style={{ color: '#475569' }}>→</span>
          </a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>{t.docs}</span>
            <span style={{ color: '#475569' }}>→</span>
          </a>
        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', margin: 0 }}>{t.logsTitle}</h2>
          {txLogs.length > 0 && (
            <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer' }}>
              {t.clearLogs}
            </button>
          )}
        </div>
        
        {txLogs.length === 0 ? (
          <div style={{ backgroundColor: '#0a192f', padding: '24px', borderRadius: '8px', border: '1px solid #1e1b4b', textAlign: 'center', fontSize: '12px', color: walletActive ? '#38bdf8' : '#64748b' }}>
            {walletActive && address ? t.logsActive(address) : t.logsDefault}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {txLogs.map((log) => (
              <div key={log.id} style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '2px' }}>{log.type}</div>
                  <div style={{ color: '#64748b', fontSize: '10px', wordBreak: 'break-all' }}>to: {log.to} · {log.timestamp}</div>
                  {log.hash && (
                    <a href={`https://testnet.arcscan.app/tx/${log.hash}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '10px', textDecoration: 'underline', marginTop: '2px', display: 'inline-block' }}>
                      verify on arcscan ({log.hash.substring(0, 10)}...)
                    </a>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#c084fc', fontWeight: '600' }}>{log.amount}</div>
                  <div style={{ fontSize: '9px', color: log.status === 'completed' ? '#4ade80' : '#f87171' }}>{log.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '11px', color: '#64748b', borderTop: '1px solid #1e1b4b' }}>
        <p style={{ margin: 0 }}>{t.footer}</p>
      </footer>
    </main>
  )
}

function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <DashboardContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default dynamic(() => Promise.resolve(Page), { ssr: false })
