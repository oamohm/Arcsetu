import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = "0xbABcB2540639b071b4fDF570a8E7c54b5899384c";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  const [upId, setUpId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const [workflowStep, setWorkflowStep] = useState(0);
  const [practiceTxCount, setPracticeTxCount] = useState(0);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.1');

  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConnected && address) {
      const savedUpId = localStorage.getItem(`upid_${address.toLowerCase()}`);
      if (savedUpId) {
        setUpId(savedUpId);
        setIsRegistered(true);
      } else {
        setUpId('');
        setIsRegistered(false);
      }

      const savedStep = localStorage.getItem(`step_${address.toLowerCase()}`);
      const savedTxCount = localStorage.getItem(`txs_${address.toLowerCase()}`);
      if (savedStep) setWorkflowStep(parseInt(savedStep));
      if (savedTxCount) setPracticeTxCount(parseInt(savedTxCount));
    } else {
      setUpId('');
      setIsRegistered(false);
      setWorkflowStep(0);
      setPracticeTxCount(0);
    }
  }, [address, isConnected]);

  const handleSaveUpId = () => {
    if (!upId.trim() || !address) return;
    localStorage.setItem(`upid_${address.toLowerCase()}`, upId.trim());
    setIsRegistered(true);
  };

  const handleWorkflowRun = (stepNumber: number) => {
    if (!address) return;
    if (stepNumber === 1 && workflowStep < 1) {
      setWorkflowStep(1);
      localStorage.setItem(`step_${address.toLowerCase()}`, '1');
    } else if (stepNumber === 2) {
      const newCount = practiceTxCount + 1;
      setPracticeTxCount(newCount);
      localStorage.setItem(`txs_${address.toLowerCase()}`, newCount.toString());
    } else if (stepNumber === 3 && practiceTxCount > 0) {
      setWorkflowStep(2);
      localStorage.setItem(`step_${address.toLowerCase()}`, '2');
    }
  };

  const handleSendTokens = () => {
    if (!recipient || !amount) return;
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>GIWASETU</h1>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>GASOK Builder Onboarding Hub</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* FAUCETS */}
        <section style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginTop: 0, marginBottom: '12px' }}>
            GIWA Testnet Faucets
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="https://faucet.lambda256.io"
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center' }}
            >
              Primary Faucet (10 TEST)
            </a>
            <a
              href="https://sepolia-faucet.giwa.io"
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, backgroundColor: '#334155', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center' }}
            >
              Backup Faucet
            </a>
          </div>
        </section>

        {/* UP.ID */}
        <section style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginTop: 0, marginBottom: '12px' }}>
            User Identity (UP.ID)
          </h2>
          {isRegistered ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#7dd3fc', fontWeight: 'bold' }}>@{upId}</span>
              <span style={{ fontSize: '11px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                Bound to Wallet
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter UP.ID / Username"
                value={upId}
                onChange={(e) => setUpId(e.target.value)}
                disabled={!isConnected}
                style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px' }}
              />
              <button
                onClick={handleSaveUpId}
                disabled={!isConnected || !upId.trim()}
                style={{ backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', opacity: (!isConnected || !upId.trim()) ? 0.5 : 1 }}
              >
                Save
              </button>
            </div>
          )}
        </section>

        {/* PROGRESS */}
        <section style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginTop: 0, marginBottom: '12px' }}>
            Your Onboarding Progress
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>UP.ID Step</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0', color: workflowStep >= 1 ? '#34d399' : '#fff' }}>
                {workflowStep >= 1 ? '✓' : '-'}
              </p>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Practice Txns</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{practiceTxCount}</p>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Dojang Issued</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0', color: workflowStep >= 2 ? '#34d399' : '#fff' }}>
                {workflowStep >= 2 ? '✓' : '-'}
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginTop: 0, marginBottom: '12px' }}>
            Interactive Workflow
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>1. Create UP.ID & Wallet</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Registers wallet on-chain</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(1)}
                disabled={!isConnected || !isRegistered}
                style={{ backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || !isRegistered) ? 0.5 : 1 }}
              >
                Run
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>2. Execute Practice Tx</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Logs practice transaction</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(2)}
                disabled={!isConnected || workflowStep < 1}
                style={{ backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || workflowStep < 1) ? 0.5 : 1 }}
              >
                Run
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>3. Issue Dojang Stamp</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Marks onboarding completed</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(3)}
                disabled={!isConnected || practiceTxCount === 0}
                style={{ backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!isConnected || practiceTxCount === 0) ? 0.5 : 1 }}
              >
                Run
              </button>
            </div>
          </div>
        </section>

        {/* P2P TRANSFER */}
        <section style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginTop: 0, marginBottom: '12px' }}>
            P2P Token Transfer (Send TEST)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Recipient Address (0x...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', fontFamily: 'monospace' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '80px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px' }}
              />
              <button
                onClick={handleSendTokens}
                disabled={!isConnected || isPending || !recipient}
                style={{ flex: 1, backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', opacity: (!isConnected || isPending || !recipient) ? 0.5 : 1 }}
              >
                {isPending ? 'Sending...' : 'Send TEST Tokens'}
              </button>
            </div>
            {isConfirmed && (
              <p style={{ fontSize: '11px', color: '#34d399', textAlign: 'center', fontFamily: 'monospace', margin: '4px 0 0 0' }}>
                Tx Confirmed: {hash?.slice(0, 10)}...{hash?.slice(-8)}
              </p>
            )}
          </div>
        </section>

        {/* CONTRACT INFO */}
        <section style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px', color: '#94a3b8' }}>
          <p style={{ fontWeight: 'bold', color: '#cbd5e1', margin: 0 }}>Contract Details</p>
          <p style={{ fontFamily: 'monospace', margin: '4px 0' }}>{CONTRACT_ADDRESS}</p>
          <a
            href={`https://sepolia-explorer.giwa.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#38bdf8', textDecoration: 'none' }}
          >
            View on GIWA Explorer
          </a>
        </section>
      </main>

      <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
        <p style={{ margin: 0 }}>GIWASETU — Built for GIWA GASOK Builder Program.</p>
        {balanceData && <p style={{ fontFamily: 'monospace', margin: '4px 0 0 0' }}>Native Balance: {balanceData.formatted.slice(0, 8)} {balanceData.symbol}</p>}
      </footer>
    </div>
  );
}
