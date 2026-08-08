import React from 'react'
import {
  ConnectButton,
} from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { arcTestnet } from '../wagmi'

export default function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const isArcNetwork = chainId === arcTestnet.id

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <div className="flex flex-col gap-2">
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'address',
        }}
      />

      {isConnected && (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-slate-800 bg-[#05070a]">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isArcNetwork
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />

            <span className="text-[10px] text-slate-400 truncate">
              {shortAddress}
            </span>
          </div>

          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
              isArcNetwork
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}
          >
            {isArcNetwork ? 'ARC TESTNET' : 'WRONG NETWORK'}
          </span>
        </div>
      )}

      {isConnected && !isArcNetwork && (
        <button
          type="button"
          onClick={() => switchChain({ chainId: arcTestnet.id })}
          disabled={isSwitching || isConnecting}
          className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10px] font-semibold py-2 transition-all"
        >
          {isSwitching
            ? 'Switching to Arc...'
            : 'Switch to Arc Testnet'}
        </button>
      )}
    </div>
  )
}
