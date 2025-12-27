import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { MARKETS } from '../config/markets'
import useMarketsSnapshot from '../hooks/useMarketsSnapshot'

function LiveMarketPanel() {
  const { snapshot, loading, error } = useMarketsSnapshot()

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-400">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
              Market Pulse
            </div>
            <div className="text-[10px] text-slate-500">Top markets, 24h change</div>
          </div>
        </div>
        {loading && <div className="text-[10px] text-slate-500">Loading...</div>}
        {error && !loading && (
          <div className="text-[10px] text-red-400">{error}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {MARKETS.map((market) => {
          const data = snapshot[market.id]
          const change = data ? data.priceChangePercent : 0
          const isUp = change >= 0

          const tone = !data
            ? 'bg-slate-900/70 border-slate-800'
            : isUp
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-red-500/5 border-red-500/30'

          const changeColor = !data
            ? 'text-slate-400'
            : isUp
            ? 'text-emerald-400'
            : 'text-red-400'

          return (
            <div
              key={market.id}
              className={`flex flex-col rounded-lg border ${tone} px-2 py-2 shadow-sm shadow-slate-950/40`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-100">{market.base}</div>
                <div className="text-[9px] text-slate-500">{market.quote}</div>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-sm font-semibold text-slate-100">
                  {data ? `$${data.lastPrice.toFixed(2)}` : '--'}
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-medium ${changeColor}`}>
                  {data ? (
                    <>
                      {isUp ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{change.toFixed(2)}%</span>
                    </>
                  ) : (
                    <span>--</span>
                  )}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                <span>High {data ? `$${data.highPrice.toFixed(2)}` : '--'}</span>
                <span>Low {data ? `$${data.lowPrice.toFixed(2)}` : '--'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default LiveMarketPanel
