import { useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { isAddress, parseUnits, erc20Abi } from 'viem'

const ARC_CHAIN_ID = 5042002

// Arc Testnet USDC
const ARC_USDC_ADDRESS =
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`

const ARC_EXPLORER_TX = 'https://testnet.arcscan.app/tx/'

type TransferMode = 'usdc' | 'native'

interface TransferModuleProps {
  defaultRecipient?: string
  defaultAmount?: string
  onSuccess?: (data: {
    hash: string
    recipient: string
    amount: string
    asset: string
  }) => void
}

export default function TransferModule({
  defaultRecipient = '',
  defaultAmount = '1',
  onSuccess,
}: TransferModuleProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const {
    data: nativeBalance,
    isLoading: nativeBalanceLoading,
  } = useBalance({
    address,
  })

  const {
    data: usdcBalance,
    isLoading: usdcBalanceLoading,
  } = useBalance({
    address,
    token: ARC_USDC_ADDRESS,
  })

  const {
    writeContractAsync,
    data: txHash,
    isPending: contractPending,
    error: contractError,
  } = useWriteContract()

  const {
    isLoading: confirming,
    isSuccess: confirmed,
    isError: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const [mode, setMode] = useState<TransferMode>('usdc')
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [amount, setAmount] = useState(defaultAmount)
  const [localError, setLocalError] = useState('')
  const [successHash, setSuccessHash] = useState('')

  const isArcNetwork = chainId === ARC_CHAIN_ID
  const isBusy = contractPending || confirming

  const clearStatus = () => {
    setLocalError('')
    setSuccessHash('')
  }

  const validate = () => {
    if (!isConnected || !address) {
      return 'Please connect your wallet first.'
    }

    if (!isArcNetwork) {
      return 'Please switch your wallet to Arc Network.'
    }

    if (!recipient.trim()) {
      return 'Please enter a recipient address.'
    }

    if (!isAddress(recipient.trim())) {
      return 'Invalid recipient address.'
    }

    if (!amount.trim() || Number(amount) <= 0) {
      return 'Enter a valid amount greater than zero.'
    }

    if (!Number.isFinite(Number(amount))) {
      return 'Invalid amount.'
    }

    return ''
  }

  const handleTransfer = async () => {
    clearStatus()

    const validationError = validate()

    if (validationError) {
      setLocalError(validationError)
      return
    }

    const target = recipient.trim() as `0x${string}`

    try {
      if (mode === 'usdc') {
        /*
         * USDC uses 6 decimals.
         *
         * IMPORTANT:
         * Do NOT use parseEther() for USDC.
         */
        const value = parseUnits(amount.trim(), 6)

        const hash = await writeContractAsync({
          address: ARC_USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [target, value],
        })

        setSuccessHash(hash)

        onSuccess?.({
          hash,
          recipient: target,
          amount: amount.trim(),
          asset: 'USDC',
        })
      } else {
        /*
         * Native transfer is intentionally kept separate
         * from the USDC ERC-20 transfer.
         */
        setLocalError(
          'Native transfer is reserved for the dedicated native-asset module.'
        )
      }
    } catch (error: any) {
      const message =
        error?.shortMessage ||
        error?.message ||
        'Transaction failed or was cancelled.'

      setLocalError(message)
    }
  }

  const usdcFormatted = usdcBalance
    ? Number(usdcBalance.formatted).toFixed(4)
    : '0.0000'

  const nativeFormatted = nativeBalance
    ? Number(nativeBalance.formatted).toFixed(4)
    : '0.0000'

  return (
    <section className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="text-sm font-bold text-white">
            ArcSetu Transfer
          </h2>

          <p className="text-[10px] text-slate-500 mt-1">
            Secure on-chain USDC settlement
          </p>
        </div>

        <span
          className={`text-[9px] px-2 py-1 rounded border ${
            isArcNetwork
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }`}
        >
          {isArcNetwork ? 'ARC READY' : 'WRONG NETWORK'}
        </span>
      </div>

      {/* Asset selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('usdc')
            clearStatus()
          }}
          className={`p-3 rounded-lg border text-left transition-all ${
            mode === 'usdc'
              ? 'bg-purple-950/40 border-purple-500'
              : 'bg-[#05070a] border-slate-800'
          }`}
        >
          <p className="text-[9px] text-slate-500 uppercase">
            Asset
          </p>

          <p className="text-xs font-bold text-purple-300 mt-1">
            USDC
          </p>

          <p className="text-[9px] text-slate-500 mt-1">
            6 decimals
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('native')
            clearStatus()
          }}
          className={`p-3 rounded-lg border text-left transition-all ${
            mode === 'native'
              ? 'bg-indigo-950/40 border-indigo-500'
              : 'bg-[#05070a] border-slate-800'
          }`}
        >
          <p className="text-[9px] text-slate-500 uppercase">
            Asset
          </p>

          <p className="text-xs font-bold text-indigo-300 mt-1">
            Native
          </p>

          <p className="text-[9px] text-slate-500 mt-1">
            Gas asset
          </p>
        </button>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#05070a] border border-slate-800 rounded-lg p-2.5">
          <p className="text-[9px] text-slate-600 uppercase">
            USDC Balance
          </p>

          <p className="text-xs font-bold text-emerald-400 mt-1">
            {usdcBalanceLoading ? 'Loading...' : `${usdcFormatted} USDC`}
          </p>
        </div>

        <div className="bg-[#05070a] border border-slate-800 rounded-lg p-2.5">
          <p className="text-[9px] text-slate-600 uppercase">
            Native Balance
          </p>

          <p className="text-xs font-bold text-indigo-400 mt-1">
            {nativeBalanceLoading
              ? 'Loading...'
              : `${nativeFormatted} ${nativeBalance?.symbol || ''}`}
          </p>
        </div>
      </div>

      {/* Recipient */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-500">
          Recipient wallet
        </label>

        <input
          type="text"
          value={recipient}
          onChange={(e) => {
            setRecipient(e.target.value)
            clearStatus()
          }}
          placeholder="0x..."
          disabled={isBusy}
          className="w-full bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />

        {recipient && isAddress(recipient.trim()) && (
          <p className="text-[9px] text-emerald-400">
            Valid wallet address ✓
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-500">
          Amount
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.000001"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              clearStatus()
            }}
            disabled={isBusy}
            className="flex-1 bg-[#05070a] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />

          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 flex items-center">
            <span className="text-xs text-purple-300 font-bold">
              {mode === 'usdc'
                ? 'USDC'
                : nativeBalance?.symbol || 'NATIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Network warning */}
      {!isArcNetwork && isConnected && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5">
          <p className="text-[10px] text-amber-300">
            Wallet is connected to another network.
          </p>

          <p className="text-[9px] text-amber-400/70 mt-1">
            Switch to Arc Network before sending.
          </p>
        </div>
      )}

      {/* Error */}
      {(localError || contractError || receiptError) && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
          <p className="text-[10px] text-red-300 break-words">
            {localError ||
              contractError?.message ||
              'Transaction confirmation failed.'}
          </p>
        </div>
      )}

      {/* Pending */}
      {isBusy && (
        <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
          <p className="text-[10px] text-purple-300">
            {contractPending
              ? 'Waiting for wallet confirmation...'
              : 'Transaction submitted. Waiting for Arc confirmation...'}
          </p>

          {txHash && (
            <p className="text-[9px] text-slate-500 mt-1 break-all">
              {txHash}
            </p>
          )}
        </div>
      )}

      {/* Success */}
      {(successHash || confirmed) && !isBusy && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-emerald-400">
            Transaction confirmed ✓
          </p>

          {successHash && (
            <a
              href={`${ARC_EXPLORER_TX}${successHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-purple-400 hover:underline mt-1 block break-all"
            >
              Verify on ArcScan ↗
            </a>
          )}
        </div>
      )}

      {/* Send */}
      <button
        type="button"
        onClick={handleTransfer}
        disabled={!isConnected || !isArcNetwork || isBusy}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs py-3 rounded-lg transition-all"
      >
        {!isConnected
          ? 'Connect Wallet'
          : isBusy
            ? confirming
              ? 'Confirming...'
              : 'Waiting for Wallet...'
            : mode === 'usdc'
              ? `Send ${amount || '0'} USDC`
              : 'Native Asset'}
      </button>

      {/* Security note */}
      <div className="bg-[#05070a] border border-slate-800 rounded-lg p-2.5">
        <p className="text-[9px] text-slate-500 leading-relaxed">
          ArcSetu separates native network transfers from ERC-20 USDC
          settlement. USDC transactions use the configured Arc testnet
          USDC contract and 6-decimal precision.
        </p>
      </div>
    </section>
  )
}
