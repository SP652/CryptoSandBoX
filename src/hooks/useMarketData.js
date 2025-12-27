import { useEffect, useState } from 'react'
import axios from 'axios'
import useStore from '../store/useStore'

const KLINES_URL = 'https://api.binance.com/api/v3/klines'

function mapRestKlineToCandle(item) {
  return {
    time: item[0] / 1000,
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5]),
  }
}

function mapStreamKlineToCandle(k) {
  return {
    time: k.t / 1000,
    open: parseFloat(k.o),
    high: parseFloat(k.h),
    low: parseFloat(k.l),
    close: parseFloat(k.c),
    volume: parseFloat(k.v),
  }
}

function useMarketData(marketId, timeframe = '1m') {
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const setCurrentPrice = useStore((state) => state.setCurrentPrice)

  useEffect(() => {
    let ws
    let cancelled = false

    async function fetchInitial() {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(KLINES_URL, {
          params: {
            symbol: marketId,
            interval: timeframe,
            limit: 100,
          },
        })

        if (cancelled) return

        const mapped = response.data.map(mapRestKlineToCandle)
        setCandles(mapped)

        if (mapped.length > 0) {
          const last = mapped[mapped.length - 1]
          setCurrentPrice(last.close)
        }
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load market data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    function setupWebSocket() {
      const streamName = `${marketId.toLowerCase()}@kline_${timeframe}`
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (!message.k) return

          const k = message.k
          const candle = mapStreamKlineToCandle(k)

          setCandles((prev) => {
            if (!prev.length) return [candle]

            const last = prev[prev.length - 1]

            if (last.time === candle.time) {
              const updated = [...prev]
              updated[updated.length - 1] = candle
              return updated
            }

            const next = [...prev, candle]
            if (next.length > 100) {
              return next.slice(next.length - 100)
            }

            return next
          })

          setCurrentPrice(k.c)
        } catch {
        }
      }
    }

    setCandles([])

    fetchInitial().then(() => {
      if (!cancelled) {
        setupWebSocket()
      }
    })

    return () => {
      cancelled = true
      if (ws) {
        ws.close()
      }
    }
  }, [marketId, timeframe, setCurrentPrice])

  return { candles, loading, error }
}

export default useMarketData
