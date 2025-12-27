import { LineChart, Wallet, Bitcoin } from 'lucide-react'
import useStore from '../store/useStore'
import { getMarketById } from '../config/markets'

function StatsBar() {
  const { cash, portfolioValue, currentPrice, holdings, initialEquity, realizedPnl, selectedMarketId } =
    useStore((state) => ({
      cash: state.cash,
      portfolioValue: state.portfolioValue,
      currentPrice: state.currentPrice,
      holdings: state.holdings,
      initialEquity: state.initialEquity,
      realizedPnl: state.realizedPnl,
      selectedMarketId: state.selectedMarketId,
    }))

  const market = getMarketById(selectedMarketId)
  const baseAsset = market.base
  const position = holdings[baseAsset]
  const positionValue = position.quantity.mul(currentPrice)
  const unrealized = currentPrice.minus(position.averageCost).mul(position.quantity)
  const change = portfolioValue.minus(initialEquity)
  const changePct = change.div(initialEquity).mul(100)
  const isUp = change.gte(0)

  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
          <LineChart className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide text-slate-100">
            Crypto Trading Sandbox
          </div>
          <div className="text-xs text-slate-400">{market.label} Paper Trading</div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-slate-400" />
          <div>
            <div className="text-[11px] text-slate-400">Equity</div>
            <div className={isUp ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              ${portfolioValue.toFixed(2)}
            </div>
            <div className={isUp ? 'text-[11px] text-emerald-500' : 'text-[11px] text-red-500'}>
              {change.gte(0) ? '+' : ''}
              {change.toFixed(2)} ({changePct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Bitcoin className="h-4 w-4 text-yellow-400" />
          <div>
            <div className="text-[11px] text-slate-400">{baseAsset} Position</div>
            <div className="text-xs font-semibold text-slate-100">
              {position.quantity.toFixed(6)} {baseAsset}
            </div>
            <div className="text-[11px] text-slate-400">
              Value ${positionValue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
            Unrealized {unrealized.gte(0) ? '+' : ''}
            {unrealized.toFixed(2)}
          </div>
          <div className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] text-sky-300">
            Realized {realizedPnl.gte(0) ? '+' : ''}
            {realizedPnl.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Mark</span>
          <span className="text-sm font-semibold text-slate-100">
            {currentPrice.gt(0) ? `$${currentPrice.toFixed(2)}` : '--'}
          </span>
        </div>
      </div>
    </header>
  )
}

export default StatsBar
