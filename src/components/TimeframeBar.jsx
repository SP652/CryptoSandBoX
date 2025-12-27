import useStore from '../store/useStore'

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d']

function TimeframeBar() {
  const { selectedTimeframe, setTimeframe } = useStore((s) => ({
    selectedTimeframe: s.selectedTimeframe,
    setTimeframe: s.setTimeframe,
  }))

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 bg-slate-950/40 px-4 py-2 text-xs">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          type="button"
          onClick={() => setTimeframe(tf)}
          className={
            selectedTimeframe === tf
              ? 'rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-50'
              : 'rounded-full bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 hover:bg-slate-800/80'
          }
        >
          {tf.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default TimeframeBar
