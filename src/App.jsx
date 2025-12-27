import StatsBar from './components/StatsBar'
import PriceChart from './components/PriceChart'
import OrderForm from './components/OrderForm'
import PositionsTable from './components/PositionsTable'
import TradesHistory from './components/TradesHistory'
import AccountSummary from './components/AccountSummary'
import MarketOverview from './components/MarketOverview'
import MarketsBar from './components/MarketsBar'
import TimeframeBar from './components/TimeframeBar'
import LiveMarketPanel from './components/LiveMarketPanel'
import PortfolioAllocation from './components/PortfolioAllocation'
import OpenOrdersPanel from './components/OpenOrdersPanel'
import RiskPanel from './components/RiskPanel'
import useMarketData from './hooks/useMarketData'
import useStore from './store/useStore'

function App() {
  const selectedMarketId = useStore((state) => state.selectedMarketId)
  const selectedTimeframe = useStore((state) => state.selectedTimeframe)
  const { candles, loading, error } = useMarketData(selectedMarketId, selectedTimeframe)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
        <StatsBar />
        <MarketsBar />
        <TimeframeBar />

        <main className="flex flex-1 flex-col gap-4 p-4 pb-6">
          {loading && (
            <div className="rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
              Loading market data...
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <LiveMarketPanel />
          <MarketOverview candles={candles} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <PriceChart candles={candles} />
            </div>
            <div className="space-y-3">
              <OrderForm />
              <AccountSummary />
              <PortfolioAllocation />
              <OpenOrdersPanel />
              <RiskPanel />
            </div>
          </div>

          <PositionsTable />
          <TradesHistory />
        </main>
      </div>
    </div>
  )
}

export default App
