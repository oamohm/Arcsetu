import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount, useBalance, useSendTransaction } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { defineChain, parseEther } from 'viem'

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

function DashboardContent() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [arcId, setArcId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [feeAddress, setFeeAddress] = useState('')
  const [feeAmount, setFeeAmount] = useState('0.05')
  const [activeTab, setActiveTab] = useState('transfer')
  const [locale, setLocale] = useState<'en' | 'hi'>('en')
  const [settlementCount, setSettlementCount] = useState(0)
  const [builderStamp, setBuilderStamp] = useState(false)

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
  })

  const { sendTransaction, isPending } = useSendTransaction()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePay = () => {
    if (!recipient || !amount) return
    try {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleDistributeFee = () => {
    if (!feeAddress || !feeAmount) return
    try {
      sendTransaction({
        to: feeAddress as `0x${string}`,
        value: parseEther(feeAmount),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleRunSettlement = () => {
    setSettlementCount((prev) => prev + 1)
  }

  const handleClaimStamp = () => {
    if (walletActive) {
      setBuilderStamp(true)
    }
  }

  const walletActive = mounted && isConnected

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
      selectMode: 'click to select mode',
      cctp: 'circle cctp',
      crossBridge: 'cross-chain bridge',
      testCctp: 'click to test cctp',
      detEngine: 'deterministic engine',
      speedBench: 'speed benchmark',
      runTest: 'click to run test',
      paymentUx: 'payment ux',
      splitSplitter: 'auto-split splitter',
      config: 'click to configure',
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
      payButton: (amt: string) => isPending ? 'processing...' : `pay via arc usdc (${amt} usdc)`,
      infra: 'arc ecosystem infrastructure links',
      explorer: 'arcscan explorer',
      faucet: 'circle usdc faucet',
      docs: 'arc protocol docs',
      logsTitle: 'arc network activity & verification logs',
      logsDefault: 'connect wallet to view arc settlement activity.',
      logsActive: (addr: string) => `connected via wagmi: ${addr}`,
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
      selectMode: 'मोड चुनने के लिए क्लिक करें',
      cctp: 'सर्कल सीसीटीपी',
      crossBridge: 'क्रॉस-चेन ब्रिज',
      testCctp: 'सीसीटीपी टेस्ट करने के लिए क्लिक करें',
      detEngine: 'डिटर्मिनिस्टिक इंजन',
      speedBench: 'स्पीड बेंचमार्क',
      runTest: 'टेस्ट चलाने के लिए क्लिक करें',
      paymentUx: 'पेमेंट यूएक्स',
      splitSplitter: 'ऑटो-स्प्लिट स्पलीटर',
      config: 'कॉन्फ़िगर करने के लिए क्लिक करें',
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
      payButton: (amt: string) => isPending ? 'प्रोसेस हो रहा है...' : `आर्क यूएसडीसी भुगतान करें (${amt} यूएसडीसी)`,
      infra: 'आर्क इकोसिस्टम इंफ्रास्ट्रक्चर लिंक',
      explorer: 'आर्कस्केन एक्सप्लोरर',
      faucet: 'सर्कल यूएसडीसी फॉसेट',
      docs: 'आर्क प्रोटोकॉल दस्तावेज़',
      logsTitle: 'आर्क नेटवर्क गतिविधि और सत्यापन लॉग',
      logsDefault: 'आर्क सेटलमेंट गतिविधि देखने के लिए वॉलेट कनेक्ट करें।',
      logsActive: (addr: string) => `वाग्मी के माध्यम से कनेक्टेड: ${addr}`,
      footer: 'आर्क सेटलमेंट इंजन · विकेंद्रीकृत पैमाने के लिए निर्मित'
    }
  }[locale]

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
          <button 
            onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
            style={{ fontSize: '12px', background: 'rgba(30, 41, 59, 0.8)', color: '#cbd5e1', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}
          >
            {locale === 'en' ? 'हिन्दी' : 'English'}
          </button>
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
              onChange={(e) => setArcId(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#f1f5f9', fontSize: '12px' }}
            />
            <span style={{ fontSize: '10px', color: '#475569' }}>{arcId ? 'active' : '--'}</span>
          </div>
          <div style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span>{t.treasuryBal}</span>
            <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
              {walletActive && balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '--'}
            </span>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>{t.routing}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.testnet}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.nativeUsdc}</p>
            <p style={{ fontSize: '9px', color: '#c084fc', margin: 0 }}>{t.selectMode}</p>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.cctp}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.crossBridge}</p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>{t.testCctp}</p>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.detEngine}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.speedBench}</p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>{t.runTest}</p>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>{t.paymentUx}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>{t.splitSplitter}</p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>{t.config}</p>
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
            disabled={!walletActive || !feeAddress}
            style={{ backgroundColor: walletActive && feeAddress ? '#2563eb' : '#1e293b', color: '#ffffff', fontSize: '12px', fontWeight: '600', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            {t.distributeFee}
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
              style={{ backgroundColor: 'rgba(147, 51, 234, 0.8)', color: '#ffffff', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              {t.runSettlement}
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
              style={{ backgroundColor: builderStamp ? 'rgba(34, 197, 94, 0.2)' : '#1e293b', color: builderStamp ? '#4ade80' : '#cbd5e1', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
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
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>{t.gasUsdc}</span>
              <span style={{ backgroundColor: '#1e293b', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>{t.erc20}</span>
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
            disabled={!walletActive || !recipient || isPending}
            style={{ width: '100%', backgroundColor: walletActive && recipient ? '#9333ea' : '#1e293b', color: '#ffffff', fontWeight: '500', fontSize: '12px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            {t.payButton(amount)}
          </button>
        </div>
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
          <a href="https://docs.arc.network" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>{t.docs}</span>
            <span style={{ color: '#475569' }}>→</span>
          </a>
        </div>
      </section>

      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>{t.logsTitle}</h2>
        <div style={{ backgroundColor: '#0a192f', padding: '24px', borderRadius: '8px', border: '1px solid #1e1b4b', textAlign: 'center', fontSize: '12px', color: walletActive ? '#38bdf8' : '#64748b' }}>
          {walletActive && address ? t.logsActive(address) : t.logsDefault}
        </div>
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
