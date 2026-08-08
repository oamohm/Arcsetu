import { useState } from 'react'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'

interface PaymentRequestProps {
  onRequestCreated?: (data: {
    recipient: string
    amount: string
    memo: string
  }) => void
}

export default function PaymentRequest({
  onRequestCreated,
}: PaymentRequestProps) {
  const { address, isConnected } = useAccount()

  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [status, setStatus] = useState('')

  const createRequest = () => {
    setStatus('')

    if (!isConnected || !address) {
      setStatus('Please connect your wallet first.')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setStatus('Enter a valid USDC amount.')
      return
    }

    if (!isAddress(address)) {
      setStatus('Connected wallet address is invalid.')
      return
    }

    const request = {
      recipient: address,
      amount,
      memo: memo.trim(),
    }

    onRequestCreated?.(request)

    setStatus('Payment request created successfully.')
  }

  return (
    <section className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-purple-400">
          USDC Payment Request
        </h2>

        <p className="text-[10px] text-slate-400 mt-1">
          Create a payment request using your connected Arc wallet.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] text-slate-400">
          Amount (USDC)
        </label>

        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] text-slate-400">
          Memo
        </label>

        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="What is this payment for?"
          className="w-full bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="bg-[#05070a] border border-slate-800 rounded-lg p-2.5">
        <p className="text-[9px] text-slate-500">
          Receiving wallet
        </p>

        <p className="text-[10px] text-purple-300 break-all mt-1">
          {address || 'Connect wallet'}
        </p>
      </div>

      <button
        type="button"
        onClick={createRequest}
        disabled={!isConnected}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium rounded-lg py-2 transition-all"
      >
        Create USDC Request
      </button>

      {status && (
        <div className="bg-purple-950/40 border border-purple-900/60 rounded-lg p-2">
          <p className="text-[10px] text-purple-300">
            {status}
          </p>
        </div>
      )}
    </section>
  )
}
