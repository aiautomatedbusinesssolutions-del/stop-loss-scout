# Stop Loss Scholar - Implementation Plan

## Context
Beginner crypto investors struggle with where to place stop losses and how to size positions correctly. **Stop Loss Scholar** ("Learn Exactly Where to Draw the Line") solves this by showing visual stop-loss levels on a live chart and calculating position sizes based on user-defined risk. This is app #24 in the 30-Day Finance App Challenge.

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS)
- **Charts:** lightweight-charts (CandlestickSeries + price lines for stop levels)
- **State:** Zustand (pipes WebSocket price data to chart + risk formulas)
- **Data:** Binance WebSocket (live prices) + Binance REST API (historical klines)
- **Icons:** lucide-react

## Architecture
```
src/
├── app/
│   ├── layout.tsx              # Inter font, bg-slate-950, metadata
│   ├── page.tsx                # Server component shell
│   └── globals.css             # Tailwind v4, dark scrollbar, animations
├── components/
│   ├── StopLossApp.tsx         # Client orchestrator (WebSocket + data loading)
│   ├── TickerSearch.tsx        # Autocomplete search from Binance USDT pairs
│   ├── PriceChart.tsx          # Candlestick chart + 3 stop-loss price lines
│   ├── RiskDashboard.tsx       # Risk calculator container
│   ├── StopLevelCard.tsx       # Individual stop level display
│   └── education/
│       ├── EducationSection.tsx
│       ├── AccordionCard.tsx
│       └── AccountSizeCalc.tsx
├── hooks/
│   └── useBinanceStream.ts     # WebSocket lifecycle hook
├── lib/
│   ├── services/
│   │   ├── binance.ts          # REST: getKlines(), getExchangeInfo()
│   │   └── websocket.ts        # WebSocket: combined trade + kline stream
│   ├── store.ts                # Zustand store
│   └── format.ts               # Price/USD formatting utilities
└── types/
    └── index.ts                # Candle, TradingPair, StopLevel, ConnectionStatus
```

## Reference Files to Reuse
- **Binance REST API:** `Breakout-Buddy/src/services/binance.ts` — Candle interface, parseKline, getKlines, getUSDTPairs
- **Chart setup:** `Cloud-Compas/src/components/charts/IchimokuChart.tsx` — dark theme config, CandlestickSeries, LineSeries, ResizeObserver
- **Education accordion:** `earnings-insight/components/EducationStation.tsx` — AccordionItem pattern
- **Layout/CSS:** `Cloud-Compas/src/app/layout.tsx` and `globals.css` — Inter font, dark scrollbar, animations

## Implementation Steps

### Step 1: Scaffold Project
- `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
- `npm install lightweight-charts zustand lucide-react`
- Set up `globals.css` (dark scrollbar, animations) and `layout.tsx` (Inter font, metadata)

### Step 2: Types & Services
- `src/types/index.ts` — Candle, TradingPair, StopLevel, ConnectionStatus
- `src/lib/services/binance.ts` — Adapt from Breakout-Buddy: `getExchangeInfo()` (returns TradingPair[]), `getKlines(symbol)` (1h, limit 200)
- `src/lib/format.ts` — `formatPrice()` (auto-detect decimals), `formatUSD()`, `formatCoinAmount()`

### Step 3: Zustand Store
- `src/lib/store.ts` — Flat store: selectedSymbol, currentPrice, klineData, connectionStatus, riskAmount, tradingPairs + actions
- `computeStopLevels(price)` as a pure helper (not in store):
  - **Tight (Rose):** 2% below — for active traders
  - **Standard (Amber):** 5% below — balanced approach
  - **Wide (Emerald):** 8% below — swing traders

### Step 4: WebSocket Layer
- `src/lib/services/websocket.ts` — Combined stream: `wss://stream.binance.com:9443/stream?streams={symbol}@trade/{symbol}@kline_1h`
- Reconnect with exponential backoff (1s to 30s max)
- Throttle price updates to ~500ms to avoid excessive renders
- `src/hooks/useBinanceStream.ts` — Hook managing subscribe/unsubscribe on symbol change

### Step 5: Ticker Search
- `src/components/TickerSearch.tsx` — Input with autocomplete dropdown filtering Binance USDT pairs
- Shows connection status dot (emerald/amber/rose)
- On selection updates Zustand symbol, triggers data load + WebSocket switch

### Step 6: Price Chart
- `src/components/PriceChart.tsx` — lightweight-charts candlestick (1h timeframe)
- Load historical klines from REST on symbol change
- Update latest candle in real-time via WebSocket kline stream
- 3 stop-loss levels as `candleSeries.createPriceLine()` — dashed horizontal lines with labels
  - Tight: rose `#fb7185`, "Tight -2%"
  - Standard: amber `#fbbf24`, "Standard -5%"
  - Wide: emerald `#34d399`, "Wide -8%"
- Dark theme matching sprint-rules.md (slate-950/900/800 palette)

### Step 7: Risk Dashboard
- `src/components/StopLevelCard.tsx` — Shows stop price, % distance, position size, position value per level
- `src/components/RiskDashboard.tsx` — "How much are you willing to lose?" input + 3 StopLevelCards
- **Risk formula:** `Position Size = Risk Amount / (Current Price - Stop Price)`
- **"Aha moment" summary:** e.g., "Risking $100 -> buy 0.033 BTC ($2,000 position) with standard stop"

### Step 8: Education Section
- `src/components/education/AccordionCard.tsx` — Reusable accordion (CSS grid expand/collapse)
- `src/components/education/EducationSection.tsx` — Topics:
  1. What is a Stop Loss? (featured card with analogy)
  2. Stop Loss vs Stop Limit (accordion)
  3. What is Slippage? (accordion)
  4. Risk Sizing 101 — the 1-2% rule (accordion)
  5. Why Crypto Needs Wider Stops (accordion)
- `src/components/education/AccountSizeCalc.tsx` — Input account size, shows max risk at 1% and 2%, button to set as risk amount

### Step 9: Page Assembly
- `src/components/StopLossApp.tsx` — Client orchestrator: activates WebSocket, loads pairs + initial klines, renders all sections
- `src/app/page.tsx` — Server shell with header ("Stop Loss Scholar" / "Learn Exactly Where to Draw the Line")

## Key Design Decisions
- **1-hour candles** — Not too noisy for beginners, shows meaningful price action
- **Price lines (not LineSeries)** for stop levels — idiomatic lightweight-charts API, auto-extends, shows price on axis
- **Throttled WebSocket updates** (500ms) — BTC can have 50+ trades/sec; throttling prevents jank
- **Percentage-based stops initially** — Simple for beginners. Can later be adjusted to ATR-based or support/resistance-based via vibe coding
- **Derived stop levels via useMemo** — Not stored in Zustand, avoids redundant state

## Verification
1. Run `npm run dev`, open in browser
2. Type "BTC" in search, should see BTCUSDT autocomplete, select it
3. Chart loads with ~200 hours of 1h candles + 3 dashed stop-loss lines
4. Live price updates in real-time (check connection dot is green)
5. Enter risk amount ($100), StopLevelCards update with position sizes
6. Try switching to ETH, chart + levels + calculations all update
7. Expand education accordions, content displays correctly
8. Test on mobile viewport, responsive layout, chart resizes
