import React, { useState } from 'react'

interface Recipient {
  id: string
  address: string
  amount: string
}

export default function ArcBatchPayroll() {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', address: '', amount: '' }
  ])

  const addRow = () => {
    setRecipients([...recipients, { id: Date.now().toString(), address: '', amount: '' }])
  }

  const updateRow = (id: string, field: 'address' | 'amount', value: string) => {
    setRecipients(recipients.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const removeRow = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id))
    }
  }

  const totalAmount = recipients.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  return (
    <div className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-slate-100 my-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block">
            batch payroll & multisplit
          </span>
          <span className="text-[10px] text-slate-400">corporate usdc distribution</span>
        </div>
        <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/60">
          b2b utility
        </span>
      </div>

      <div className="space-y-2">
        {recipients.map((r, idx) => (
          <div key={r.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="0x... or handle"
              value={r.address}
              onChange={(e) => updateRow(r.id, 'address', e.target.value)}
              className="flex-1 bg-[#05070a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
            />
            <input
              type="number"
              placeholder="usdc"
              value={r.amount}
              onChange={(e) => updateRow(r.id, 'amount', e.target.value)}
              className="w-24 bg-[#05070a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
            />
            {recipients.length > 1 && (
              <button
                onClick={() => removeRow(r.id)}
                className="text-xs text-rose-500 hover:text-rose-400 px-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={addRow}
          className="text-xs text-purple-400 border border-purple-900/60 bg-purple-950/40 hover:bg-purple-900/40 px-3 py-1 rounded-lg"
        >
          + add recipient
        </button>
        <div className="text-xs text-slate-300">
          total: <span className="font-bold text-purple-300">{totalAmount.toFixed(2)} usdc</span>
        </div>
      </div>

      <button
        onClick={() => alert(`executing batch payout of ${totalAmount} usdc`)}
        className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs py-2 rounded-lg font-medium transition"
      >
        execute batch settlement ({recipients.length} txs)
      </button>
    </div>
  )
}
