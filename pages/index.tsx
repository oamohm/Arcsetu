import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = "0xbABcB2540639b071b4fDF570a8E7c54b5899384c";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  const [upId, setUpId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const [workflowStep, setWorkflowStep] = useState(0);
  const [practiceTxCount, setPracticeTxCount] = useState(0);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.1');

  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConnected && address) {
      const savedUpId = localStorage.getItem(`upid_${address.toLowerCase()}`);
      if (savedUpId) {
        setUpId(savedUpId);
        setIsRegistered(true);
      } else {
        setUpId('');
        setIsRegistered(false);
      }

      const savedStep = localStorage.getItem(`step_${address.toLowerCase()}`);
      const savedTxCount = localStorage.getItem(`txs_${address.toLowerCase()}`);
      if (savedStep) setWorkflowStep(parseInt(savedStep));
      if (savedTxCount) setPracticeTxCount(parseInt(savedTxCount));
    } else {
      setUpId('');
      setIsRegistered(false);
      setWorkflowStep(0);
      setPracticeTxCount(0);
    }
  }, [address, isConnected]);

  const handleSaveUpId = () => {
    if (!upId.trim() || !address) return;
    localStorage.setItem(`upid_${address.toLowerCase()}`, upId.trim());
    setIsRegistered(true);
  };

  const handleWorkflowRun = (stepNumber: number) => {
    if (!address) return;
    if (stepNumber === 1 && workflowStep < 1) {
      setWorkflowStep(1);
      localStorage.setItem(`step_${address.toLowerCase()}`, '1');
    } else if (stepNumber === 2) {
      const newCount = practiceTxCount + 1;
      setPracticeTxCount(newCount);
      localStorage.setItem(`txs_${address.toLowerCase()}`, newCount.toString());
    } else if (stepNumber === 3 && practiceTxCount > 0) {
      setWorkflowStep(2);
      localStorage.setItem(`step_${address.toLowerCase()}`, '2');
    }
  };

  const handleSendTokens = () => {
    if (!recipient || !amount) return;
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 max-w-md mx-auto font-sans">
      <header className="border-b border-slate-800 pb-4 mb-6 text-center">
        <h1 className="text-xl font-bold tracking-tight">GIWASETU</h1>
        <p className="text-xs text-slate-400">GASOK Builder Onboarding Hub</p>
      </header>

      <main className="space-y-6">
        <section className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            GIWA Testnet Faucets
          </h2>
          <div className="flex gap-2">
            <a
              href="https://faucet.lambda256.io"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium py-2 px-3 rounded-lg text-center"
            >
              Primary Faucet (10 TEST)
            </a>
            <a
              href="https://sepolia-faucet.giwa.io"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-2 px-3 rounded-lg text-center"
            >
              Backup Faucet
            </a>
          </div>
        </section>

        <section className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            User Identity (UP.ID)
          </h2>
          {isRegistered ? (
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
              <span className="font-mono text-sm text-sky-300">@{upId}</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Bound to Wallet
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter UP.ID / Username"
                value={upId}
                onChange={(e) => setUpId(e.target.value)}
                disabled={!isConnected}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
              <button
                onClick={handleSaveUpId}
                disabled={!isConnected || !upId.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </section>

        <section className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3">
            Onboarding Progress
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
              <p className="text-slate-400">UP.ID Step</p>
              <p className="font-bold text-sm mt-1">{workflowStep >= 1 ? '✓' : '-'}</p>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
              <p className="text-slate-400">Practice Txns</p>
              <p className="font-bold text-sm mt-1">{practiceTxCount}</p>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
              <p className="text-slate-400">Dojang Issued</p>
              <p className="font-bold text-sm mt-1">{workflowStep >= 2 ? '✓' : '-'}</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3">
            Interactive Workflow
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div>
                <p className="text-sm font-medium">1. Create UP.ID & Wallet</p>
                <p className="text-xs text-slate-400">Registers wallet on-chain</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(1)}
                disabled={!isConnected || !isRegistered}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs px-3 py-1.5 rounded-md"
              >
                Run
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div>
                <p className="text-sm font-medium">2. Execute Practice Tx</p>
                <p className="text-xs text-slate-400">Logs practice transaction</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(2)}
                disabled={!isConnected || workflowStep < 1}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs px-3 py-1.5 rounded-md"
              >
                Run
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div>
                <p className="text-sm font-medium">3. Issue Dojang Stamp</p>
                <p className="text-xs text-slate-400">Marks onboarding completed</p>
              </div>
              <button
                onClick={() => handleWorkflowRun(3)}
                disabled={!isConnected || practiceTxCount === 0}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs px-3 py-1.5 rounded-md"
              >
                Run
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3">
            P2P Token Transfer (Send TEST)
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Recipient Address (0x...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 font-mono"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleSendTokens}
                disabled={!isConnected || isPending || !recipient}
                className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm py-2 rounded-lg"
              >
                {isPending ? 'Sending...' : 'Send TEST Tokens'}
              </button>
            </div>
            {isConfirmed && (
              <p className="text-xs text-emerald-400 text-center font-mono">
                Tx Confirmed: {hash?.slice(0, 10)}...{hash?.slice(-8)}
              </p>
            )}
          </div>
        </section>

        <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Contract Details</p>
          <p className="font-mono">{CONTRACT_ADDRESS}</p>
          <a
            href={`https://sepolia-explorer.giwa.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sky-400 hover:underline pt-1"
          >
            View on GIWA Explorer
          </a>
        </section>
      </main>

      <footer className="mt-8 text-center text-xs text-slate-500">
        <p>GIWASETU — Built for GIWA GASOK Builder Program.</p>
        {balanceData && <p className="mt-1 font-mono">Native Balance: {balanceData.formatted.slice(0, 8)} {balanceData.symbol}</p>}
      </footer>
    </div>
  );
}
