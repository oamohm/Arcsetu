import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount, useBalance, useSendTransaction, useWriteContract, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { defineChain, parseEther, parseUnits } from 'viem'

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

const ArcLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="url(#arc-grad)" />
    <path d="M8 22C8 14.268 14.268 8 22 8" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="22" cy="22" r="3.5" fill="#38bdf8" />
    <defs>
      <linearGradient id="arc-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ef4444" />
        <stop offset="0.5" stopColor="#a855f7" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
  </svg>
)

function DashboardContent() {
  const { address, isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const [mounted, setMounted] = useState(false)
  const [arcId, setArcId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [feeAddress, setFeeAddress] = useState('')
  const [feeAmount, setFeeAmount] = useState('0.05')
  const [activeTab, setActiveTab] = useState<'transfer' | 'pos' | 'treasury'>('transfer')
  const [transferRoute, setTransferRoute] = useState<'native' | 'erc20'>('native')
  const [locale, setLocale] = useState<'en' | 'hi'>('en')
  const [selectedRoute, setSelectedRoute] = useState<'native' | 'cctp' | 'speed' | 'splitter'>('native')
  const [settlementCount, setSettlementCount] = useState(0)
  const [builderStamp, setBuilderStamp] = useState(false)
  const [txLogs, setTxLogs] = useState<TxLog[]>([])

  const [posAmount, setPosAmount] = useState('5.0')
  const [posQrGenerated, setPosQrGenerated] = useState(false)
  const [treasuryDeposit, setTreasuryDeposit] = useState('10')
  const [treasuryBalance, setTreasuryBalance] = useState('1450.25')

  const { data: balanceData, refetch: refetchBalance, isLoading: isBalanceLoading } = useBalance({
    address: address,
    chainId: arcTestnet.id,
  })

  const { sendTransactionAsync, isPending: isNativeTxPending } = useSendTransaction()
  const { writeContractAsync, isPending: isContractTxPending } = useWriteContract()

  const isTxPending = isNativeTxPending || isContractTxPending

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

  const ensureArcChain = async () => {
    if (currentChainId !== arcTestnet.id && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: arcTestnet.id })
      } catch (e) {
        console.warn('chain switch bypassed or failed', e)
      }
    }
  }

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

  const handlePay = async () => {
    if (!recipient || !amount) return
    const logId = 'tx_' + Date.now()
    await ensureArcChain()

    try {
      let hash = ''
      if (transferRoute === 'native') {
        hash = await sendTransactionAsync({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
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
        type: transferRoute === 'native' ? 'Native USDC Transfer' : 'ERC20 Contract Transfer',
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
        value: parseEther(feeAmount),
        chainId: arcTestnet.id,
      })

      saveLog({
        id: logId,
        type: 'Fee Distribution Settlement',
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
    const logId = 'settle_' + Date.now()
    await ensureArcChain()

    try {
      const target = address || '0x0000000000000000000000000000000000000001'
      const hash = await sendTransactionAsync({
        to: target as `0x${string}`,
        value: parseEther('0.0001'),
        chainId: arcTestnet.id,
      })

      const newCount = settlementCount + 1
      setSettlementCount(newCount)
      localStorage.setItem('arc_settlement_count', newCount.toString())

      saveLog({
        id: logId,
        type: 'Deterministic Settlement Engine Run',
        amount: '0.0001 USDC',
        to: target,
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchBalance()
    } catch (e) {
      console.error('settlement execution failed', e)
    }
  }

  const handleClaimStamp = async () => {
    if (!isConnected || !address) return
    const logId = 'stamp_' + Date.now()
    await ensureArcChain()

    try {
      const hash = await sendTransactionAsync({
        to: address as `0x${string}`,
        value: parseEther('0.0001'),
        chainId: arcTestnet.id,
      })

      setBuilderStamp(true)
      localStorage.setItem('arc_builder_stamp', 'true')
      saveLog({
        id: logId,
        type: 'Arc Builder Badge Stamp Issue',
        amount: '0.0001 USDC',
        to: address,
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchBalance()
    } catch (e) {
      console.error('claim stamp error', e)
    }
  }

  const handleTreasuryDeposit = async () => {
    if (!treasuryDeposit) return
    const logId = 'yield_' + Date.now()
    await ensureArcChain()

    try {
      const target = address || '0x0000000000000000000000000000000000000001'
      const hash = await sendTransactionAsync({
        to: target as `0x${string}`,
        value: parseEther(treasuryDeposit),
        chainId: arcTestnet.id,
      })

      const current = parseFloat(treasuryBalance)
      const added = parseFloat(treasuryDeposit)
      const updated = (current + added).toFixed(2)
      setTreasuryBalance(updated)

      saveLog({
        id: logId,
        type: 'Treasury Yield Vault Deposit',
        amount: `${treasuryDeposit} USDC`,
        to: 'Arc Yield Vault (4.8% APY)',
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchBalance()
    } catch (e) {
      console.error('treasury deposit error', e)
    }
  }

  const clearHistory = () => {
    setTxLogs([])
    localStorage.removeItem('arc_settlement_logs')
  }

  const displayBalance = () => {
    if (!isConnected) return '0.0000 USDC'
    if (isBalanceLoading) return 'fetching...'
    if (balanceData) {
      return `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    }
    return '0.0000 USDC'
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
      runSettlement: 'run settlement',
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
      docs: 'arc protocol docs',
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
      runSettlement: 'सेटलमेंट चलाएं',
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
      docs: 'आर्क प्रोटोकॉल दस्तावेज़',
      logsTitle: 'आर्क नेटवर्क गतिविधि और सत्यापन लॉग',
      logsDefault: 'आर्क सेटलमेंट गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
      logsActive: (addr: string) => `वाग्मी (Wagmi) से कनेक्टेड: ${addr}`,
      clearLogs: 'हिस्ट्री साफ़ करें',
      footer: 'आर्क सेटलमेंट इंजन · विकेंद्रीकृत पैमाने के लिए निर्मित'
    }
  }[locale]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#060d19', color: '#f1f5f9', padding: '16px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
      
      {/* Header with ArcLogo Component */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArcLogo />
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              {t.title}
              <span style={{ fontSize: '9px', backgroundColor: '#3b0764', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', border: '1px solid #6b21a8' }}>{t.badge}</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{t.subtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')} style={{ fontSize: '11px', background: '#0f172a', color: '#94a3b8', padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer' }}>
            {locale === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </header>

      {/* Identity Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '11px', color: '#a855f7', margin: 0, textTransform: 'uppercase' }}>{t.identity}</h2>
          <span style={{ fontSize: '10px', color: isConnected ? '#22c55e' : '#ef4444' }}>{isConnected ? t.statusConn : t.statusDisc}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
            <input type="text" placeholder={t.boundId} value={arcId} onChange={(e) => handleSaveArcId(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#f1f5f9', fontSize: '12px' }} />
          </div>
          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
            <span>{t.treasuryBal}</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{displayBalance()}</span>
          </div>
        </div>
      </section>

      {/* Asset Routing Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 12px 0', textTransform: 'uppercase' }}>{t.routing}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          
          <div onClick={() => setSelectedRoute('native')} style={{ backgroundColor: '#060d19', border: selectedRoute === 'native' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{t.testnet}</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>{t.nativeUsdc}</div>
            <div style={{ fontSize: '10px', color: selectedRoute === 'native' ? '#22c55e' : '#475569' }}>✓ active</div>
          </div>

          <div onClick={() => setSelectedRoute('cctp')} style={{ backgroundColor: '#060d19', border: selectedRoute === 'cctp' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{t.cctp}</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>{t.crossBridge}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>click to test cctp</div>
          </div>

          <div onClick={() => { setSelectedRoute('speed'); handleRunSettlement() }} style={{ backgroundColor: '#060d19', border: selectedRoute === 'speed' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{t.detEngine}</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>{t.speedBench}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>click to run test</div>
          </div>

          <div onClick={() => setSelectedRoute('splitter')} style={{ backgroundColor: '#060d19', border: selectedRoute === 'splitter' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{t.paymentUx}</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>{t.splitSplitter}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>click to configure</div>
          </div>

        </div>
      </section>

      {/* Fee Engine Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 6px 0', textTransform: 'uppercase' }}>{t.feeEngine}</h2>
        <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 12px 0' }}>{t.feeDesc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder={t.feePlaceholder} value={feeAddress} onChange={(e) => setFeeAddress(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
          <input type="text" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
          <button onClick={handleDistributeFee} disabled={!isConnected || !feeAddress || isTxPending} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '10px', borderRadius: '6px', fontSize: '11px', cursor: isConnected && feeAddress ? 'pointer' : 'not-allowed' }}>
            {t.distributeFee}
          </button>
        </div>
      </section>

      {/* Onboarding Workflow Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 12px 0', textTransform: 'uppercase' }}>{t.workflow}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>{t.wf1Title}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{t.wf1Desc}</div>
            </div>
            <span style={{ fontSize: '10px', backgroundColor: isConnected ? '#064e3b' : '#3b0764', color: isConnected ? '#34d399' : '#d8b4fe', padding: '2px 8px', borderRadius: '4px' }}>
              {isConnected ? t.wf1Complete : t.wf1Pending}
            </span>
          </div>

          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>{t.wf2Title}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{t.wf2Desc}</div>
            </div>
            <button onClick={handleRunSettlement} style={{ fontSize: '10px', backgroundColor: '#3b0764', color: '#d8b4fe', border: '1px solid #6b21a8', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              {t.runSettlement}
            </button>
          </div>

          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>{t.wf3Title}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{t.wf3Desc}</div>
            </div>
            <button onClick={handleClaimStamp} disabled={builderStamp || !isConnected} style={{ fontSize: '10px', backgroundColor: builderStamp ? '#064e3b' : '#1e293b', color: builderStamp ? '#34d399' : '#cbd5e1', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              {t.claimStamp}
            </button>
          </div>

        </div>
      </section>

      {/* Tabbed Interface Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '14px' }}>
          <button onClick={() => setActiveTab('transfer')} style={{ background: 'none', border: 'none', color: activeTab === 'transfer' ? '#a855f7' : '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
            {t.tabTransfer}
          </button>
          <button onClick={() => setActiveTab('pos')} style={{ background: 'none', border: 'none', color: activeTab === 'pos' ? '#a855f7' : '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
            {t.tabPos}
          </button>
          <button onClick={() => setActiveTab('treasury')} style={{ background: 'none', border: 'none', color: activeTab === 'treasury' ? '#a855f7' : '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
            {t.tabTreasury}
          </button>
        </div>

        {activeTab === 'transfer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder={t.sendPlaceholder} value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ flex: 1, backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
              <button onClick={() => refetchBalance()} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '0 12px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}>
                {t.scanQr}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
              <span>{t.transferRoute}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span onClick={() => setTransferRoute('native')} style={{ padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: transferRoute === 'native' ? '#3b0764' : '#060d19', color: transferRoute === 'native' ? '#d8b4fe' : '#64748b', border: '1px solid #1e293b' }}>{t.gasUsdc}</span>
                <span onClick={() => setTransferRoute('erc20')} style={{ padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: transferRoute === 'erc20' ? '#3b0764' : '#060d19', color: transferRoute === 'erc20' ? '#d8b4fe' : '#64748b', border: '1px solid #1e293b' }}>{t.erc20}</span>
              </div>
            </div>

            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />

            <button onClick={handlePay} disabled={!isConnected || !recipient || isTxPending} style={{ backgroundColor: isConnected && recipient ? '#7e22ce' : '#1e293b', color: '#ffffff', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '12px', cursor: isConnected && recipient ? 'pointer' : 'not-allowed' }}>
              {t.payButton(amount)}
            </button>
          </div>
        )}

        {activeTab === 'pos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="invoice amount (usdc)" value={posAmount} onChange={(e) => setPosAmount(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
            <button onClick={() => setPosQrGenerated(true)} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
              generate pos qr invoice
            </button>
            {posQrGenerated && (
              <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '16px', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#22c55e', margin: '0 0 8px 0' }}>invoice active: {posAmount} USDC</p>
                <div style={{ width: '120px', height: '120px', margin: '0 auto', background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', borderRadius: '6px', padding: '4px' }}>
                  [QR DATA: arc:{address || '0x00'}?amt={posAmount}]
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'treasury' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
              <span>arc treasury vault balance:</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{treasuryBalance} USDC</span>
            </div>
            <input type="text" placeholder="deposit amount" value={treasuryDeposit} onChange={(e) => setTreasuryDeposit(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
            <button onClick={handleTreasuryDeposit} disabled={!isConnected} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '10px', borderRadius: '6px', fontSize: '11px', cursor: isConnected ? 'pointer' : 'not-allowed' }}>
              deposit to arc yield vault (4.8% APY)
            </button>
          </div>
        )}
      </section>

      {/* Infrastructure Links */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{t.infra}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
            {t.explorer}
          </a>
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
            {t.faucet}
          </a>
          <a href="https://docs.arcscan.app" target="_blank" rel="noreferrer" style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
            {t.docs}
          </a>
        </div>
      </section>

      {/* Activity Logs & Verification */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '11px', color: '#a855f7', margin: 0, textTransform: 'uppercase' }}>{t.logsTitle}</h2>
          {txLogs.length > 0 && (
            <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer' }}>
              {t.clearLogs}
            </button>
          )}
        </div>

        <div style={{ fontSize: '10px', color: '#38bdf8', marginBottom: '12px' }}>
          {isConnected && address ? t.logsActive(address) : t.logsDefault}
        </div>

        {txLogs.length === 0 ? (
          <div style={{ backgroundColor: '#060d19', padding: '16px', textAlign: 'center', fontSize: '11px', color: '#475569', borderRadius: '6px' }}>
            no transactions recorded yet. execute a transfer to broadcast on arc testnet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {txLogs.map((log) => (
              <div key={log.id} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{log.type}</div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>to: {log.to} · {log.timestamp}</div>
                  {log.hash && (
                    <a href={`https://testnet.arcscan.app/tx/${log.hash}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '10px', textDecoration: 'underline', marginTop: '2px', display: 'inline-block' }}>
                      verify on arcscan ({log.hash.substring(0, 10)}...)
                    </a>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#a855f7', fontWeight: '600' }}>{log.amount}</div>
                  <div style={{ fontSize: '9px', color: log.status === 'completed' ? '#22c55e' : '#ef4444' }}>{log.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={{ textAlign: 'center', padding: '16px 0 0 0', fontSize: '10px', color: '#475569' }}>
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
