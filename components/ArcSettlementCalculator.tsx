import React, { useState } from 'react'

export default function ArcSettlementCalculator() {
  const [amount, setAmount] = useState('100')
  const [transfers, setTransfers] = useState('5')

  const numAmount = Number(amount) || 0
  const numTransfers = Number(transfers) || 0

  const estimatedFee = (numTransfers * 0.001).toFixed(3)
  const totalVolume = (numAmount * numTransfers).toFixed(2)

  return (
    <div className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-slate-100 my-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
          arc settlement calculator
        </span>
        <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/60">
          utility
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <label className="text-slate-400 text-[10px] block mb-1">amount per tx (usdc)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#05070a] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-[10px] block mb-1">batch transfers</label>
          <input
            type="number"
            value={transfers}
            onChange={(e) => setTransfers(e.target.value)}
            className="w-full bg-[#05070a] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-[#05070a] p-2.5 rounded-lg border border-slate-800/80 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">total volume:</span>
          <span className="text-slate-200 font-bold">{totalVolume} usdc</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">est. network fee:</span>
          <span className="text-purple-300 font-bold">{estimatedFee} usdc</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">finality speed:</span>
          <span className="text-emerald-400 font-bold">&lt; 1s</span>
        </div>
      </div>
    </div>
  )
}
