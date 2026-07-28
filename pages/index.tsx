import React, { useState } from 'react';
import { useAccount, useSwitchChain, useBalance, useSendTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

const SUPPORTED_NETWORKS = [
  { id: 999, name: 'GIWA L2 (Default)', symbol: 'GIWA', default: true, explorer: 'https://sepolia-explorer.giwa.io' },
  { id: 5042002, name: 'Arc Testnet', symbol: 'USDC', default: false, explorer: 'https://testnet.arc.network' },
  { id: 1, name: 'Ethereum L1', symbol: 'ETH', default: false, explorer: 'https://etherscan.io' },
  { id: 137, name: 'Polygon', symbol: 'POL', default: false, explorer: 'https://polygonscan.com' },
];

export default function Home() {
  const { address, chainId, isConnected } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const [selectedNetwork, setSelectedNetwork] = useState(SUPPORTED_NETWORKS[0].id);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [customId, setCustomId] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  const { data: balance } = useBalance({ address, chainId: selectedNetwork });
  const { sendTransaction } = useSendTransaction();

  const addActivityLog = (title: string, amt: string, hash: string, explorerUrl: string) => {
    const newLog = {
      id: Date.now(),
      title,
      amount: amt,
      timestamp: new Date().toLocaleTimeString(),
      txHash: hash,
      explorerUrl,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleNetworkChange = (id: number) => {
    setSelectedNetwork(id);
    const targetChain = chains.find(c => c.id === id);
    if (targetChain) {
      switchChain({ chainId: id });
    }
    addActivityLog('Network Switch', `ID: ${id}`, '0xSync...', SUPPORTED_NETWORKS.find(n => n.id === id)?.explorer || '#');
  };

  const handleUPIPayment = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }
    try {
      sendTransaction(
        {
          to: recipient as `0x${string}`,
          value: parseUnits(amount || '0', 6),
        },
        {
          onSuccess: (hash) => {
            const activeExp = SUPPORTED_NETWORKS.find(n => n.id === selectedNetwork)?.explorer || 'https://etherscan.io';
            addActivityLog('Multi-Chain UPI Pay', `${amount} USDC`, hash, `${activeExp}/tx/${hash}`);
          },
        }
      );
    } catch (error: any) {
      console.error('Payment execution error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0e131f] p-5 rounded-2xl border border-slate-800 gap-4 shadow-xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              GIWASETU MULTI-CHAIN <span className="text-xs bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/30">Hub v2.4</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">KR / JP / IN Multi-Chain Web3 Settlement & Payment Infrastructure</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
              {isConnected ? `${address?.substring(0, 6)}...${address?.substring(38)}` : 'Wallet Not Connected'}
            </span>
          </div>
        </header>

        {/* Identity & Live Balance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0e131f] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Universal Multi-Chain Identity</h2>
            <input
              type="text"
              placeholder="Set custom handle (e.g. @bhupendra)"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              className="w-full p-3 bg-[#07090e] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              onClick={() => addActivityLog('Identity Bound', customId || '@anonymous', '0xID...', '#')}
              className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium rounded-xl border border-purple-500/30 transition-all"
            >
              Claim Universal Handle
            </button>
          </div>

          <div className="bg-[#0e131f] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Network Balance</h2>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {balance ? `${formatUnits(balance.value, balance.decimals).slice(0, 8)} ${balance.symbol}` : '0.0000 USDC'}
              </div>
            </div>
            <p className="text-xs text-slate-500">Live asset synchronization active across selected chain.</p>
          </div>
        </div>

        {/* Global Assets & Networks Switcher */}
        <section className="bg-[#0e131f] p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Assets & Networks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SUPPORTED_NETWORKS.map((net) => (
              <button
                key={net.id}
                onClick={() => handleNetworkChange(net.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedNetwork === net.id 
                    ? 'bg-purple-900/30 border-purple-500 text-white shadow-lg shadow-purple-950/50' 
                    : 'bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{net.name}</div>
                <div className="text-xs font-bold text-purple-400 mt-1 font-mono">
                  {selectedNetwork === net.id && balance 
                    ? `${formatUnits(balance.value, balance.decimals).slice(0, 6)} ${balance.symbol}` 
                    : 'Active / Sync'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Multi-Chain UPI Pay Interface */}
        <section className="bg-[#0e131f] p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Multi-Chain UPI Pay & Settlement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Send to @UP_ID or 0x Wallet / Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-3.5 bg-[#07090e] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
            />
            <input
              type="number"
              placeholder="Amount (USDC / Native)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3.5 bg-[#07090e] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <button
            onClick={handleUPIPayment}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all text-sm shadow-lg shadow-purple-600/20"
          >
            Pay via Multi-Chain UPI (USDC)
          </button>
        </section>

        {/* Cross-Chain Activity & Verification Log */}
        <section className="bg-[#0e131f] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cross-Chain Activity & Verification Log</h2>
            {logs.length > 0 && (
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-400 hover:text-white bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/50 transition-colors"
              >
                Clear Logs
              </button>
            )}
          </div>
          <div className="bg-[#07090e] p-4 rounded-xl border border-slate-900 h-40 overflow-y-auto font-mono text-xs space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-10">Connect wallet and execute transactions to view multi-chain history and verification logs...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-[#0e131f] p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                  <div>
                    <p className="text-emerald-400 font-medium">{log.title}: {log.amount}</p>
                    <p className="text-[10px] text-slate-500">{log.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <a
                      href={log.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:underline text-[10px] block"
                    >
                      Verify Tx ({log.txHash.substring(0, 8)}...)
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
