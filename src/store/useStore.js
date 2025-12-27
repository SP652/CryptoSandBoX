import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Decimal from 'decimal.js'
import { MARKETS, BASE_ASSETS, getMarketById } from '../config/markets'

const INITIAL_EQUITY = new Decimal(100000)
const FEE_RATE = new Decimal('0.001')
const STORAGE_KEY = 'crypto-sandbox-v1'

const createEmptyHoldings = () => {
  const result = {}
  BASE_ASSETS.forEach((asset) => {
    result[asset] = {
      quantity: new Decimal(0),
      averageCost: new Decimal(0),
    }
  })
  return result
}

const createDefaultLeverage = () => {
  const lev = {}
  BASE_ASSETS.forEach((asset) => {
    lev[asset] = 1
  })
  return lev
}

const useStore = create(
  persist(
    (set, get) => ({
      cash: INITIAL_EQUITY,
      portfolioValue: INITIAL_EQUITY,
      initialEquity: INITIAL_EQUITY,
      realizedPnl: new Decimal(0),
      feeRate: FEE_RATE,
      selectedMarketId: MARKETS[0].id,
      selectedTimeframe: '1m',
      prices: {},
      holdings: createEmptyHoldings(),
      transactions: [],
      openOrders: [],
      leverage: createDefaultLeverage(),
      currentPrice: new Decimal(0),

      setSelectedMarket: (id) => {
        const market = getMarketById(id)
        set({ selectedMarketId: market.id })
      },

      setTimeframe: (tf) => {
        set({ selectedTimeframe: tf })
      },

      setLeverage: (asset, value) => {
        const state = get()
        const next = { ...state.leverage, [asset]: Math.max(1, Math.min(20, Math.floor(value))) }
        set({ leverage: next })
      },

      setCurrentPrice: (price) => {
        const state = get()
        const market = getMarketById(state.selectedMarketId)
        const asset = market.base
        const priceDec = new Decimal(price)

        const prices = {
          ...state.prices,
          [asset]: priceDec,
        }

        let totalPositionsValue = new Decimal(0)

        Object.entries(state.holdings).forEach(([symbol, position]) => {
          if (!position.quantity || position.quantity.lte(0)) return

          const mark = prices[symbol] || position.averageCost
          const positionValue = position.quantity.mul(mark)
          totalPositionsValue = totalPositionsValue.plus(positionValue)
        })

        const portfolioValue = state.cash.plus(totalPositionsValue)

        // Match open orders for this asset at the new price
        let stateAfter = { currentPrice: priceDec, prices, portfolioValue }
        const stateNow = get()
        if (stateNow.openOrders && stateNow.openOrders.length) {
          const toFill = stateNow.openOrders.filter((o) => o.symbol === asset)
          if (toFill.length) {
            let remaining = [...stateNow.openOrders]
            toFill.forEach((o) => {
              const isBuy = o.side === 'BUY'
              const p = priceDec
              let shouldFill = false
              if (o.type === 'LIMIT') {
                shouldFill = isBuy ? p.lte(o.limitPrice) : p.gte(o.limitPrice)
              } else if (o.type === 'STOP') {
                shouldFill = isBuy ? p.gte(o.stopPrice) : p.lte(o.stopPrice)
              }
              if (shouldFill) {
                // Execute at limit for LIMIT, at current for STOP
                const execPrice = o.type === 'LIMIT' ? o.limitPrice : p
                if (isBuy) {
                  get().buyMarket({ symbol: o.symbol, price: execPrice, amount: o.amount })
                } else {
                  get().sellMarket({ symbol: o.symbol, price: execPrice, amount: o.amount })
                }
                remaining = remaining.filter((x) => x.id !== o.id)
              }
            })
            set({ openOrders: remaining })
          }
        }

        set(stateAfter)
      },

      buyMarket: ({ symbol = 'BTC', price, amount }) => {
        const state = get()
        const priceDec = new Decimal(price)
        const amountDec = new Decimal(amount)

    if (amountDec.lte(0)) return

        const feeRate = state.feeRate || new Decimal(0)
        const fee = amountDec.mul(feeRate)
        const totalCost = amountDec.plus(fee)

        if (totalCost.gt(state.cash)) return

        const qtyToBuy = amountDec.div(priceDec)

        const existing = state.holdings[symbol] || {
          quantity: new Decimal(0),
          averageCost: new Decimal(0),
        }

        const oldQty = existing.quantity
        const oldAvg = existing.averageCost
        const newQty = oldQty.plus(qtyToBuy)

        const newAvg = newQty.gt(0)
          ? oldQty.mul(oldAvg).plus(qtyToBuy.mul(priceDec)).div(newQty)
          : new Decimal(0)

        const newCash = state.cash.minus(totalCost)
        const updatedHolding = {
          quantity: newQty,
          averageCost: newAvg,
        }

        const unrealized = newQty.mul(state.currentPrice.minus(newAvg))
        const portfolioValue = newCash.plus(unrealized)

        const tx = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          side: 'BUY',
          symbol,
          price: priceDec,
          quantity: qtyToBuy,
          amount: amountDec,
          fee,
          realizedPnl: new Decimal(0),
          timestamp: Date.now(),
        }

        set({
          cash: newCash,
          portfolioValue,
          holdings: {
            ...state.holdings,
            [symbol]: updatedHolding,
          },
          transactions: [tx, ...state.transactions],
        })
      },

      sellMarket: ({ symbol = 'BTC', price, amount }) => {
        const state = get()
        const priceDec = new Decimal(price)
        const amountDec = new Decimal(amount)

        if (amountDec.lte(0)) return

        const existing = state.holdings[symbol]
        if (!existing) return

        const positionValue = existing.quantity.mul(priceDec)
        if (positionValue.lte(0)) return

        const desiredQtyToSell = amountDec.div(priceDec)
        const qtyToSell = Decimal.min(existing.quantity, desiredQtyToSell)
        if (qtyToSell.lte(0)) return

        const grossProceeds = qtyToSell.mul(priceDec)
        const feeRate = state.feeRate || new Decimal(0)
        const fee = grossProceeds.mul(feeRate)
        const netProceeds = grossProceeds.minus(fee)

        const newCash = state.cash.plus(netProceeds)
        const remainingQty = existing.quantity.minus(qtyToSell)

        const remainingHolding = remainingQty.gt(0)
          ? {
              quantity: remainingQty,
              averageCost: existing.averageCost,
            }
          : {
              quantity: new Decimal(0),
              averageCost: new Decimal(0),
            }

        const unrealized = remainingHolding.quantity.mul(
          state.currentPrice.minus(remainingHolding.averageCost),
        )

        const tradePnl = priceDec.minus(existing.averageCost).mul(qtyToSell).minus(fee)
        const realizedPnl = state.realizedPnl.plus(tradePnl)

        const portfolioValue = newCash.plus(unrealized)

        const tx = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          side: 'SELL',
          symbol,
          price: priceDec,
          quantity: qtyToSell,
          amount: grossProceeds,
          fee,
          realizedPnl: tradePnl,
          timestamp: Date.now(),
        }

        set({
          cash: newCash,
          portfolioValue,
          realizedPnl,
          holdings: {
            ...state.holdings,
            [symbol]: remainingHolding,
          },
          transactions: [tx, ...state.transactions],
        })
      },

      placeLimitOrder: ({ symbol, side, amount, limitPrice }) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
        const order = {
          id,
          type: 'LIMIT',
          symbol,
          side, // BUY or SELL
          amount: new Decimal(amount),
          limitPrice: new Decimal(limitPrice),
          createdAt: Date.now(),
        }
        const state = get()
        set({ openOrders: [order, ...state.openOrders] })
      },

      placeStopOrder: ({ symbol, side, amount, stopPrice }) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
        const order = {
          id,
          type: 'STOP',
          symbol,
          side,
          amount: new Decimal(amount),
          stopPrice: new Decimal(stopPrice),
          createdAt: Date.now(),
        }
        const state = get()
        set({ openOrders: [order, ...state.openOrders] })
      },

      cancelOrder: (id) => {
        const state = get()
        set({ openOrders: state.openOrders.filter((o) => o.id !== id) })
      },

      setPricesFromSnapshot: (snap) => {
        const state = get()
        let prices = { ...state.prices }
        Object.entries(snap).forEach(([marketId, data]) => {
          const market = getMarketById(marketId)
          const asset = market.base
          const p = new Decimal(data.lastPrice)
          prices[asset] = p
          // Match open orders per asset
          if (state.openOrders && state.openOrders.length) {
            const toFill = state.openOrders.filter((o) => o.symbol === asset)
            if (toFill.length) {
              let remaining = [...state.openOrders]
              toFill.forEach((o) => {
                const isBuy = o.side === 'BUY'
                const price = p
                let shouldFill = false
                if (o.type === 'LIMIT') {
                  shouldFill = isBuy ? price.lte(o.limitPrice) : price.gte(o.limitPrice)
                } else if (o.type === 'STOP') {
                  shouldFill = isBuy ? price.gte(o.stopPrice) : price.lte(o.stopPrice)
                }
                if (shouldFill) {
                  const execPrice = o.type === 'LIMIT' ? o.limitPrice : price
                  if (isBuy) {
                    get().buyMarket({ symbol: o.symbol, price: execPrice, amount: o.amount })
                  } else {
                    get().sellMarket({ symbol: o.symbol, price: execPrice, amount: o.amount })
                  }
                  remaining = remaining.filter((x) => x.id !== o.id)
                }
              })
              set({ openOrders: remaining })
            }
          }
        })
        // Recompute portfolio value with updated prices
        let totalPositionsValue = new Decimal(0)
        Object.entries(state.holdings).forEach(([symbol, position]) => {
          if (!position.quantity || position.quantity.lte(0)) return
          const mark = prices[symbol] || position.averageCost
          totalPositionsValue = totalPositionsValue.plus(position.quantity.mul(mark))
        })
        const portfolioValue = state.cash.plus(totalPositionsValue)
        set({ prices, portfolioValue })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        cash: state.cash.toString(),
        portfolioValue: state.portfolioValue.toString(),
        initialEquity: state.initialEquity.toString(),
        realizedPnl: state.realizedPnl.toString(),
        selectedMarketId: state.selectedMarketId,
        selectedTimeframe: state.selectedTimeframe,
        holdings: Object.fromEntries(
          Object.entries(state.holdings).map(([symbol, pos]) => [
            symbol,
            {
              quantity: pos.quantity.toString(),
              averageCost: pos.averageCost.toString(),
            },
          ]),
        ),
        transactions: state.transactions.map((tx) => ({
          ...tx,
          price: tx.price.toString(),
          quantity: tx.quantity.toString(),
          amount: tx.amount.toString(),
          fee: tx.fee.toString(),
          realizedPnl: tx.realizedPnl.toString(),
        })),
        openOrders: state.openOrders.map((o) => ({
          ...o,
          amount: o.amount.toString(),
          limitPrice: o.limitPrice ? o.limitPrice.toString() : undefined,
          stopPrice: o.stopPrice ? o.stopPrice.toString() : undefined,
        })),
        leverage: state.leverage,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState

        const p = persistedState

        const holdings = {}
        if (p.holdings) {
          Object.entries(p.holdings).forEach(([symbol, pos]) => {
            holdings[symbol] = {
              quantity: new Decimal(pos.quantity),
              averageCost: new Decimal(pos.averageCost),
            }
          })
        }

        const transactions = (p.transactions || []).map((tx) => ({
          ...tx,
          price: new Decimal(tx.price),
          quantity: new Decimal(tx.quantity),
          amount: new Decimal(tx.amount),
          fee: new Decimal(tx.fee),
          realizedPnl: new Decimal(tx.realizedPnl),
        }))

        return {
          ...currentState,
          cash: new Decimal(p.cash),
          portfolioValue: new Decimal(p.portfolioValue),
          initialEquity: new Decimal(p.initialEquity),
          realizedPnl: new Decimal(p.realizedPnl),
          selectedMarketId: p.selectedMarketId || currentState.selectedMarketId,
          selectedTimeframe: p.selectedTimeframe || currentState.selectedTimeframe,
          holdings: {
            ...createEmptyHoldings(),
            ...currentState.holdings,
            ...holdings,
          },
          transactions,
          openOrders: (p.openOrders || []).map((o) => ({
            ...o,
            amount: new Decimal(o.amount),
            limitPrice: o.limitPrice !== undefined ? new Decimal(o.limitPrice) : undefined,
            stopPrice: o.stopPrice !== undefined ? new Decimal(o.stopPrice) : undefined,
          })),
          leverage: p.leverage || currentState.leverage || createDefaultLeverage(),
        }
      },
    },
  ),
)

export default useStore
