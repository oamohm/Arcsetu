import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

interface TxHistory {
  hash: string;
  type: string;
  timestamp: string;
  amount: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  // Identity & Workflow States
  const [upId, setUpId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [inputUpId, setInputUpId] = useState('');
  const [workflowStep, setWorkflowStep] = useState(0);
  const [practiceTxCount, setPracticeTxCount] = useState(0);
  
  // Payment & FX States
  const [activeTab, setActiveTab] = useState<'pay' | 'request' | 'fx'>('pay');
  const [payRecipient, setPayRecipient] = useState('');
  const [payAmount, setPayAmount] = useState('0.0001');
  const [reqAmount, setReqAmount] = useState('0.001');

  // FX Calculator
  const [fxTestAmount, setFxTestAmount] = useState('1');
  const [fxInrAmount, setFxInrAmount] = useState('120');
  const [fxKrwAmount, setFxKrwAmount] = useState('1900');

  const [txHistory, setTxHistory] = useState<TxHistory[]>([]);
  const [royaltyEarned, setRoyaltyEarned] = useState(0);

  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // 1. Instantly Sync Data Whenever Wallet Changes
  const syncWalletState = useCallback((currentAddr: string) => {
    const cleanAddr = currentAddr.toLowerCase();
    
    // Check Global ID Registry
    const registry = JSON.parse(localStorage.getItem('giwa_global_identity_registry') || '{}');
    const existingId = registry[cleanAddr];

    if (existingId) {
      setUpId(existingId);
      setIsRegistered(true);
      
      // Load specific wallet state
      const savedStep = localStorage.getItem(`step_${cleanAddr}`) || '1';
      const savedTxCount = localStorage.getItem(`txs_${cleanAddr}`) || '0';
      const savedRoyalty = localStorage.getItem(`royalty_${cleanAddr}`) || '0';
      const savedHistory = localStorage.getItem(`tx_history_${cleanAddr}`) || '[]';

      setWorkflowStep(parseInt(savedStep));
      setPracticeTxCount(parseInt(savedTxCount));
      setRoyaltyEarned(parseFloat(savedRoyalty));
      setTxHistory(JSON.parse(savedHistory));
    } else {
      // Clean state for fresh wallet
      setUpId('');
      setIsRegistered(false);
      setWorkflowStep(0);
      setPracticeTxCount(0);
      setRoyaltyEarned(0);
      setTxHistory([]);
    }
  }, []);

  // Trigger on wallet connect or account change
  useEffect(() => {
    if (isConnected && address) {
      syncWalletState(address);
    } else {
      setUpId('');
      setIsRegistered(false);
      setWorkflowStep(0);
      setPracticeTxCount(0);
      setTxHistory([]);
      setRoyaltyEarned(0);
    }
  }, [address, isConnected, syncWalletState]);

  // 2. Strict 1:1 Identity Registration
  const handleRegisterIdentity = () => {
    if (!inputUpId.trim() || !address) return;
    const cleanAddr = address.toLowerCase();
    const cleanId = inputUpId.trim().replace(/^@/, '');

    const registry = JSON.parse(localStorage.getItem('giwa_global_identity_registry') || '{}');

    // Prevent ID duplication across wallets
    const isTaken = Object.keys(registry).some(
      (key) => key !== cleanAddr && registry[key].toLowerCase() === cleanId.toLowerCase()
    );

    if (isTaken) {
      alert(`ID @${cleanId} किसी और वॉलेट से जुड़ी है! कोई अलग ID चुनें।`);
      return;
    }

    // Save 1:1 Mapping
    registry[cleanAddr] = cleanId;
    localStorage.setItem('giwa_global_identity_registry', JSON.stringify(registry));
    localStorage.setItem(`upid_lookup_${cleanId.toLowerCase()}`, cleanAddr);

    setUpId(cleanId);
    setIsRegistered(true);
    setWorkflowStep(1);
    localStorage.setItem(`step_${cleanAddr}`, '1');
    setInputUpId('');
  };

  // FX Converters
  const handleTestChange = (val: string) => {
    setFxTestAmount(val);
    const num = parseFloat(val) || 0;
    setFxInrAmount((num * 120).toFixed(2));
    setFxKrwAmount((num * 1900).toFixed(2));
  };

  const handleInrChange = (val: string) => {
    setFxInrAmount(val);
    const num = parseFloat(val) || 0;
    const testVal = num / 120;
    setFxTestAmount(testVal.toFixed(6));
    setFxKrwAmount((testVal * 1900).toFixed(2));
  };

  const handleKrwChange = (val: string) => {
    setFxKrwAmount(val);
    const num = parseFloat(val) || 0;
    const testVal = num / 1900;
    setFxTestAmount(testVal.toFixed(6));
    setFxInrAmount((testVal * 120).toFixed(2));
  };

  // Workflow Handlers
  const handleWorkflowRun = (stepNumber: number) => {
    if (!address) return;
    const cleanAddr = address.toLowerCase();

    if (stepNumber === 1 && isRegistered) {
      setWorkflowStep(1);
      localStorage.setItem(`step_${cleanAddr}`, '1');
    } else if (stepNumber === 2 && workflowStep >= 1) {
      sendTransaction({
        to: address,
        value: parseEther('0.0001'),
      });
    } else if (stepNumber === 3 && practiceTxCount > 0) {
      setWorkflowStep(2);
      localStorage.setItem(`step_${cleanAddr}`, '2');
    }
  };

  // Web3 UPI Transfer
  const handleWeb3Pay = () => {
    if (!payRecipient || !payAmount) return;
    let targetAddress = payRecipient.trim();

    if (targetAddress.startsWith('@') || !targetAddress.startsWith('0x')) {
      const cleanLookupId = targetAddress.replace(/^@/, '').toLowerCase();
      const resolvedAddress = localStorage.getItem(`upid_lookup_${cleanLookupId}`);
      if (resolvedAddress) {
        targetAddress = resolvedAddress;
      } else {
        alert(`ID @${cleanLookupId} नहीं मिली। सही ID दर्ज करें।`);
        return;
      }
    }

    sendTransaction({
      to: targetAddress as `0x${string}`,
      value: parseEther(payAmount),
    });
  };

  // Transaction Receipt Listener
  useEffect(() => {
    if (isConfirmed && hash && address) {
      const cleanAddr = address.toLowerCase();

      const newTxCount = practiceTxCount + 1;
      setPracticeTxCount(newTxCount);
      localStorage.setItem(`txs_${cleanAddr}`, newTxCount.toString());

      const addedRoyalty = (parseFloat(payAmount) || 0.0001) * 0.005;
      const newRoyaltyTotal = royaltyEarned + addedRoyalty;
      setRoyaltyEarned(newRoyaltyTotal);
      localStorage.setItem(`royalty_${cleanAddr}`, newRoyaltyTotal.toString());

      const newTx: TxHistory = {
        hash,
        type: payRecipient ? `Web3 UPI (${payRecipient})` : 'Practice Tx',
        timestamp: new Date().toLocaleTimeString(),
        amount: `${payAmount || '0.0001'} TEST`,
      };

      const updatedHistory = [newTx, ...txHistory];
      setTxHistory(updatedHistory);
      localStorage.setItem(`tx_history_${cleanAddr}`, JSON.stringify(updatedHistory));
    }
  }, [isConfirmed, hash, address]);

  const downloadCSVReport = () => {
    if (txHistory.length === 0) return;
    const headers = "Hash,Type,Timestamp,Amount\n";
    const rows = txHistory.map(tx => `${tx.hash},${tx.type},${tx.timestamp},${tx.amount}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giwasetu_report_${address?.slice(0, 6)}.csv`;
    a.click();
  };

  const inrValue = (parseFloat(payAmount || '0') * 120).toFixed(2);
  const krwValue = (parseFloat(payAmount || '0') * 1900).toFixed(2);

  return (
    <div style={{
      backgroundColor: '#070d19',
      color: '#f8fafc',
      minHeight: '100vh',
      padding: '24px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '480px',
      margin: '0 auto',
      backgroundImage: 'radial-gradient(circle at top, #1e1b4b 0%, #070d19 60%)'
    }}>

      {/* HEADER */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '16px',
        marginBottom: '20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.4), 0 8px 16px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px'
          }}>
            🌉
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '900',
              margin: 0,
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GIWASETU
            </h1>
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>
              KR 🇰🇷 ⇄ 🇮🇳 IN Web3 Cross-Border Hub
            </p>
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', margin: '4px 0' }}>
          <a href="https://x.com/Bhupendrxsingh" target="_blank" rel="noreferrer" title="X (Twitter)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://t.me/vertuareallworld" target="_blank" rel="noreferrer" title="Telegram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/bhupendrxsingh" target="_blank" rel="noreferrer" title="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
          </a>
          <a href="https://www.youtube.com/@Bhupendrxsingh" target="_blank" rel="noreferrer" title="YouTube">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://discord.com/channels/@bhupendrxsingh" target="_blank" rel="noreferrer" title="Discord">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          </a>
        </div>

        <ConnectButton showBalance={false} />
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* IDENTITY SECTION */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>WEB3 IDENTITY & ROYALTIES</span>
            {workflowStep >= 2 && (
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                Verified Dojang Builder
              </span>
            )}
          </div>

          {isRegistered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070d19', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Bound UP.ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '15px', color: '#38bdf8', fontWeight: 'bold' }}>@{upId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070d19', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Dojang Royalty Earned</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#34d399', fontWeight: 'bold', margin: '2px 0 0 0' }}>+{royaltyEarned.toFixed(6)} TEST</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Register Unique @UP.ID"
                value={inputUpId}
                onChange={(e) => setInputUpId(e.target.value)}
                disabled={!isConnected}
                style={{ flex: 1, backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button
                onClick={handleRegisterIdentity}
                disabled={!isConnected || !inputUpId.trim()}
                style={{ backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Bind ID
              </button>
            </div>
          )}
        </section>

        {/* WORKFLOW */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>BUILDER ONBOARDING WORKFLOW</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070d19', padding: '12px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>1. Create UP.ID & Wallet</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Binds identity to wallet</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(1)}
                disabled={!isConnected || !isRegistered}
                style={{ backgroundColor: workflowStep >= 1 ? '#059669' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || !isRegistered) ? 0.4 : 1 }}
              >
                {workflowStep >= 1 ? 'Done ✓' : 'Run'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070d19', padding: '12px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>2. Execute Practice Tx</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Count: {practiceTxCount} practice txns</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(2)}
                disabled={!isConnected || isPending}
                style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || isPending) ? 0.4 : 1 }}
              >
                {isPending ? 'Signing...' : 'Run'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070d19', padding: '12px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>3. Issue Dojang Stamp</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Marks onboarding completed</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(3)}
                disabled={!isConnected || practiceTxCount === 0}
                style={{ backgroundColor: workflowStep >= 2 ? '#059669' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || practiceTxCount === 0) ? 0.4 : 1 }}
              >
                {workflowStep >= 2 ? 'Issued ✓' : 'Run'}
              </button>
            </div>

