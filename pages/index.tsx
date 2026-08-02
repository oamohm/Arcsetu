import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const config = getDefaultConfig({
  appName: 'Arc Settlement Hub',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})

const queryClient = new QueryClient()

function DashboardContent() {
  const { address, isConnected } = useAccount()
  const [arcId, setArcId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [feeAddress, setFeeAddress] = useState('')
  const [activeTab, setActiveTab] = useState('transfer')
  const [locale, setLocale] = useState<'en' | 'hi'>('en')

  const t = {
    en: {
      title: 'ARC SETTLEMENT HUB',
      badge: 'PRIMARY',
      subtitle: 'programmable usdc settlement engine on the arc network',
      identity: 'arc multi-chain identity',
      statusDisc: 'wallet disconnected',
      statusConn: 'wallet active',
      boundId: 'bound arc up id',
      treasuryBal: 'arc treasury balance',
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
      feePlaceholder: 'address 0x... or @handle',
      distributeFee: 'distribute fee',
      workflow: 'arc builder onboarding workflow',
      wf1Title: '1. bind arc identity & wallet',
      wf1Desc: 'deterministically registers identity on arc network',
      wf1Pending: 'pending',
      wf1Complete: 'completed',
      wf2Title: '2. execute arc usdc settlement',
      wf2Desc: 'executed: 0 settlement txns',
      runSettlement: 'run settlement',
      wf3Title: '3. claim arc builder stamp',
      wf3Desc: 'issues arc ecosystem verification badge',
      claimStamp: 'claim stamp',
      tabTransfer: 'arc usdc transfer',
      tabPos: 'pos qr invoice',
      tabTreasury: 'arc yield treasury',
      sendPlaceholder: 'send to @arc_id or 0x wallet address',
      scanQr: 'scan qr',
      transferRoute: 'transfer route:',
      gasUsdc: 'native gas usdc',
      erc20: 'erc-20 contract',
      payButton: (amt: string) => `pay via arc usdc (${amt} usdc)`,
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
      treasuryBal: 'आर्क ट्रेजरी शेष',
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
      feePlaceholder: 'पता 0x... या @handle',
      distributeFee: 'फीस वितरित करें',
      workflow: 'आर्क बिल्डर ऑनबोर्डिंग वर्कफ़्लो',
      wf1Title: '1. आर्क पहचान और वॉलेट बांधें',
      wf1Desc: 'आर्क नेटवर्क पर पहचान को निश्चित रूप से पंजीकृत करता है',
      wf1Pending: 'लंबित',
      wf1Complete: 'पूर्ण',
      wf2Title: '2. आर्क यूएसडीसी सेटलमेंट निष्पादित करें',
      wf2Desc: 'निष्पादित: 0 सेटलमेंट लेन-देन',
      runSettlement: 'सेटलमेंट चलाएं',
      wf3Title: '3. आर्क बिल्डर स्टाम्प का दावा करें',
      wf3Desc: 'आर्क इकोसिस्टम सत्यापन बैज जारी करता है',
      claimStamp: 'स्टाम्प का दावा करें',
      tabTransfer: 'आर्क यूएसडीसी ट्रांसफर',
      tabPos: 'पीओएस क्यूआर इनवॉइस',
      tabTreasury: 'आर्क यील्ड ट्रेजरी',
      sendPlaceholder: '@arc_id या 0x वॉलेट पते पर भेजें',
      scanQr: 'क्यूआर स्कैन करें',
      transferRoute: 'ट्रांसफर रूट:',
      gasUsdc: 'मूल गैस यूएसडीसी',
      erc20: 'ईआरसी-20 अनुबंध',
      payButton: (amt: string) => `आर्क यूएसडीसी के माध्यम से भुगतान करें (${amt} यूएसडीसी)`,
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
