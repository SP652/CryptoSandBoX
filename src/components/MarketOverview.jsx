import Decimal from 'decimal.js'

function MarketOverview({ candles }) {
  if (!candles || candles.length === 0) return null

  const first = candles[0]
  const last = candles[candles.length - 1]

  const firstOpen = new Decimal(first.open)
  const lastClose = new Decimal(last.close)

  let sessionHigh = new Decimal(candles[0].high)
  let sessionLow = new Decimal(candles[0].low)

  for (const c of candles) {
    const h = new Decimal(c.high)
    const l = new Decimal(c.low)
    if (h.gt(sessionHigh)) sessionHigh = h
    if (l.lt(sessionLow)) sessionLow = l
  }

  const change = lastClose.minus(firstOpen)
  const changePct = change.div(firstOpen).mul(100)
  const isUp = change.gte(0)

  return (
    <section className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs md:grid-cols-4">
      <div>
        <div className="text-[11px] text-slate-400">Last Price</div>
        <div className="text-sm font-semibold text-slate-100">
          ${lastClose.toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-[11px] text-slate-400">Change (Last 100m)</div>
        <div className={`text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {change.gte(0) ? '+' : ''}
          {change.toFixed(2)} ({changePct.toFixed(2)}%)
        </div>
      </div>
      <div>
        <div className="text-[11px] text-slate-400">Session High</div>
        <div className="text-sm font-semibold text-slate-100">
          ${sessionHigh.toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-[11px] text-slate-400">Session Low</div>
        <div className="text-sm font-semibold text-slate-100">
          ${sessionLow.toFixed(2)}
        </div>
      </div>
    </section>
  )
}

export default MarketOverview
