import { useEffect, useState } from 'react'
import axios from 'axios'
import { MARKETS } from '../config/markets'

const TICKER_URL = 'https://api.binance.com/api/v3/ticker/24hr'

function useMarketsSnapshot() {
  const [snapshot, setSnapshot] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    let intervalId

    async function fetchSnapshot() {
      try {
        const symbols = MARKETS.map((m) => m.id)
        const response = await axios.get(TICKER_URL, {
          params: {
            symbols: JSON.stringify(symbols),
          },
        })

        if (cancelled) return

        const next = {}
        for (const item of response.data) {
          next[item.symbol] = {
            lastPrice: parseFloat(item.lastPrice),
            priceChangePercent: parseFloat(item.priceChangePercent),
            highPrice: parseFloat(item.highPrice),
            lowPrice: parseFloat(item.lowPrice),
            volume: parseFloat(item.volume),
          }
        }

        setSnapshot(next)
        setLoading(false)
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load market snapshot')
          setLoading(false)
        }
      }
    }

    fetchSnapshot()
    intervalId = setInterval(fetchSnapshot, 15000)

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return { snapshot, loading, error }
}

export default useMarketsSnapshot
