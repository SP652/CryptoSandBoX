import useStore from '../store/useStore'

function TradesHistory() {
  const transactions = useStore((state) => state.transactions)

  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
      <div className="border-b border-slate-800 px-4 py-2 text-[11px] font-medium text-slate-300">
        Trade History
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950/40 text-[10px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Symbol</th>
              <th className="px-4 py-2 text-left">Side</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Size</th>
              <th className="px-4 py-2 text-right">Notional</th>
              <th className="px-4 py-2 text-right">Fee</th>
              <th className="px-4 py-2 text-right">P&amp;L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-[11px]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-3 text-center text-slate-500">
                  No trades yet. Place an order to see fills here.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const sideColor = tx.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                const pnlColor = tx.realizedPnl
                  ? tx.realizedPnl.gt(0)
                    ? 'text-emerald-400'
                    : tx.realizedPnl.lt(0)
                    ? 'text-red-400'
                    : 'text-slate-200'
                  : 'text-slate-200'

                return (
                  <tr key={tx.id} className="hover:bg-slate-900/80">
                    <td className="px-4 py-2 text-left text-slate-300">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 text-left text-slate-200">
                      {tx.symbol}
                    </td>
                    <td className={`px-4 py-2 text-left font-semibold ${sideColor}`}>
                      {tx.side}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {`$${tx.price.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {tx.quantity.toFixed(6)}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {`$${tx.amount.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      {tx.fee ? `$${tx.fee.toFixed(4)}` : '--'}
                    </td>
                    <td className={`px-4 py-2 text-right ${pnlColor}`}>
                      {tx.realizedPnl ? tx.realizedPnl.toFixed(2) : '--'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TradesHistory
