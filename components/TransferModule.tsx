import { useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export default function TransferModule() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.1');

  const { data: hash, isPending, sendTransaction, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSend = () => {
    if (recipient && amount) {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', marginBottom: '8px' }}>
        💸 P2P Token Transfer (Send TEST)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Recipient Address (0x...)" 
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Amount (TEST)" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
          />
          <button 
            onClick={handleSend}
            disabled={isPending || isConfirming || !recipient}
            style={{ flex: 1, backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', opacity: recipient ? 1 : 0.5 }}
          >
            {isPending || isConfirming ? 'Sending...' : 'Send TEST Tokens'}
          </button>
        </div>
      </div>

      {isSuccess && (
        <div style={{ fontSize: '11px', color: '#15803D', marginTop: '6px', fontWeight: 600 }}>
          ✓ Transfer Successful! Hash: {hash?.slice(0, 10)}...
        </div>
      )}
      {error && (
        <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '6px' }}>
          Transaction failed. Check balance or address.
        </div>
      )}
    </div>
  );
}
