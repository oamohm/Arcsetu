import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const ARC_CHAIN_ID = 5042002

export default function WalletPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: switching } = useSwitchChain()

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
  })

  const isArcNetwork = chainId === ARC_CHAIN_ID

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  const handleSwitchToArc = () => {
    if (!switchChain) return

    switchChain({
      chainId: ARC_CHAIN_ID,
    })
  }

  return (
    <section className="bg-[#0a0d14] rounded-xl border border-purple-900/40 p-4 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-purple-400">
            Arc Wallet
          </p>

          <p className="text-[10px] text-slate-500 mt-1">
            Global settlement wallet
          </p>
        </div>

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>

      {!isConnected ? (
        <div className="bg-[#05070a] rounded-lg border border-slate-800 p-4 text-center">
          <p className="text-xs text-slate-400">
            Connect your wallet to access ArcSetu.
          </p>

          <p className="text-[10px] text-slate-600 mt-1">
            Wallet connection is required for on-chain operations.
          </p>
        </div>
      ) : (
        <>
          {/* Wallet identity */}
          <div className="bg-[#05070a] rounded-lg border border-slate-800 p-3">
            <div className="flex justify-between items-center gap-3">
              <span className="text-[10px] text-slate-500">
                Wallet
              </span>

              <span className="text-xs text-purple-300 font-mono">
                {shortAddress}
              </span>
            </div>

            <div className="flex justify-between items-center gap-3 mt-2">
              <span className="text-[10px] text-slate-500">
                Network
              </span>

              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  isArcNetwork
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}
              >
                {isArcNetwork ? 'Arc Network ✓' : `Chain ${chainId}`}
              </span>
            </div>
          </div>

          {/* Network warning */}
          {!isArcNetwork && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-300 font-medium">
                Wrong network
              </p>

              <p className="text-[10px] text-amber-400/70 mt-1">
                Switch to Arc Network before making ArcSetu transactions.
              </p>

              <button
                type="button"
                onClick={handleSwitchToArc}
                disabled={switching}
                className="mt-2 w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium rounded-lg py-2 transition-all"
              >
                {switching ? 'Switching...' : 'Switch to Arc Network'}
              </button>
            </div>
          )}

          {/* Balance */}
          <div className="bg-[#05070a] rounded-lg border border-slate-800 p-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">
                Wallet Balance
              </span>

              <span className="text-[9px] text-slate-600">
                LIVE
              </span>
            </div>

            <div className="mt-2">
              {balanceLoading ? (
                <p className="text-xs text-purple-400 animate-pulse">
                  Loading balance...
                </p>
              ) : balance ? (
                <p className="text-lg font-bold text-emerald-400">
                  {Number(balance.formatted).toFixed(4)}{' '}
                  {balance.symbol}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Balance unavailable
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#05070a] rounded-lg border border-slate-800 p-2.5">
              <p className="text-[9px] text-slate-600 uppercase">
                Connection
              </p>

              <p className="text-[10px] text-emerald-400 mt-1">
                Connected ✓
              </p>
            </div>

            <div className="bg-[#05070a] rounded-lg border border-slate-800 p-2.5">
              <p className="text-[9px] text-slate-600 uppercase">
                Arc Status
              </p>

              <p
                className={`text-[10px] mt-1 ${
                  isArcNetwork
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {isArcNetwork ? 'Ready ✓' : 'Switch Network'}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
