import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';

import FaucetModule from '../components/FaucetModule';
import TransferModule from '../components/TransferModule';

const CONTRACT_ADDRESS = '0xbABcB2540639b071b4fDF570a8E7c54b5899384c';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  const [txLogs, setTxLogs] = useState<{ label: string; hash: string }[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [savedUsername, setSavedUsername] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (address && typeof window !== 'undefined') {
      const storedName = localStorage.getItem(`giwa_user_${address}`);
      if (storedName) setSavedUsername(storedName);
      else setSavedUsername('');
    }
  }, [address]);

  const { data: balanceData } = useBalance({ address });

  const { data: userProgressData, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [{ name: '', type: 'address' }],
        name: 'progress',
        outputs: [
          { name: 'hasWallet', type: 'bool' },
          { name: 'completedOnboarding', type: 'bool' },
          { name: 'practiceTxCount', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'progress',
    args: address ? [address] : undefined,
  });

  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash) {
      refetch();
      if (activeAction) {
        setTxLogs((prev) => [{ label: activeAction, hash }, ...prev]);
        setActiveAction(null);
      }
    }
  }, [isSuccess, hash, refetch, activeAction]);

  const handleSaveUser = () => {
    if (usernameInput.trim() && address && typeof window !== 'undefined') {
      const cleanName = usernameInput.trim();
      localStorage.setItem(`giwa_user_${address}`, cleanName);
      setSavedUsername(cleanName);
      setUsernameInput('');
    }
  };

  const runStep = (fnName: string, label: string) => {
    setActiveAction(label);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [
        {
          inputs: [],
          name: fnName,
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: fnName,
    });
  };

  if (!mounted) return null;

  const userProgressArray = Array.isArray(userProgressData) ? userProgressData : null;
  const hasWallet = userProgressArray ? Boolean(userProgressArray[0]) : false;
  const completedOnboarding = userProgressArray ? Boolean(userProgressArray[1]) : false;
  const practiceTxCount = userProgressArray && userProgressArray[2] !== undefined ? String(userProgressArray[2]) : '0';

  return (
    <div style={{ backgroundColor: '#131B27', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#FFFFFF', color: '#1F2937', minHeight: '100vh', boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}>
        
        <header style={{ backgroundColor: '#1F2937', color: '#FFFFFF', padding: '24px 22px 18px' }}>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>GIWASETU</div>
          <div style={{ fontSize: '12px', color: '#F3D9B1', marginTop: '4px' }}>GASOK Builder Onboarding Hub</div>
        </header>

        <div style={{ backgroundColor: '#1F2937', padding: '0 22px 18px', display: 'flex', justifyContent: 'center' }}>
          <ConnectButton />
        </div>

        <main style={{ padding: '22px' }}>
          <FaucetModule />

          {/* User Identity Section */}
          <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #F3D9B1', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: '6px' }}>
              User Identity (UP.ID)
            </div>
            {savedUsername ? (
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                Builder Tag: <span style={{ color: '#0F766E' }}>@{savedUsername}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input 
                  type="text" 
                  placeholder="Enter UP.ID / Username" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px' }}
                />
                <button 
                  onClick={handleSaveUser}
                  style={{ padding: '8px 14px', backgroundColor: '#0F766E', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: '10px' }}>
            Your Onboarding Progress
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{hasWallet ? '✓' : '–'}</div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>UP.ID Step</div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{practiceTxCount}</div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>Practice Txns</div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{completedOnboarding ? '✓' : '–'}</div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>Dojang Issued</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: '10px' }}>
            Interactive Workflow
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: hasWallet ? '#F0FDFA' : '#FFFFFF', border: hasWallet ? '1px solid #0F766E' : '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: hasWallet ? '#0F766E' : '#E5E7EB', color: hasWallet ? '#FFFFFF' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>1</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Create UP.ID & Wallet</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Registers wallet on-chain</div>
              </div>
              <button onClick={() => runStep('markWalletCreated', 'UP.ID Wallet Created')} disabled={!isConnected || isPending || isConfirming} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#1F2937', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, opacity: isConnected ? 1 : 0.4 }}>Run</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: Number(practiceTxCount) > 0 ? '#F0FDFA' : '#FFFFFF', border: Number(practiceTxCount) > 0 ? '1px solid #0F766E' : '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: Number(practiceTxCount) > 0 ? '#0F766E' : '#E5E7EB', color: Number(practiceTxCount) > 0 ? '#FFFFFF' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Execute Practice Tx</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Logs practice transaction</div>
              </div>
              <button onClick={() => runStep('recordPracticeTransaction', 'Practice Transaction Executed')} disabled={!isConnected || isPending || isConfirming} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#1F2937', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, opacity: isConnected ? 1 : 0.4 }}>Run</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: completedOnboarding ? '#F0FDFA' : '#FFFFFF', border: completedOnboarding ? '1px solid #0F766E' : '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: completedOnboarding ? '#0F766E' : '#E5E7EB', color: completedOnboarding ? '#FFFFFF' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>3</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Issue Dojang Stamp</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Marks onboarding completed</div>
              </div>
              <button onClick={() => runStep('completeOnboarding', 'Dojang Issued')} disabled={!isConnected || isPending || isConfirming} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#1F2937', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, opacity: isConnected ? 1 : 0.4 }}>Run</button>
            </div>
          </div>

          <TransferModule />

          {(isPending || isConfirming) && (
            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #F3D9B1', color: '#C2410C', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
              Signing transaction in wallet...
            </div>
          )}

          {writeError && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px', wordBreak: 'break-all' }}>
              {writeError.message.slice(0, 100)}...
            </div>
          )}

          <div style={{ backgroundColor: '#FFF7ED', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Contract Details</div>
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
              Address: 0xbABc...384c<br />
              <a href={`https://sepolia-explorer.giwa.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: '#0F766E', fontWeight: 600 }}>
                View on GIWA Explorer
              </a>
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: '10px' }}>
            Recent Activity
          </div>
          <div>
            {txLogs.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#6B7280' }}>No transactions yet in this session.</div>
            ) : (
              txLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '8px', fontSize: '12px' }}>
                  <span>{log.label}</span>
                  <a href={`https://sepolia-explorer.giwa.io/tx/${log.hash}`} target="_blank" rel="noreferrer" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: 600 }}>
                    View on Explorer
                  </a>
                </div>
              ))
            )}
          </div>
        </main>

        <footer style={{ padding: '16px 22px 30px', fontSize: '11px', color: '#6B7280', textAlign: 'center', lineHeight: 1.6 }}>
          GIWASETU — Built for GIWA GASOK Builder Program.<br />
          Native Balance: {balanceData ? `${formatEther(balanceData.value)} ${balanceData.symbol}` : '0 TEST'}
        </footer>
      </div>
    </div>
  );
}
