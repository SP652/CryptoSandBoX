import Decimal from 'decimal.js'
import useStore from '../store/useStore'

function PositionsTable() {
  const { holdings, prices, currentPrice, selectedMarketId } = useStore((state) => ({
    holdings: state.holdings,
    prices: state.prices,
    currentPrice: state.currentPrice,
    selectedMarketId: state.selectedMarketId,
  }))

  const rows = Object.entries(holdings).filter(([, pos]) => pos.quantity && pos.quantity.gt(0))

  return (
    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
      <div className="border-b border-slate-800 px-4 py-2 text-[11px] font-medium text-slate-300">
        Positions
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950/40 text-[10px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">Asset</th>
              <th className="px-4 py-2 text-right">Size</th>
              <th className="px-4 py-2 text-right">Entry Price</th>
              <th className="px-4 py-2 text-right">Mark Price</th>
              <th className="px-4 py-2 text-right">P&amp;L ($)</th>
              <th className="px-4 py-2 text-right">P&amp;L (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-[11px]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-slate-500">
                  No open positions.
                </td>
              </tr>
            ) : (
              rows.map(([symbol, pos]) => {
                const mark =
                  prices[symbol] && prices[symbol].gt(0)
                    ? prices[symbol]
                    : currentPrice.gt(0) && symbol === selectedMarketId.slice(0, -4)
                    ? currentPrice
                    : pos.averageCost

                const hasPosition = pos.quantity.gt(0)
                const unrealized = hasPosition
                  ? mark.minus(pos.averageCost).mul(pos.quantity)
                  : new Decimal(0)

                const pnlPct = hasPosition && pos.averageCost.gt(0)
                  ? mark.minus(pos.averageCost).div(pos.averageCost).mul(100)
                  : new Decimal(0)

                return (
                  <tr key={symbol} className="hover:bg-slate-900/80">
                    <td className="px-4 py-2 text-left text-slate-200">{symbol}</td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {pos.quantity.toFixed(6)} {symbol}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {pos.averageCost.gt(0) ? `$${pos.averageCost.toFixed(2)}` : '--'}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {mark.gt(0) ? `$${mark.toFixed(2)}` : '--'}
                    </td>
                    <td
                      className={
                        unrealized.gt(0)
                          ? 'px-4 py-2 text-right text-emerald-400'
                          : unrealized.lt(0)
                          ? 'px-4 py-2 text-right text-red-400'
                          : 'px-4 py-2 text-right text-slate-200'
                      }
                    >
                      {hasPosition && mark.gt(0) ? unrealized.toFixed(2) : '--'}
                    </td>
                    <td
                      className={
                        pnlPct.gt(0)
                          ? 'px-4 py-2 text-right text-emerald-400'
                          : pnlPct.lt(0)
                          ? 'px-4 py-2 text-right text-red-400'
                          : 'px-4 py-2 text-right text-slate-200'
                      }
                    >
                      {hasPosition && mark.gt(0) ? `${pnlPct.toFixed(2)}%` : '--'}
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

export default PositionsTable
