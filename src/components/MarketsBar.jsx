import useStore from '../store/useStore'
import { MARKETS } from '../config/markets'

function MarketsBar() {
  const { selectedMarketId, setSelectedMarket } = useStore((state) => ({
    selectedMarketId: state.selectedMarketId,
    setSelectedMarket: state.setSelectedMarket,
  }))

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-4 py-2 text-xs">
      {MARKETS.map((market) => {
        const isActive = market.id === selectedMarketId
        return (
          <button
            key={market.id}
            type="button"
            onClick={() => setSelectedMarket(market.id)}
            className={
              isActive
                ? 'flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm shadow-slate-900'
                : 'flex items-center gap-1 rounded-full bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 hover:bg-slate-800/80'
            }
          >
            <span>{market.label}</span>
            <span className="text-[10px] text-slate-500">{market.base}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MarketsBar
