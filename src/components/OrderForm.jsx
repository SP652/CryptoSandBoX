import { useState } from 'react'
import Decimal from 'decimal.js'
import useStore from '../store/useStore'
import { getMarketById } from '../config/markets'

function OrderForm() {
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('MARKET')
  const [amountInput, setAmountInput] = useState('')
  const [limitInput, setLimitInput] = useState('')
  const [stopInput, setStopInput] = useState('')
  const [formError, setFormError] = useState('')

  const {
    cash,
    holdings,
    currentPrice,
    buyMarket,
    sellMarket,
    placeLimitOrder,
    placeStopOrder,
    selectedMarketId,
    leverage,
    setLeverage,
  } = useStore((state) => ({
    cash: state.cash,
    holdings: state.holdings,
    currentPrice: state.currentPrice,
    buyMarket: state.buyMarket,
    sellMarket: state.sellMarket,
    placeLimitOrder: state.placeLimitOrder,
    placeStopOrder: state.placeStopOrder,
    selectedMarketId: state.selectedMarketId,
    leverage: state.leverage,
    setLeverage: state.setLeverage,
  }))

  const market = getMarketById(selectedMarketId)
  const baseAsset = market.base
  const position = holdings[baseAsset]

  const maxBuyAmount = cash
  const maxSellAmount = position.quantity.mul(currentPrice)

  const handlePercentClick = (percent) => {
    const base = side === 'buy' ? maxBuyAmount : maxSellAmount
    const value = base.mul(percent).div(100)
    setAmountInput(value.toFixed(2))
    setFormError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const numericAmount = parseFloat(amountInput)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Enter a valid amount in USDT.')
      return
    }

    if (currentPrice.lte(0) && orderType === 'MARKET') {
      setFormError('Waiting for market price. Please try again in a moment.')
      return
    }

    if (orderType === 'MARKET') {
      if (side === 'buy') {
        const max = maxBuyAmount.toNumber()
        if (numericAmount > max) {
          setFormError('Insufficient balance for this order.')
          return
        }
        buyMarket({ symbol: baseAsset, price: currentPrice.toNumber(), amount: numericAmount })
      } else {
        const max = maxSellAmount.toNumber()
        if (numericAmount > max && max > 0) {
          setFormError('Order size exceeds position value.')
          return
        }
        sellMarket({ symbol: baseAsset, price: currentPrice.toNumber(), amount: numericAmount })
      }
      setAmountInput('')
    } else if (orderType === 'LIMIT') {
      const limit = parseFloat(limitInput)
      if (isNaN(limit) || limit <= 0) {
        setFormError('Enter a valid limit price.')
        return
      }
      placeLimitOrder({ symbol: baseAsset, side: side.toUpperCase(), amount: numericAmount, limitPrice: limit })
      setAmountInput('')
      setLimitInput('')
    } else if (orderType === 'STOP') {
      const stop = parseFloat(stopInput)
      if (isNaN(stop) || stop <= 0) {
        setFormError('Enter a valid stop price.')
        return
      }
      placeStopOrder({ symbol: baseAsset, side: side.toUpperCase(), amount: numericAmount, stopPrice: stop })
      setAmountInput('')
      setStopInput('')
    }
  }

  const currentSideColor = side === 'buy' ? 'text-emerald-400' : 'text-red-400'
  const currentSideBg = side === 'buy' ? 'bg-emerald-500/10' : 'bg-red-500/10'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Order Form</h2>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <span>{orderType}</span>
        </div>
      </div>

      <div className="mb-3 flex gap-1">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex-1 rounded-md px-3 py-2 text-[11px] font-medium transition-colors ${
            side === 'buy'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex-1 rounded-md px-3 py-2 text-[11px] font-medium transition-colors ${
            side === 'sell'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mb-3 flex gap-1">
        {['MARKET', 'LIMIT', 'STOP'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${
              orderType === type
                ? 'bg-slate-700/60 text-slate-100'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] text-slate-400">
              {orderType === 'MARKET' ? 'Mark Price' : orderType === 'LIMIT' ? 'Limit Price' : 'Stop Price'}
            </label>
            <span className="text-[10px] text-slate-500">
              {orderType === 'MARKET' ? 'Last' : orderType === 'LIMIT' ? 'Limit' : 'Stop'}
            </span>
          </div>
          <input
            type={orderType === 'MARKET' ? 'text' : 'number'}
            readOnly={orderType === 'MARKET'}
            value={
              orderType === 'MARKET'
                ? currentPrice.gt(0) ? currentPrice.toFixed(2) : '--'
                : orderType === 'LIMIT'
                ? limitInput
                : stopInput
            }
            onChange={(e) => {
              if (orderType === 'LIMIT') setLimitInput(e.target.value)
              if (orderType === 'STOP') setStopInput(e.target.value)
            }}
            placeholder={orderType !== 'MARKET' ? '0.00' : undefined}
            className="h-9 w-full rounded-md border border-slate-800 bg-slate-900/60 px-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] text-slate-400">Amount ({market.quote})</label>
            <span className="text-[10px] text-slate-500">
              {side === 'buy'
                ? `Balance: ${cash.toFixed(2)} ${market.quote}`
                : `Position: ${position.quantity.toFixed(6)} ${baseAsset}`}
            </span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-800 bg-slate-900/60 px-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>
              Est. Size ({baseAsset}):{' '}
              {currentPrice.gt(0) && amountInput
                ? `${new Decimal(amountInput || 0).div(currentPrice).toFixed(6)} ${baseAsset}`
                : '--'}
            </span>
            <span>
              Max: ${side === 'buy' ? maxBuyAmount.toFixed(2) : maxSellAmount.toFixed(2)}
            </span>
          </div>
          {formError && (
            <p className="mt-1 text-[11px] text-red-400">{formError}</p>
          )}
        </div>

        <div className="flex gap-1">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePercentClick(p)}
              className="flex-1 rounded-md bg-slate-800/60 px-2 py-1.5 text-[10px] text-slate-300 hover:bg-slate-700/60"
            >
              {p}%
            </button>
          ))}
        </div>

        <button
          type="submit"
          className={`h-9 w-full rounded-md font-medium transition-colors text-xs ${currentSideBg} ${currentSideColor}`}
        >
          {orderType === 'MARKET' ? (side === 'buy' ? 'Place Buy Order' : 'Place Sell Order')
            : orderType === 'LIMIT' ? (side === 'buy' ? 'Place Buy Limit' : 'Place Sell Limit')
            : (side === 'buy' ? 'Place Buy Stop' : 'Place Sell Stop')}
        </button>
      </form>
    </div>
  )
}

export default OrderForm
