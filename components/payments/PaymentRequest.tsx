import React, { useState } from 'react'
import { isAddress } from 'viem'

interface PaymentRequestProps {
  onRequestCreated?: (request: {
    recipient: string
    amount: string
    memo: string
  }) => void
}

export default function PaymentRequest({
  onRequestCreated,
}: PaymentRequestProps) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')
  const [message, setMessage] = useState('')

  const createRequest = () => {
    setMessage('')

    if (!recipient) {
      setMessage('Please enter a wallet address.')
      return
    }

    if (!isAddress(recipient)) {
      setMessage('Invalid wallet address.')
      return
    }

    const numericAmount = Number(amount)

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage('Enter a valid payment amount.')
      return
    }

    const request = {
      recipient,
      amount,
      memo: memo.trim(),
    }

    onRequestCreated?.(request)

    setMessage('Payment request created successfully.')
  }

  return (
    <section className="arc-card">
      <div className="arc-card-header">
        <div>
          <p className="arc-label">ARCSETU PAYMENTS</p>
          <h2>Payment Request</h2>
        </div>

        <span className="arc-status online">
          Ready
        </span>
      </div>

      <div className="arc-form">
        <label>
          Recipient Wallet
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>

        <label>
          Memo
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Optional payment description"
            maxLength={120}
          />
        </label>

        <button
          type="button"
          onClick={createRequest}
          className="arc-primary-button"
        >
          Create Payment Request
        </button>

        {message && (
          <div className="arc-message">
            {message}
          </div>
        )}
      </div>
    </section>
  )
}
