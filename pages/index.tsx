import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = "0xbABcB2540639b071b4fDF570a8E7c54b5899384c";

interface TxHistory {
  hash: string;
  type: string;
  timestamp: string;
  amount: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  // Onboarding & Identity States
  const [upId, setUpId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [practiceTxCount, setPracticeTxCount] = useState(0);

  // Payments & Utility States
  const [activeTab, setActiveTab] = useState<'pay' | 'request' | 'fx'>('pay');
  const [payRecipient, setPayRecipient] = useState('');
  const [payAmount, setPayAmount] = useState('0.0001');
  const [reqAmount, setReqAmount] = useState('0.001');
  const [reqNote, setReqNote] = useState('');

  // History & Royalty
  const [txHistory, setTxHistory] = useState<TxHistory[]>([]);
  const [royaltyEarned, setRoyaltyEarned] = useState(0);

  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // 1. Data Auto-Load on Wallet Connect
  useEffect(() => {
    if (isConnected && address) {
      const cleanAddress = address.toLowerCase();

      // Load Saved UP.ID
      const savedUpId = localStorage.getItem(`upid_${cleanAddress}`);
      if (savedUpId) {
        setUpId(savedUpId);
        setIsRegistered(true);
      } else {
        setUpId('');
        setIsRegistered(false);
      }

      // Load Workflow & Practice Progress
      const savedStep = localStorage.getItem(`step_${cleanAddress}`);
      const savedTxCount = localStorage.getItem(`txs_${cleanAddress}`);
      if (savedStep) setWorkflowStep(parseInt(savedStep));
      if (savedTxCount) setPracticeTxCount(parseInt(savedTxCount));

      // Load Royalty & History
      const savedRoyalty = localStorage.getItem(`royalty_${cleanAddress}`);
      if (savedRoyalty) setRoyaltyEarned(parseFloat(savedRoyalty));

      const savedHistory = localStorage.getItem(`tx_history_${cleanAddress}`);
      if (savedHistory) setTxHistory(JSON.parse(savedHistory));
    } else {
      setUpId('');
      setIsRegistered(false);
      setWorkflowStep(0);
      setPracticeTxCount(0);
      setTxHistory([]);
      setRoyaltyEarned(0);
    }
  }, [address, isConnected]);

  // 2. Save & Bind UP.ID Logic
  const handleSaveUpId = () => {
    if (!upId.trim() || !address) return;
    const cleanAddress = address.toLowerCase();
    const cleanId = upId.trim().replace(/^@/, '');
    
    // Bind Address to ID and ID to Address in local registry
    localStorage.setItem(`upid_${cleanAddress}`, cleanId);
    localStorage.setItem(`upid_lookup_${cleanId.toLowerCase()}`, cleanAddress);
    
    setUpId(cleanId);
    setIsRegistered(true);
  };

  // 3. Workflow Steps (Run Buttons Logic)
  const handleWorkflowRun = (stepNumber: number) => {
    if (!address) return;
    const cleanAddress = address.toLowerCase();

    if (stepNumber === 1 && isRegistered) {
      setWorkflowStep(1);
      localStorage.setItem(`step_${cleanAddress}`, '1');
    } else if (stepNumber === 2 && workflowStep >= 1) {
      const newCount = practiceTxCount + 1;
      setPracticeTxCount(newCount);
      localStorage.setItem(`txs_${cleanAddress}`, newCount.toString());
    } else if (stepNumber === 3 && practiceTxCount > 0) {
      setWorkflowStep(2);
      localStorage.setItem(`step_${cleanAddress}`, '2');
    }
  };

  // 4. Web3 UPI Pay Logic (@UP.ID or 0x Direct Transfer)
  const handleWeb3Pay = () => {
    if (!payRecipient || !payAmount) return;

    let targetAddress = payRecipient.trim();

    // Resolving @username to 0x Address
    if (targetAddress.startsWith('@') || !targetAddress.startsWith('0x')) {
      const cleanLookupId = targetAddress.replace(/^@/, '').toLowerCase();
      const resolvedAddress = localStorage.getItem(`upid_lookup_${cleanLookupId}`);
      if (resolvedAddress) {
        targetAddress = resolvedAddress;
      } else {
        alert(`UP.ID @${cleanLookupId} not found. Please verify the username or use a 0x address.`);
        return;
      }
    }

    sendTransaction({
      to: targetAddress as `0x${string}`,
      value: parseEther(payAmount),
    });
  };

  // 5. On-Chain Transaction Confirmation & Cashback Royalty Update
  useEffect(() => {
    if (isConfirmed && hash && address) {
      const cleanAddress = address.toLowerCase();

      // Calculate 0.5% Royalty Cashback
      const addedRoyalty = (parseFloat(payAmount) || 0) * 0.005;
      const newRoyaltyTotal = royaltyEarned + addedRoyalty;
      setRoyaltyEarned(newRoyaltyTotal);
      localStorage.setItem(`royalty_${cleanAddress}`, newRoyaltyTotal.toString());

      const newTx: TxHistory = {
        hash,
        type: payRecipient.startsWith('@') ? `Web3 UPI Pay (${payRecipient})` : 'P2P Transfer',
        timestamp: new Date().toLocaleTimeString(),
        amount: `${payAmount} TEST`,
      };

      const updatedHistory = [newTx, ...txHistory];
      setTxHistory(updatedHistory);
      localStorage.setItem(`tx_history_${cleanAddress}`, JSON.stringify(updatedHistory));
    }
  }, [isConfirmed, hash, address]);

  // Currency Converter Values
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

      {/* HEADER WITH 3D EMBOSSED BRIDGE EMBLEM */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '20px',
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
            fontSize: '22px',
            color: '#fff'
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
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, letterSpacing: '0.5px' }}>
              KR 🇰🇷 ⇄ 🇮🇳 IN Web3 Cross-Border Hub
            </p>
          </div>
        </div>

