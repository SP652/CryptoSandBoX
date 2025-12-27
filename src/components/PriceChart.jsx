import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

function calcEMA(values, period) {
  if (!values || values.length === 0) return []
  const k = 2 / (period + 1)
  let emaPrev = values[0].close
  const result = values.map((c, i) => {
    const price = c.close
    const ema = i === 0 ? price : price * k + emaPrev * (1 - k)
    emaPrev = ema
    return { time: c.time, value: ema }
  })
  return result
}

function PriceChart({ candles }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const emaSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      height: 500,
      layout: {
        background: { color: '#020617' },
        textColor: '#e5e7eb',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      rightPriceScale: {
        borderColor: '#1f2937',
      },
      timeScale: {
        borderColor: '#1f2937',
      },
      crosshair: { mode: 0 },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      borderVisible: false,
    })

    const emaSeries = chart.addLineSeries({
      color: '#60a5fa',
      lineWidth: 2,
    })

    const volumeSeries = chart.addHistogramSeries({
      color: '#94a3b8',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      scaleMargins: { top: 0.8, bottom: 0 },
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    emaSeriesRef.current = emaSeries
    volumeSeriesRef.current = volumeSeries

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        chart.applyOptions({ width })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!candleSeriesRef.current || !emaSeriesRef.current || !volumeSeriesRef.current) return
    if (!candles || candles.length === 0) return

    candleSeriesRef.current.setData(candles)

    const ema20 = calcEMA(candles, 20)
    emaSeriesRef.current.setData(ema20)

    const volumes = candles.map((c) => ({
      time: c.time,
      value: c.volume ?? 0,
      color: c.close >= c.open ? '#22c55e55' : '#ef444455',
    }))
    volumeSeriesRef.current.setData(volumes)
  }, [candles])

  return <div ref={containerRef} className="h-[500px] w-full" />
}

export default PriceChart
