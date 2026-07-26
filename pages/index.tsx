import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';

const CONTRACT_ADDRESS = '0x8FD289D9644cF84C4298ebf30Ad6Ef3A15E2135F';

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "progress",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_level", "type": "uint256" }],
    "name": "setProgress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [level, setLevel] = useState<number>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read current progress from GIWA Sepolia smart contract
  const { data: currentProgress, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'progress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Write new progress level to GIWA Sepolia smart contract
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();

  // Wait for transaction confirmation on GIWA network
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  const handleUpdate = () => {
    if (!level || level < 1) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setProgress',
      args: [BigInt(level)],
    });
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid #334155' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🌉 GiwaSetu</h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>Simple Web3 Onboarding on GIWA Sepolia</p>
          </div>
          <ConnectButton />
        </header>

        {/* Main Interface */}
        <main style={{ marginTop: '2.5rem' }}>
          {!isConnected ? (
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center' }}>
              <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>Web3 में आपका स्वागत है! 👋</h2>
              <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '1rem auto 2rem auto', lineHeight: '1.6' }}>
                GIWA Sepolia टेस्टनेट पर सुरक्षित अभ्यास करें। ऊपर दिए गए <b>Connect Wallet</b> बटन पर क्लिक करके अपना वॉलेट जोड़ें।
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              
              {/* Card 1: Account Status */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.1rem' }}>👤 आपका कनेक्टेड वॉलेट</h3>
                <p style={{ margin: 0, fontFamily: 'monospace', background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '8px', wordBreak: 'break-all', color: '#e2e8f0' }}>
                  {address}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>ऑन-चेन वर्तमान प्रोग्रेस लेवल:</span>
                  <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '0.2rem 0.8rem', borderRadius: '20px', fontWeight: 'bold' }}>
                    {currentProgress !== undefined ? currentProgress.toString() : '0'}
                  </span>
                </div>
              </div>

              {/* Card 2: Interactive Contract Action */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8', fontSize: '1.1rem' }}>🚀 ऑन-चेन प्रोग्रेस अपडेट करें</h3>
                <p style={{ margin: '0 0 1.5rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  नीचे अपना नया लेवल चुनें और स्मार्ट कॉन्ट्रैक्ट (<code>{CONTRACT_ADDRESS.slice(0,6)}...{CONTRACT_ADDRESS.slice(-4)}</code>) में डेटा सेव करें।
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    style={{ backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', width: '100px' }}
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={isPending || isConfirming}
                    style={{
                      backgroundColor: isPending || isConfirming ? '#475569' : '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {isPending ? 'वॉलेट में कन्फर्म करें...' : isConfirming ? 'GIWA नेटवर्क पर सेव हो रहा है...' : 'ऑन-चेन प्रोग्रेस अपडेट करें'}
                  </button>
                </div>

                {/* Success Message */}
                {isConfirmed && (
                  <div style={{ marginTop: '1.5rem', backgroundColor: '#065f46', border: '1px solid #059669', color: '#a7f3d0', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    🎉 <b>सफलतापूर्वक ट्रांजैक्शन पूरा हुआ!</b> आपकी प्रोग्रेस GIWA Sepolia ब्लॉकचेन पर दर्ज हो गई है।
                    <br />
                    <a href={`https://sepolia-explorer.giwa.io/tx/${hash}`} target="_blank" rel="noreferrer" style={{ color: '#6ee7b7', textDecoration: 'underline', display: 'inline-block', marginTop: '0.5rem' }}>
                      GIWA Explorer पर ट्रांजैक्शन देखें ↗
                    </a>
                  </div>
                )}

                {/* Error Message */}
                {writeError && (
                  <div style={{ marginTop: '1.5rem', backgroundColor: '#881337', border: '1px solid #9f1239', color: '#fecdd3', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    ❌ ट्रांजैक्शन में त्रुटि: {writeError.message.slice(0, 120)}...
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