          </div>
        </section>

        {/* WEB3 UPI PAYMENTS & FX CALCULATOR */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1e2d4a', paddingBottom: '10px', marginBottom: '14px', gap: '8px' }}>
            <button onClick={() => setActiveTab('pay')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'pay' ? '#0284c7' : 'transparent', color: activeTab === 'pay' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Web3 UPI Pay</button>
            <button onClick={() => setActiveTab('request')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'request' ? '#0284c7' : 'transparent', color: activeTab === 'request' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>QR Invoice</button>
            <button onClick={() => setActiveTab('fx')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'fx' ? '#0284c7' : 'transparent', color: activeTab === 'fx' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>INR ⇄ KRW</button>
          </div>

          {activeTab === 'pay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Send to @UP.ID or 0x Wallet" value={payRecipient} onChange={(e) => setPayRecipient(e.target.value)} style={{ backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '13px', outline: 'none' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Amount (TEST)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={{ width: '110px', backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                <button onClick={handleWeb3Pay} disabled={!isConnected || isPending || !payRecipient} style={{ flex: 1, backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                  {isPending ? 'Processing...' : 'Pay via Web3 UPI'}
                </button>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0 0', textAlign: 'center' }}>≈ ₹{inrValue} INR | ₩{krwValue} KRW (0.5% Cashback Included)</p>
            </div>
          )}

          {activeTab === 'request' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
              <input type="text" placeholder="Request Amount (TEST)" value={reqAmount} onChange={(e) => setReqAmount(e.target.value)} style={{ width: '100%', backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '12px', outline: 'none' }} />
              <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '12px' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(address ? `${address}?amount=${reqAmount}` : 'giwasetu')}`} alt="Payment QR" style={{ width: '120px', height: '120px', display: 'block' }} />
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Scan QR to pay <strong>{reqAmount} TEST</strong> to {isRegistered ? `@${upId}` : 'Wallet'}</p>
            </div>
          )}

          {activeTab === 'fx' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ backgroundColor: '#070d19', padding: '10px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>🇮🇳 INDIA RATE</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', margin: '2px 0 0 0' }}>₹120 / TEST</p>
                </div>
                <div style={{ backgroundColor: '#070d19', padding: '10px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>🇰🇷 KOREA RATE</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#818cf8', margin: '2px 0 0 0' }}>₩1,900 / TEST</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#070d19', padding: '12px', borderRadius: '12px', border: '1px solid #1e2d4a', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8' }}>LIVE CROSS-BORDER CALCULATOR</span>
                
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Amount in TEST Token</label>
                  <input
                    type="number"
                    value={fxTestAmount}
                    onChange={(e) => handleTestChange(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#0d1527', border: '1px solid #1e2d4a', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Value in INR (₹)</label>
                    <input
                      type="number"
                      value={fxInrAmount}
                      onChange={(e) => handleInrChange(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0d1527', border: '1px solid #1e2d4a', borderRadius: '8px', padding: '8px', color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Value in KRW (₩)</label>
                    <input
                      type="number"
                      value={fxKrwAmount}
                      onChange={(e) => handleKrwChange(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#0d1527', border: '1px solid #1e2d4a', borderRadius: '8px', padding: '8px', color: '#818cf8', fontWeight: 'bold', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* FAUCETS */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.5)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="https://faucet.lambda256.io" target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>Primary Faucet ↗</a>
            <a href="https://sepolia-faucet.giwa.io" target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#1e293b', color: '#cbd5e1', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #334155' }}>Backup Faucet ↗</a>
          </div>
        </section>

        {/* ACTIVITY LOG */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>CROSS-BORDER ACTIVITY LOG</span>
            {txHistory.length > 0 && (
              <button onClick={downloadCSVReport} style={{ backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                Download CSV ⬇
              </button>
            )}
          </div>
          {txHistory.length === 0 ? (
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>No transactions recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {txHistory.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070d19', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e2d4a' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0, color: '#34d399' }}>{item.type}</p>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{item.timestamp} • {item.amount}</p>
                  </div>
                  <a href={`https://sepolia-explorer.giwa.io/tx/${item.hash}`} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace', textDecoration: 'none' }}>View ↗</a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
        <p style={{ margin: 0 }}>GIWASETU — Korea 🇰🇷 ⇄ 🇮🇳 India Web3 Protocol</p>
        {balanceData && <p style={{ fontFamily: 'monospace', margin: '4px 0 0 0', color: '#94a3b8' }}>Balance: {balanceData.formatted.slice(0, 6)} {balanceData.symbol}</p>}
      </footer>
    </div>
  );
}
