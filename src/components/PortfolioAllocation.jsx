import Decimal from 'decimal.js'
import useStore from '../store/useStore'

function PortfolioAllocation() {
  const { holdings, prices, portfolioValue } = useStore((state) => ({
    holdings: state.holdings,
    prices: state.prices,
    portfolioValue: state.portfolioValue,
  }))

  const rowsRaw = Object.entries(holdings).filter(([, pos]) => pos.quantity && pos.quantity.gt(0))

  if (!rowsRaw.length) return null

  let totalPositionsValue = new Decimal(0)

  const rows = rowsRaw.map(([symbol, pos]) => {
    const mark =
      prices[symbol] && prices[symbol].gt(0)
        ? prices[symbol]
        : pos.averageCost

    const value = pos.quantity.mul(mark)
    totalPositionsValue = totalPositionsValue.plus(value)

    const pnlPct = pos.averageCost.gt(0)
      ? mark.minus(pos.averageCost).div(pos.averageCost).mul(100)
      : new Decimal(0)

    return { symbol, pos, mark, value, pnlPct }
  })

  const best = rows.reduce((acc, row) => {
    if (!acc) return row
    return row.pnlPct.gt(acc.pnlPct) ? row : acc
  }, null)

  const worst = rows.reduce((acc, row) => {
    if (!acc) return row
    return row.pnlPct.lt(acc.pnlPct) ? row : acc
  }, null)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Portfolio Allocation
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const weight = totalPositionsValue.gt(0)
            ? row.value.div(totalPositionsValue).mul(100).toNumber()
            : 0

          const pnlColor = row.pnlPct.gt(0)
            ? 'text-emerald-400'
            : row.pnlPct.lt(0)
            ? 'text-red-400'
            : 'text-slate-200'

          return (
            <div key={row.symbol} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-100">{row.symbol}</span>
                  <span className="text-[10px] text-slate-500">
                    {row.value.toFixed(2)} USDT
                  </span>
                </div>
                <div className={`text-[10px] font-medium ${pnlColor}`}>
                  {row.pnlPct.gte(0) ? '+' : ''}
                  {row.pnlPct.toFixed(2)}%
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                  style={{ width: `${Math.min(100, Math.max(2, weight))}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <div>
          <div className="uppercase tracking-wide">Best</div>
          <div className="text-slate-100">
            {best ? `${best.symbol} (${best.pnlPct.toFixed(2)}%)` : '--'}
          </div>
        </div>
        <div>
          <div className="uppercase tracking-wide">Worst</div>
          <div className="text-slate-100">
            {worst ? `${worst.symbol} (${worst.pnlPct.toFixed(2)}%)` : '--'}
          </div>
        </div>
      </div>
      <div className="mt-1 text-[10px] text-slate-500">
        Total positions value: {totalPositionsValue.toFixed(2)} USDT
      </div>
    </div>
  )
}

export default PortfolioAllocation
