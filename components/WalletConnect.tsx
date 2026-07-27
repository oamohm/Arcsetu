import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()

  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span>●</span>
          <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        
        {/* Network Selector (GIWA ↔ Arc) */}
        <div className="flex gap-2 mt-1">
          {chains.map((c) => (
            <button
              key={c.id}
              onClick={() => switchChain({ chainId: c.id })}
              className={`px-2 py-1 text-xs rounded transition-all ${
                chain?.id === c.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
          <button 
            onClick={() => disconnect()} 
            className="px-2 py-1 text-xs bg-red-950 text-red-400 rounded hover:bg-red-900 transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  )
}
