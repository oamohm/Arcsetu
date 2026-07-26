import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';

const CONTRACT_ADDRESS = '0x8FD289D9644cF84C4298ebf30Ad6Ef3A15E2135F';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [levelInput, setLevelInput] = useState('1');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: balanceData } = useBalance({ address });

  const { data: currentLevel, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [{ name: '', type: 'address' }],
        name: 'userProgress',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'userProgress',
    args: address ? [address] : undefined,
  });

  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleUpdate = () => {
    if (!levelInput) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [
        {
          inputs: [{ name: '_level', type: 'uint256' }],
          name: 'setProgress',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'setProgress',
      args: [BigInt(levelInput)],
      gas: 150000n,
    });
  };

  if (!mounted) return null;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#fff', backgroundColor: '#0d1117', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>GiwaSetu</h2>
        <ConnectButton />
      </header>

      {isConnected && address ? (
        <section style={{ backgroundColor: '#161b22', padding: '1.5rem', borderRadius: '8px', border: '1px solid #30363d' }}>
          <h3>Account State</h3>
          <p><strong>Wallet:</strong> {address}</p>
          <p><strong>Native Balance:</strong> {balanceData ? `${formatEther(balanceData.value)} ${balanceData.symbol}` : 'Loading...'}</p>
          <p><strong>Current On-chain Level:</strong> {currentLevel !== undefined ? currentLevel.toString() : '0'}</p>

          <hr style={{ borderColor: '#30363d', margin: '1.5rem 0' }} />

          <h3>Update Level</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="number" 
              value={levelInput} 
              onChange={(e) => setLevelInput(e.target.value)}
              style={{ padding: '0.5rem', backgroundColor: '#0d1117', color: '#fff', border: '1px solid #30363d', borderRadius: '4px' }}
            />
            <button 
              onClick={handleUpdate} 
              disabled={isPending || isConfirming}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : 'Update On-chain'}
            </button>
          </div>

          {hash && (
            <p style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
              <strong>Tx Hash:</strong>{' '}
              <a 
                href={`https://sepolia-explorer.giwa.io/tx/${hash}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#58a6ff' }}
              >
                {hash}
              </a>
            </p>
          )}

          {isSuccess && <p style={{ color: '#3fb950' }}>Transaction verified on GIWA Explorer. Level updated.</p>}
          {writeError && <p style={{ color: '#f85149' }}>Error: {writeError.message}</p>}
        </section>
      ) : (
        <p>Connect wallet to inspect balance and execute transactions.</p>
      )}
    </main>
  );
}
