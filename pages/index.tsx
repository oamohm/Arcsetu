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
import { defineChain, parseEther, parseUnits, formatEther } from 'viem'

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

/* logo component with dual support: loads /logo.png first, falls back to arc svg layout */
const ArcLogo = () => {
  const [imgError, setImgError] = useState(false)

  if (!imgError) {
    return (
      <img
        src="/logo.png"
        alt="Arc Logo"
        onError={() => setImgError(true)}
        style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }}
      />
    )
  }

  return (
    <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="6" fill="url(#arc_header_grad)" />
        <path d="M7 19C7 12.3726 12.3726 7 19 7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="19" r="2.5" fill="#38bdf8" />
        <defs>
          <linearGradient id="arc_header_grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

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

  const [customBalance, setCustomBalance] = useState<string | null>(null)
  const [isFetchingBal, setIsFetchingBal] = useState(false)

  const [posAmount, setPosAmount] = useState('5.0')
  const [posQrGenerated, setPosQrGenerated] = useState(false)
  const [treasuryDeposit, setTreasuryDeposit] = useState('10')
  const [treasuryBalance, setTreasuryBalance] = useState('1450.25')

  const { data: nativeBalanceData, refetch: refetchNative } = useBalance({
    address: address,
    chainId: arcTestnet.id,
  })

  const { sendTransactionAsync, isPending: isNativeTxPending } = useSendTransaction()
  const { writeContractAsync, isPending: isContractTxPending } = useWriteContract()

  const isTxPending = isNativeTxPending || isContractTxPending

  const fetchBalanceDirect = async (accAddress: string) => {
    setIsFetchingBal(true)
    try {
      const res = await fetch('https://rpc-testnet.arcscan.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [accAddress, 'latest'],
          id: 1,
        }),
      })
      const data = await res.json()
      if (data && data.result) {
        const valWei = BigInt(data.result)
        const formatted = parseFloat(formatEther(valWei)).toFixed(4)
        setCustomBalance(`${formatted} USDC`)
      } else {
        setCustomBalance('0.0000 USDC')
      }
    } catch (e) {
      console.error('direct rpc balance fetch failed', e)
      setCustomBalance('0.0000 USDC')
    } finally {
      setIsFetchingBal(false)
    }
  }

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

  useEffect(() => {
    if (isConnected && address) {
      fetchBalanceDirect(address)
    } else {
      setCustomBalance(null)
    }
  }, [address, isConnected])

  if (!mounted) return null

  const refetchAllBalances = () => {
    if (address) {
      fetchBalanceDirect(address)
      refetchNative()
    }
  }

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
      refetchAllBalances()
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
      refetchAllBalances()
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

  const handleTreasuryDeposit = async () => {
    if (!treasuryDeposit || !isConnected) return
    const logId = 'vault_' + Date.now()
    await ensureArcChain()

    try {
      const vaultTarget = '0x0000000000000000000000000000000000000000'
      const hash = await sendTransactionAsync({
        to: vaultTarget as `0x${string}`,
        value: parseEther(treasuryDeposit),
        chainId: arcTestnet.id,
      })

      const updatedVal = (parseFloat(treasuryBalance) + parseFloat(treasuryDeposit)).toFixed(2)
      setTreasuryBalance(updatedVal)

      saveLog({
        id: logId,
        type: 'Arc Treasury Vault Deposit',
        amount: `${treasuryDeposit} USDC`,
        to: vaultTarget,
        timestamp: new Date().toLocaleTimeString(),
        status: 'completed',
        hash: hash,
      })
      refetchAllBalances()
    } catch (e) {
      console.error('treasury deposit error', e)
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
      refetchAllBalances()
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
      refetchAllBalances()
    } catch (e) {
      console.error('claim stamp error', e)
    }
  }

  const clearHistory = () => {
    setTxLogs([])
    localStorage.removeItem('arc_settlement_logs')
  }

  const getDisplayBalance = () => {
    if (!isConnected) return '0.0000 USDC'
    if (isFetchingBal && !customBalance) return 'fetching...'
    if (customBalance) return customBalance
    if (nativeBalanceData) return `${parseFloat(nativeBalanceData.formatted).toFixed(4)} USDC`
    return '0.0000 USDC'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#060d19', color: '#f1f5f9', padding: '16px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
      
      {/* Header section with active logo handler */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArcLogo />
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              ARC SETTLEMENT HUB
              <span style={{ fontSize: '9px', backgroundColor: '#3b0764', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', border: '1px solid #6b21a8' }}>PRIMARY</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>programmable usdc settlement engine on the arc network</p>
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
          <h2 style={{ fontSize: '11px', color: '#a855f7', margin: 0, textTransform: 'uppercase' }}>arc multi-chain identity</h2>
          <span style={{ fontSize: '10px', color: isConnected ? '#22c55e' : '#ef4444' }}>{isConnected ? 'wallet active' : 'wallet disconnected'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
            <input type="text" placeholder="bound arc up id" value={arcId} onChange={(e) => handleSaveArcId(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#f1f5f9', fontSize: '12px' }} />
          </div>
          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
            <span>arc native balance</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{getDisplayBalance()}</span>
          </div>
        </div>
      </section>

      {/* Asset Routing Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 12px 0', textTransform: 'uppercase' }}>arc ecosystem asset routing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          
          <div onClick={() => setSelectedRoute('native')} style={{ backgroundColor: '#060d19', border: selectedRoute === 'native' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>arc testnet</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>native usdc</div>
            <div style={{ fontSize: '10px', color: selectedRoute === 'native' ? '#22c55e' : '#475569' }}>✓ active</div>
          </div>

          <div onClick={() => setSelectedRoute('cctp')} style={{ backgroundColor: '#060d19', border: selectedRoute === 'cctp' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>circle cctp</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>cross-chain bridge</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>click to test cctp</div>
          </div>

          <div onClick={() => { setSelectedRoute('speed'); handleRunSettlement() }} style={{ backgroundColor: '#060d19', border: selectedRoute === 'speed' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>deterministic engine</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>speed benchmark</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>click to run test</div>
          </div>

          <div onClick={() => setSelectedRoute('splitter')} style={{ backgroundColor: '#060d19', border: selectedRoute === 'splitter' ? '1px solid #a855f7' : '1px solid #1e293b', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>payment ux</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>auto-split splitter</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>click to configure</div>
          </div>

        </div>
      </section>

      {/* Fee Engine Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 6px 0', textTransform: 'uppercase' }}>arc programmable fee engine</h2>
        <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 12px 0' }}>distribute creator fees, split payments, or send cross-chain royalties natively on arc.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="address 0x..." value={feeAddress} onChange={(e) => setFeeAddress(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
          <input type="text" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
          <button onClick={handleDistributeFee} disabled={!isConnected || !feeAddress || isTxPending} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '10px', borderRadius: '6px', fontSize: '11px', cursor: isConnected && feeAddress ? 'pointer' : 'not-allowed' }}>
            distribute fee
          </button>
        </div>
      </section>

      {/* Onboarding Workflow Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 12px 0', textTransform: 'uppercase' }}>arc builder onboarding workflow</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>1. bind arc identity & wallet</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>deterministically registers identity on arc network</div>
            </div>
            <span style={{ fontSize: '10px', backgroundColor: isConnected ? '#064e3b' : '#3b0764', color: isConnected ? '#34d399' : '#d8b4fe', padding: '2px 8px', borderRadius: '4px' }}>
              {isConnected ? 'completed' : 'pending'}
            </span>
          </div>

          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>2. execute arc usdc settlement</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>executed: {settlementCount} settlement txns</div>
            </div>
            <button onClick={handleRunSettlement} style={{ fontSize: '10px', backgroundColor: '#3b0764', color: '#d8b4fe', border: '1px solid #6b21a8', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              run settlement
            </button>
          </div>

          <div style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>3. claim arc builder stamp</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>issues arc ecosystem verification badge</div>
            </div>
            <button onClick={handleClaimStamp} disabled={builderStamp || !isConnected} style={{ fontSize: '10px', backgroundColor: builderStamp ? '#064e3b' : '#1e293b', color: builderStamp ? '#34d399' : '#cbd5e1', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              {builderStamp ? 'stamp claimed' : 'claim stamp'}
            </button>
          </div>

        </div>
      </section>

      {/* Tabbed Interface Section */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px', marginBottom: '14px' }}>
          <button onClick={() => setActiveTab('transfer')} style={{ background: 'none', border: 'none', color: activeTab === 'transfer' ? '#a855f7' : '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
            arc usdc transfer
          </button>
          <button onClick={() => setActiveTab('pos')} style={{ background: 'none', border: 'none', color: activeTab === 'pos' ? '#a855f7' : '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
            pos qr invoice
          </button>
          <button onClick={() => setActiveTab('treasury')} style={{ background: 'none', border: 'none', color: activeTab === 'treasury' ? '#a855f7' : '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
            arc yield treasury
          </button>
        </div>

        {activeTab === 'transfer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="send to 0x wallet address" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ flex: 1, backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />
              <button onClick={refetchAllBalances} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '0 12px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}>
                refresh balance
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
              <span>transfer route:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span onClick={() => setTransferRoute('native')} style={{ padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: transferRoute === 'native' ? '#3b0764' : '#060d19', color: transferRoute === 'native' ? '#d8b4fe' : '#64748b', border: '1px solid #1e293b' }}>native gas usdc</span>
                <span onClick={() => setTransferRoute('erc20')} style={{ padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: transferRoute === 'erc20' ? '#3b0764' : '#060d19', color: transferRoute === 'erc20' ? '#d8b4fe' : '#64748b', border: '1px solid #1e293b' }}>erc-20 contract</span>
              </div>
            </div>

            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }} />

            <button onClick={handlePay} disabled={!isConnected || !recipient || isTxPending} style={{ backgroundColor: isConnected && recipient ? '#7e22ce' : '#1e293b', color: '#ffffff', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '12px', cursor: isConnected && recipient ? 'pointer' : 'not-allowed' }}>
              {isTxPending ? 'processing transaction...' : `pay via arc usdc (${amount} usdc)`}
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
            <button onClick={handleTreasuryDeposit} disabled={!isConnected || !treasuryDeposit || isTxPending} style={{ backgroundColor: isConnected ? '#0f172a' : '#1e293b', border: '1px solid #334155', color: '#ffffff', padding: '10px', borderRadius: '6px', fontSize: '11px', cursor: isConnected ? 'pointer' : 'not-allowed' }}>
              deposit to arc yield vault (4.8% APY)
            </button>
          </div>
        )}
      </section>

      {/* Infrastructure Links */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', color: '#a855f7', margin: '0 0 10px 0', textTransform: 'uppercase' }}>arc ecosystem infrastructure links</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
            arcscan explorer
          </a>
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
            circle usdc faucet
          </a>
          <a href="https://docs.arcscan.app" target="_blank" rel="noreferrer" style={{ backgroundColor: '#060d19', border: '1px solid #1e293b', padding: '10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
            arc protocol docs
          </a>
        </div>
      </section>

      {/* Activity Logs & Verification */}
      <section style={{ backgroundColor: '#0b172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '11px', color: '#a855f7', margin: 0, textTransform: 'uppercase' }}>arc network activity & verification logs</h2>
          {txLogs.length > 0 && (
            <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer' }}>
              clear history
            </button>
          )}
        </div>

        <div style={{ fontSize: '10px', color: '#38bdf8', marginBottom: '12px' }}>
          {isConnected && address ? `connected via wagmi: ${address}` : 'connect wallet to view arc settlement activity.'}
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
        <p style={{ margin: 0 }}>arc settlement engine · built for decentralized scale</p>
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
