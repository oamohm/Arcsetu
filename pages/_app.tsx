'use client'

import React, { useState } from 'react'

export default function Page() {
  const [arcId, setArcId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [feeAddress, setFeeAddress] = useState('')
  const [activeTab, setActiveTab] = useState('transfer')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a192f', color: '#f1f5f9', padding: '16px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
      
      {/* header section */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between', alignItems: 'stretch', backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(to bottom, #162a4a, #0a192f)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '4px' }}>
            <svg width="32" height="32" viewBox="0 0 100 100" style={{ width: '32px', height: '32px' }}>
              <path d="M50 8 C44 8 41 14 43 20 C45 25 48 28 50 32 C52 28 55 25 57 20 C59 14 56 8 50 8 Z" fill="#facc15" />
              <path d="M35 75 L35 32 L40 32 L40 75 Z M60 75 L60 32 L65 32 L65 75 Z" fill="#94a3b8" />
              <path d="M15 72 L85 72 L85 77 L15 77 Z" fill="#64748b" />
              <path d="M37 32 Q 50 50 63 32 M37 45 Q 50 58 63 45 M37 60 Q 50 70 63 60" fill="none" stroke="#cbd5e1" strokeWidth="3" />
              <path d="M37 32 L20 70 L15 68 L35 30 Z M63 32 L80 70 L85 68 L65 30 Z" fill="#94a3b8" />
              <ellipse cx="50" cy="85" rx="18" ry="4" fill="#64748b" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              ARC SETTLEMENT HUB
              <span style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>PRIMARY</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>programmable usdc settlement engine on the arc network</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '12px', background: 'rgba(30, 41, 59, 0.8)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', border: '1px solid #334155' }}>English</span>
          <button style={{ background: 'linear-gradient(to right, #9333ea, #4f46e5)', color: '#ffffff', fontSize: '12px', fontWeight: '600', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            Connect Wallet
          </button>
        </div>
      </header>

      {/* multi-chain identity section */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', margin: 0 }}>arc multi-chain identity</h2>
          <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>wallet disconnected</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input 
              type="text" 
              placeholder="bound arc up id" 
              value={arcId}
              onChange={(e) => setArcId(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: '#f1f5f9', fontSize: '12px' }}
            />
            <span style={{ fontSize: '10px', color: '#475569' }}>--</span>
          </div>
          <div style={{ backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span>arc treasury balance</span>
            <span style={{ color: '#f1f5f9', fontWeight: '600' }}>--</span>
          </div>
        </div>
      </section>

      {/* ecosystem asset routing */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>arc ecosystem asset routing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>arc testnet</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>native usdc</p>
            <p style={{ fontSize: '9px', color: '#c084fc', margin: 0 }}>click to select mode</p>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>circle cctp</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>cross-chain bridge</p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>click to test cctp</p>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>deterministic engine</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>speed benchmark</p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>click to run test</p>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 4px 0' }}>payment ux</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>auto-split splitter</p>
            <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>click to configure</p>
          </div>
        </div>
      </section>

      {/* programmable fee engine */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '4px', marginTop: 0 }}>arc programmable fee engine</h2>
        <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '12px', marginTop: 0 }}>distribute creator fees, split payments, or send cross-chain royalties natively on arc.</p>
        <div style={{ display: 'flex', flexDirection: 'column', smDirection: 'row', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="address 0x... or @handle" 
            value={feeAddress}
            onChange={(e) => setFeeAddress(e.target.value)}
            style={{ flex: 1, backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
          />
          <input 
            type="text" 
            defaultValue="0.05" 
            style={{ width: '100px', backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', textAlign: 'center', outline: 'none' }}
          />
          <button style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: '600', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            distribute fee
          </button>
        </div>
      </section>

      {/* builder onboarding workflow */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>arc builder onboarding workflow</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>1. bind arc identity & wallet</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>deterministically registers identity on arc network</p>
            </div>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>pending</span>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>2. execute arc usdc settlement</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>executed: 0 settlement txns</p>
            </div>
            <button style={{ backgroundColor: 'rgba(147, 51, 234, 0.8)', color: '#ffffff', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              run settlement
            </button>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 2px 0' }}>3. claim arc builder stamp</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>issues arc ecosystem verification badge</p>
            </div>
            <button style={{ backgroundColor: '#1e293b', color: '#64748b', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'not-allowed' }}>
              claim stamp
            </button>
          </div>
        </div>
      </section>

      {/* interactive transfer & modules */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #1e1b4b', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px', fontWeight: '600' }}>
          <button onClick={() => setActiveTab('transfer')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: activeTab === 'transfer' ? '#c084fc' : '#94a3b8', borderBottom: activeTab === 'transfer' ? '2px solid #c084fc' : 'none', paddingBottom: '4px' }}>arc usdc transfer</button>
          <button onClick={() => setActiveTab('pos')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: activeTab === 'pos' ? '#c084fc' : '#94a3b8', borderBottom: activeTab === 'pos' ? '2px solid #c084fc' : 'none', paddingBottom: '4px' }}>pos qr invoice</button>
          <button onClick={() => setActiveTab('treasury')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: activeTab === 'treasury' ? '#c084fc' : '#94a3b8', borderBottom: activeTab === 'treasury' ? '2px solid #c084fc' : 'none', paddingBottom: '4px' }}>arc yield treasury</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="send to @arc_id or 0x wallet address" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ flex: 1, backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
            />
            <button style={{ backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '12px', padding: '0 12px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}>scan qr</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a192f', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e1b4b', fontSize: '10px', color: '#94a3b8' }}>
            <span>transfer route:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>native gas usdc</span>
              <span style={{ backgroundColor: '#1e293b', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>erc-20 contract</span>
            </div>
          </div>
          <input 
            type="text" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#0a192f', border: '1px solid #1e1b4b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#f1f5f9', outline: 'none' }}
          />
          <button style={{ width: '100%', backgroundColor: '#9333ea', color: '#ffffff', fontWeight: '500', fontSize: '12px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
            pay via arc usdc ({amount} usdc)
          </button>
        </div>
      </section>

      {/* infrastructure links */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>arc ecosystem infrastructure links</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>arcscan explorer</span>
            <span style={{ color: '#475569' }}>→</span>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>circle usdc faucet</span>
            <span style={{ color: '#475569' }}>→</span>
          </div>
          <div style={{ backgroundColor: '#0a192f', padding: '12px', borderRadius: '8px', border: '1px solid #1e1b4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1' }}>
            <span>arc protocol docs</span>
            <span style={{ color: '#475569' }}>→</span>
          </div>
        </div>
      </section>

      {/* network activity logs */}
      <section style={{ backgroundColor: '#112240', padding: '16px', borderRadius: '12px', border: '1px solid rgba(30, 58, 138, 0.4)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase', marginBottom: '12px', marginTop: 0 }}>arc network activity & verification logs</h2>
        <div style={{ backgroundColor: '#0a192f', padding: '24px', borderRadius: '8px', border: '1px solid #1e1b4b', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          connect wallet to view arc settlement activity.
        </div>
      </section>

      {/* footer section */}
      <footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '11px', color: '#64748b', borderTop: '1px solid #1e1b4b' }}>
        <p style={{ margin: 0 }}>arc settlement engine · built for decentralized scale</p>
      </footer>

    </main>
  )
}
