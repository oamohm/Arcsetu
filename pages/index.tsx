import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain, useBalance, useSendTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

const SUPPORTED_NETWORKS = [
  { id: 999, name: 'GIWA L2 (Default)', symbol: 'GIWA', isDefault: true, explorer: 'https://sepolia-explorer.giwa.io' },
  { id: 5042002, name: 'Arc Testnet', symbol: 'USDC', isDefault: false, explorer: 'https://testnet.arc.network' },
  { id: 1, name: 'Ethereum L1', symbol: 'ETH', isDefault: false, explorer: 'https://etherscan.io' },
  { id: 137, name: 'Polygon', symbol: 'POL', isDefault: false, explorer: 'https://polygonscan.com' },
];

export default function MasterIndex() {
  const { address, isConnected } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const [selectedNetwork, setSelectedNetwork] = useState(SUPPORTED_NETWORKS[0].id);
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [customId, setCustomId] = useState('');
  const [activities, setActivities] = useState<any[]>([]);

  const { data: balance } = useBalance({ address, chainId: selectedNetwork });
  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    if (isConnected) {
      logActivity('system sync', 'wallet connected', '0x...', '#');
    }
  }, [isConnected]);

  const logActivity = (title: string, detail: string, hash: string, link: string) => {
    setActivities(prev => [{
      id: Date.now(),
      title,
      detail,
      time: new Date().toLocaleTimeString(),
      hash,
      link
    }, ...prev]);
  };

  const handleNetworkSwitch = (id: number) => {
    setSelectedNetwork(id);
    const target = chains.find(c => c.id === id);
    if (target && switchChain) {
      switchChain({ chainId: id });
    }
    const net = SUPPORTED_NETWORKS.find(n => n.id === id);
    logActivity('network routing', `switched to ${net?.name}`, '0xsync...', net?.explorer || '#');
  };

  const executeSettlement = async () => {
    if (!isConnected) {
      alert('connect wallet first');
      return;
    }
    if (!recipient || !amount) return;

    try {
      sendTransaction(
        {
          to: recipient as `0x${string}`,
          value: parseUnits(amount, 6),
        },
        {
          onSuccess: (hash) => {
            const exp = SUPPORTED_NETWORKS.find(n => n.id === selectedNetwork)?.explorer;
            logActivity('deterministic execution', `${amount} usdc sent`, hash, `${exp}/tx/${hash}`);
          },
        }
      );
    } catch (err: any) {
      console.error('execution failed', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-300 p-4 md:p-8 font-sans selection:bg-purple-900 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* top infrastructure header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0e131f] p-5 rounded-2xl border border-slate-800 shadow-2xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              GIWASETU MULTI-CHAIN 
              <span className="text-[10px] uppercase tracking-widest bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-sm border border-purple-500/20">
                production ready
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-mono">kr / jp / in distributed settlement network</p>
          </div>
          <div className="mt-4 md:mt-0 z-50 relative">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* identity registry */}
          <div className="bg-[#0e131f] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">universal identity</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="bind custom handle (@username)"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full p-3.5 bg-[#07090e] border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
              />
              <button
                onClick={() => logActivity('identity bound', customId, '0xid...', '#')}
                className="w-full py-3 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 text-xs font-medium rounded-lg border border-purple-800/30 transition-all"
              >
                issue on-chain handle
              </button>
            </div>
          </div>

          {/* treasury state */}
          <div className="bg-[#0e131f] p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">active treasury state</h2>
              <div className="text-3xl font-light text-white font-mono tracking-tight">
                {balance ? formatUnits(balance.value, balance.decimals).slice(0, 8) : '0.0000'} 
                <span className="text-purple-400 text-lg ml-2 font-semibold">{balance?.symbol || 'USDC'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] text-slate-500 font-mono uppercase">real-time node sync active</p>
            </div>
          </div>
        </div>

        {/* multi-chain routing engine */}
        <section className="bg-[#0e131f] p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">network routing layer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SUPPORTED_NETWORKS.map((net) => (
              <button
                key={net.id}
                onClick={() => handleNetworkSwitch(net.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  selectedNetwork === net.id 
                    ? 'bg-[#151b2b] border-purple-500/50 shadow-inner' 
                    : 'bg-[#07090e] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className={`text-xs font-semibold ${selectedNetwork === net.id ? 'text-white' : 'text-slate-400'}`}>
                  {net.name}
                </div>
                <div className="text-[11px] text-purple-400 mt-1.5 font-mono opacity-80">
                  {selectedNetwork === net.id ? 'connected' : 'standby'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* execution layer */}
        <section className="bg-[#0e131f] p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">settlement execution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="target address (0x... or @handle)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-4 bg-[#07090e] border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 font-mono"
            />
            <input
              type="number"
              placeholder="amount (usdc)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-[#07090e] border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 font-mono"
            />
          </div>
          <button
            onClick={executeSettlement}
            className="w-full py-4 bg-white text-black hover:bg-slate-200 font-semibold rounded-lg transition-all text-sm tracking-wide"
          >
            execute transaction
          </button>
        </section>

        {/* verification logs */}
        <section className="bg-[#0e131f] p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">system logs & verification</h2>
            {activities.length > 0 && (
              <button onClick={() => setActivities([])} className="text-[10px] text-slate-500 hover:text-white transition-colors">
                clear state
              </button>
            )}
          </div>
          <div className="bg-[#07090e] p-4 rounded-xl border border-slate-800/80 h-48 overflow-y-auto font-mono text-xs space-y-2">
            {activities.length === 0 ? (
              <div className="text-slate-600 text-center py-12">waiting for node execution...</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-3 bg-[#0e131f] rounded-lg border border-slate-800/50 flex justify-between items-center group">
                  <div>
                    <span className="text-emerald-400 font-medium">[{act.title}]</span>
                    <span className="text-slate-400 ml-2">{act.detail}</span>
                    <div className="text-[9px] text-slate-600 mt-1">{act.time}</div>
                  </div>
                  <a href={act.link} target="_blank" rel="noreferrer" className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                    verify →
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
