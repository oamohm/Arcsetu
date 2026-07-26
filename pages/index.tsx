import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';

const CONTRACT_ADDRESS = '0xbABcB2540639b071b4fDF570a8E7c54b5899384c';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: balanceData } = useBalance({ address });

  const { data: userProgress, refetch } = useReadContract({
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

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleMarkWallet = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [
        {
          inputs: [],
          name: 'markWalletCreated',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'markWalletCreated',
    });
  };

  const handleRecordTx = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [
        {
          inputs: [],
          name: 'recordPracticeTransaction',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'recordPracticeTransaction',
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

          <hr style={{ borderColor: '#30363d', margin: '1.5rem 0' }} />

          <h3>On-chain Progress</h3>
          <p><strong>Has Wallet Marked:</strong> {userProgress ? (userProgress[0] ? 'Yes' : 'No') : 'No'}</p>
          <p><strong>Completed Onboarding:</strong> {userProgress ? (userProgress[1] ? 'Yes' : 'No') : 'No'}</p>
          <p><strong>Practice Transactions:</strong> {userProgress ? userProgress[2].toString() : '0'}</p>

          <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0 1rem 0' }}>
            <button 
              onClick={handleMarkWallet} 
              disabled={isPending || isConfirming}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#238636', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Mark Wallet
            </button>

            <button 
              onClick={handleRecordTx} 
              disabled={isPending || isConfirming}
              style={{ padding: '0.6rem 1rem', backgroundColor: '#1f6beb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Record Practice Tx
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

          {isSuccess && <p style={{ color: '#3fb950' }}>Transaction verified on GIWA Explorer!</p>}
          {writeError && <p style={{ color: '#f85149' }}>Error: {writeError.message}</p>}
        </section>
      ) : (
        <p>Connect wallet to inspect balance and execute transactions.</p>
      )}
    </main>
  );
}
