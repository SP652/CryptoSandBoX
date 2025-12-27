import useStore from '../store/useStore'
import { getMarketById } from '../config/markets'

function AccountSummary() {
  const { cash, portfolioValue, holdings, currentPrice, realizedPnl, selectedMarketId } = useStore((state) => ({
    cash: state.cash,
    portfolioValue: state.portfolioValue,
    holdings: state.holdings,
    currentPrice: state.currentPrice,
    realizedPnl: state.realizedPnl,
    selectedMarketId: state.selectedMarketId,
  }))

  const market = getMarketById(selectedMarketId)
  const baseAsset = market.base
  const position = holdings[baseAsset]
  const unrealized = currentPrice.minus(position.averageCost).mul(position.quantity)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Account Summary
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Balance</span>
          <span className="font-semibold text-slate-100">${cash.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Equity</span>
          <span className="font-semibold text-slate-100">${portfolioValue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Unrealized P&amp;L</span>
          <span
            className={
              unrealized.gt(0)
                ? 'font-semibold text-emerald-400'
                : unrealized.lt(0)
                ? 'font-semibold text-red-400'
                : 'font-semibold text-slate-100'
            }
          >
            {unrealized.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Realized P&amp;L</span>
          <span
            className={
              realizedPnl.gt(0)
                ? 'font-semibold text-emerald-400'
                : realizedPnl.lt(0)
                ? 'font-semibold text-red-400'
                : 'font-semibold text-slate-100'
            }
          >
            {realizedPnl.toFixed(2)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>{baseAsset} Position</span>
          <span className="text-slate-100">{position.quantity.toFixed(6)} {baseAsset}</span>
        </div>
      </div>
    </div>
  )
}

export default AccountSummary
