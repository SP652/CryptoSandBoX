import { Shield, AlertTriangle } from 'lucide-react'
import useStore from '../store/useStore'
import { getMarketById } from '../config/markets'
import Decimal from 'decimal.js'

function RiskPanel() {
  const { cash, holdings, prices, leverage, selectedMarketId, setLeverage } = useStore((s) => ({
    cash: s.cash,
    holdings: s.holdings,
    prices: s.prices,
    leverage: s.leverage,
    selectedMarketId: s.selectedMarketId,
    setLeverage: s.setLeverage,
  }))

  const market = getMarketById(selectedMarketId)
  const baseAsset = market.base
  const position = holdings[baseAsset]
  const currentLeverage = leverage[baseAsset] ?? 1

  const markPrice = prices[baseAsset] || position.averageCost || new Decimal(0)
  const positionValue = position.quantity.mul(markPrice)
  const margin = positionValue.div(currentLeverage)

  const equity = cash.plus(positionValue)
  const marginUsed = equity.gt(0) ? margin.div(equity).mul(100) : new Decimal(0)

  // Simple liquidation price estimate: marginUsed = 100%
  let liquidationPrice = new Decimal(0)
  if (position.quantity.gt(0) && currentLeverage > 1) {
    const loan = positionValue.minus(margin)
    liquidationPrice = loan.div(position.quantity)
  }

  const marginRatio = equity.gt(0) ? equity.div(margin).mul(100) : new Decimal(0)
  const isDanger = marginRatio.lt(120)
  const isWarning = marginRatio.lt(200) && marginRatio.gte(120)

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-400">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
              Risk / Margin
            </div>
            <div className="text-[10px] text-slate-500">{baseAsset}</div>
          </div>
        </div>
        {isDanger && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Leverage</span>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="1"
              max="20"
              value={currentLeverage}
              onChange={(e) => setLeverage(baseAsset, parseInt(e.target.value, 10))}
              className="h-1 w-16 accent-sky-500"
            />
            <span className="text-[10px] font-medium text-slate-100">{currentLeverage}x</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Margin Used</span>
          <span className="text-[10px] font-medium text-slate-100">{marginUsed.toFixed(2)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Margin Ratio</span>
          <span
            className={`text-[10px] font-medium ${
              isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-emerald-400'
            }`}
          >
            {marginRatio.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Liquidation Est.</span>
          <span className="text-[10px] font-medium text-slate-100">
            {liquidationPrice.gt(0) ? `$${liquidationPrice.toFixed(2)}` : '--'}
          </span>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-colors ${
              isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, marginUsed.toNumber()))}%` }}
          />
        </div>
      </div>
    </section>
  )
}

export default RiskPanel