        <ConnectButton showBalance={false} />
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* IDENTITY & ROYALTIES */}
        <section style={{
          backgroundColor: 'rgba(19, 31, 55, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>
              WEB3 IDENTITY & ROYALTIES
            </span>
            {workflowStep >= 2 && (
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                Verified Dojang Builder
              </span>
            )}
          </div>

          {isRegistered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070d19', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Your UP.ID</span>
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
                placeholder="Register @UP.ID (e.g. @bhupendra)"
                value={upId}
                onChange={(e) => setUpId(e.target.value)}
                disabled={!isConnected}
                style={{ flex: 1, backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button
                onClick={handleSaveUpId}
                disabled={!isConnected || !upId.trim()}
                style={{ backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                Save ID
              </button>
            </div>
          )}
        </section>

        {/* ONBOARDING PROGRESS & WORKFLOW (RUN BUTTONS RESTORED) */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>
            BUILDER ONBOARDING WORKFLOW
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Step 1 */}
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

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070d19', padding: '12px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>2. Execute Practice Tx</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Count: {practiceTxCount} practice txns</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(2)}
                disabled={!isConnected || workflowStep < 1}
                style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || workflowStep < 1) ? 0.4 : 1 }}
              >
                Run
              </button>
            </div>

            {/* Step 3 */}
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

        {/* WEB3 UPI PAYMENTS & UTILITIES */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1e2d4a', paddingBottom: '10px', marginBottom: '14px', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('pay')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'pay' ? '#0284c7' : 'transparent', color: activeTab === 'pay' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            >
              Web3 UPI Pay
            </button>
            <button
              onClick={() => setActiveTab('request')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'request' ? '#0284c7' : 'transparent', color: activeTab === 'request' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            >
              QR Invoice
            </button>
            <button
              onClick={() => setActiveTab('fx')}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'fx' ? '#0284c7' : 'transparent', color: activeTab === 'fx' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            >
              INR ⇄ KRW
            </button>
          </div>

          {/* TAB 1: WEB3 UPI PAYMENTS */}
          {activeTab === 'pay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Send to @UP.ID or 0x Wallet"
                value={payRecipient}
                onChange={(e) => setPayRecipient(e.target.value)}
                style={{ backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Amount (TEST)"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  style={{ width: '110px', backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
                <button
                  onClick={handleWeb3Pay}
                  disabled={!isConnected || isPending || !payRecipient}
                  style={{ flex: 1, backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  {isPending ? 'Processing...' : 'Pay via Web3 UPI'}
                </button>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0 0', textAlign: 'center' }}>
                ≈ ₹{inrValue} INR | ₩{krwValue} KRW (0.5% Cashback Included)
              </p>
            </div>
          )}

          {/* TAB 2: QR CODE INVOICING */}
          {activeTab === 'request' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
              <div style={{ width: '100%' }}>
                <input
                  type="text"
                  placeholder="Request Amount (TEST)"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '12px', outline: 'none', marginBottom: '8px' }}
                />
                <input
                  type="text"
                  placeholder="Note (e.g., API Fee / Coffee)"
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#070d19', border: '1px solid #1e2d4a', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '12px' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(address ? `${address}?amount=${reqAmount}` : 'giwasetu')}`}
                  alt="Payment QR"
                  style={{ width: '120px', height: '120px', display: 'block' }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Scan QR to pay <strong>{reqAmount} TEST</strong> to {isRegistered ? `@${upId}` : 'Wallet'}
              </p>
            </div>
          )}

          {/* TAB 3: LOCAL CURRENCY CONVERTER */}
          {activeTab === 'fx' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ backgroundColor: '#070d19', padding: '12px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>🇮🇳 INDIA (INR)</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', margin: '4px 0 0 0' }}>₹120 / TEST</p>
                </div>
                <div style={{ backgroundColor: '#070d19', padding: '12px', borderRadius: '10px', border: '1px solid #1e2d4a' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>🇰🇷 KOREA (KRW)</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#818cf8', margin: '4px 0 0 0' }}>₩1,900 / TEST</p>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: 0 }}>
                Enabling seamless trade between Ancient Ayodhya Trade Routes & Modern Seoul Tech Hubs.
              </p>
            </div>
          )}
        </section>

        {/* FAUCETS */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.5)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="https://faucet.lambda256.io"
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center' }}
            >
              Primary Faucet ↗
            </a>
            <a
              href="https://sepolia-faucet.giwa.io"
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, backgroundColor: '#1e293b', color: '#cbd5e1', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #334155' }}
            >
              Backup Faucet ↗
            </a>
          </div>
        </section>

        {/* RECENT ACTIVITY LOG */}
        <section style={{ backgroundColor: 'rgba(19, 31, 55, 0.7)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
            CROSS-BORDER ACTIVITY LOG
          </span>
          {txHistory.length === 0 ? (
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>No transactions in this session.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {txHistory.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070d19', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e2d4a' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0, color: '#34d399' }}>{item.type}</p>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{item.timestamp} • {item.amount}</p>
                  </div>
                  <a
                    href={`https://sepolia-explorer.giwa.io/tx/${item.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace', textDecoration: 'none' }}
                  >
                    View ↗
                  </a>
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
