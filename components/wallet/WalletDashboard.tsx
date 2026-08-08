import React from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'

const ARC_TESTNET_CHAIN_ID = 5042002

export default function WalletDashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const { data: balance, isLoading } = useBalance({
    address,
  })

  if (!isConnected) {
    return (
      <section className="arc-card">
        <div className="arc-card-header">
          <h2>Wallet Dashboard</h2>
          <span className="arc-status offline">Disconnected</span>
        </div>

        <p className="arc-muted">
          Connect your wallet to access your Arc financial dashboard.
        </p>
      </section>
    )
  }

  const isArcNetwork = chainId === ARC_TESTNET_CHAIN_ID

  return (
    <section className="arc-card">
      <div className="arc-card-header">
        <div>
          <p className="arc-label">ARCSETU WALLET</p>
          <h2>Financial Dashboard</h2>
        </div>

        <span
          className={`arc-status ${
            isArcNetwork ? 'online' : 'warning'
          }`}
        >
          {isArcNetwork ? 'Arc Connected' : 'Wrong Network'}
        </span>
      </div>

      <div className="arc-wallet-address">
        <span>Wallet</span>

        <code>
          {address
            ? `${address.slice(0, 8)}...${address.slice(-6)}`
            : '--'}
        </code>
      </div>

      <div className="arc-balance-box">
        <p className="arc-label">Native Balance</p>

        {isLoading ? (
          <p className="arc-balance">Loading...</p>
        ) : (
          <p className="arc-balance">
            {balance
              ? Number(balance.formatted).toFixed(4)
              : '0.0000'}{' '}
            {balance?.symbol || 'USDC'}
          </p>
        )}
      </div>

      <div className="arc-network-grid">
        <div>
          <span>Network</span>
          <strong>
            {isArcNetwork ? 'Arc Testnet' : 'Unsupported'}
          </strong>
        </div>

        <div>
          <span>Chain ID</span>
          <strong>{chainId}</strong>
        </div>
      </div>

      {!isArcNetwork && (
        <div className="arc-warning-box">
          Please switch your wallet to Arc Network before
          performing transactions.
        </div>
      )}
    </section>
  )
}
