export const MARKETS = [
  { id: 'BTCUSDT', base: 'BTC', quote: 'USDT', label: 'BTC / USDT' },
  { id: 'ETHUSDT', base: 'ETH', quote: 'USDT', label: 'ETH / USDT' },
  { id: 'BNBUSDT', base: 'BNB', quote: 'USDT', label: 'BNB / USDT' },
  { id: 'SOLUSDT', base: 'SOL', quote: 'USDT', label: 'SOL / USDT' },
  { id: 'XRPUSDT', base: 'XRP', quote: 'USDT', label: 'XRP / USDT' },
  { id: 'ADAUSDT', base: 'ADA', quote: 'USDT', label: 'ADA / USDT' },
  { id: 'DOGEUSDT', base: 'DOGE', quote: 'USDT', label: 'DOGE / USDT' },
  { id: 'TONUSDT', base: 'TON', quote: 'USDT', label: 'TON / USDT' },
  { id: 'TRXUSDT', base: 'TRX', quote: 'USDT', label: 'TRX / USDT' },
  { id: 'LINKUSDT', base: 'LINK', quote: 'USDT', label: 'LINK / USDT' },
  { id: 'AVAXUSDT', base: 'AVAX', quote: 'USDT', label: 'AVAX / USDT' },
  { id: 'MATICUSDT', base: 'MATIC', quote: 'USDT', label: 'MATIC / USDT' },
  { id: 'LTCUSDT', base: 'LTC', quote: 'USDT', label: 'LTC / USDT' },
  { id: 'DOTUSDT', base: 'DOT', quote: 'USDT', label: 'DOT / USDT' },
  { id: 'SHIBUSDT', base: 'SHIB', quote: 'USDT', label: 'SHIB / USDT' },
  { id: 'BCHUSDT', base: 'BCH', quote: 'USDT', label: 'BCH / USDT' },
  { id: 'UNIUSDT', base: 'UNI', quote: 'USDT', label: 'UNI / USDT' },
  { id: 'NEARUSDT', base: 'NEAR', quote: 'USDT', label: 'NEAR / USDT' },
  { id: 'OPUSDT', base: 'OP', quote: 'USDT', label: 'OP / USDT' },
  { id: 'ARBUSDT', base: 'ARB', quote: 'USDT', label: 'ARB / USDT' },
]

export const BASE_ASSETS = Array.from(new Set(MARKETS.map((m) => m.base)))

export function getMarketById(id) {
  return MARKETS.find((m) => m.id === id) ?? MARKETS[0]
}
