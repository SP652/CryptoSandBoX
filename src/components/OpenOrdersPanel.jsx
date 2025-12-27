import { X, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import useStore from '../store/useStore'
import { getMarketById } from '../config/markets'

function OpenOrdersPanel() {
  const { openOrders, cancelOrder, currentPrice, selectedMarketId } = useStore((s) => ({
    openOrders: s.openOrders,
    cancelOrder: s.cancelOrder,
    currentPrice: s.currentPrice,
    selectedMarketId: s.selectedMarketId,
  }))

  const filtered = openOrders.filter((o) => o.symbol === selectedMarketId.slice(0, -4))

  if (!filtered.length) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Open Orders
        </div>
        <div className="text-center text-[10px] text-slate-500">No open orders.</div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Open Orders
        </div>
        <div className="text-[10px] text-slate-500">{filtered.length} active</div>
      </div>
      <div className="space-y-2">
        {filtered.map((order) => {
          const isBuy = order.side === 'BUY'
          const isLimit = order.type === 'LIMIT'
          const price = isLimit ? order.limitPrice : order.stopPrice
          const isFilled = isLimit
            ? isBuy
              ? currentPrice.lte(price)
              : currentPrice.gte(price)
            : isBuy
            ? currentPrice.gte(price)
            : currentPrice.lte(price)

          return (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/40 px-2 py-2 shadow-sm shadow-slate-950/40"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/60">
                  {isLimit ? (
                    <Clock className="h-3 w-3 text-slate-400" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                      {order.side}
                    </span>
                    <span className="text-[10px] text-slate-300">{order.symbol}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{isLimit ? 'Limit' : 'Stop'}</span>
                    <span>${price.toFixed(2)}</span>
                    <span>•</span>
                    <span>{order.amount.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => cancelOrder(order.id)}
                className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800/60 text-slate-400 hover:bg-slate-700/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default OpenOrdersPanel
