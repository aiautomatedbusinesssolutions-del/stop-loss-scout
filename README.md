# Stop Loss Scholar

**A Real-time Risk Management Dashboard for Traders**

*Learn Exactly Where to Draw the Line*

Stop Loss Scholar helps beginner crypto investors understand where to place stop losses and how to size positions correctly. Instead of guessing, traders see visual stop-loss levels on a live chart and get position size calculations based on their risk tolerance.

---

## Key Features

- **Real-time Binance.US WebSocket Integration** - Live candlestick charts with sub-second price updates, throttled to 500ms to prevent render jank
- **Structural Support Detection** - Stop levels derived from actual price structure, not arbitrary percentages
- **Dynamic Position Sizing** - Enter your risk amount and instantly see how many coins to buy at each stop level
- **Educational Content** - Beginner-friendly explanations of stop losses, slippage, risk sizing, and why crypto needs wider stops
- **Account Size Calculator** - Input your account size, get 1% and 2% risk amounts with one-click apply

## Structural Support Logic

Unlike typical stop-loss tools that use fixed percentages (-2%, -5%, -8%), Stop Loss Scholar analyzes actual price structure to find meaningful support levels:

- **Tight (Recent Low)** - The lowest wick of the last 12 hourly candles, representing immediate short-term support
- **Standard (Consolidation Floor)** - Scans candles from index -60 to -10 to find the absolute lowest wick of the previous consolidation base. This anchors the stop to the "spring" — the floor of the range price launched from, not an arbitrary percentage
- **Wide (Major Structural Low)** - The absolute lowest wick across the entire 200-candle history, representing the ultimate structural floor

Each level includes a 0.1% buffer below the identified wick to guard against slippage. Strict 3% separation is enforced between levels to ensure they remain visually distinct and logically ordered. A structural cache prevents redundant scans on price-only ticks, only recalculating when new candles arrive.

When insufficient data is available, the system falls back to percentage-based stops (-2% / -5% / -10%).

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind CSS v4)
- **Charts:** lightweight-charts (CandlestickSeries + dynamic PriceLines)
- **State:** Zustand (flat store piping WebSocket data to chart + risk formulas)
- **Data:** Binance.US WebSocket (live prices) + Binance.US REST API (historical klines)
- **Icons:** lucide-react
- **Proxy:** Next.js API route to bypass CORS restrictions

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## How to Use

1. Type a coin name (e.g. "BTC", "ETH") in the search bar
2. The chart loads with ~200 hours of 1H candles and 3 dashed stop-loss lines
3. Live price updates stream in real-time (green dot = connected)
4. Enter your risk amount to see position sizes for each stop level
5. Expand the education section to learn about stop losses, slippage, and risk management

## Architecture

```
src/
├── app/
│   ├── api/binance/[...path]/   # CORS proxy for Binance.US REST API
│   ├── layout.tsx               # Inter font, dark theme, metadata
│   ├── page.tsx                 # Server component shell
│   └── globals.css              # Tailwind v4, dark scrollbar, animations
├── components/
│   ├── StopLossApp.tsx          # Client orchestrator (WebSocket + data loading)
│   ├── TickerSearch.tsx         # Autocomplete search with connection status
│   ├── PriceChart.tsx           # Candlestick chart + 3 stop-loss price lines
│   ├── RiskDashboard.tsx        # Risk calculator with "aha moment" summary
│   ├── StopLevelCard.tsx        # Individual stop level display
│   └── education/
│       ├── EducationSection.tsx # Beginner-friendly learning content
│       ├── AccordionCard.tsx    # Reusable CSS grid accordion
│       └── AccountSizeCalc.tsx  # 1-2% rule calculator
├── hooks/
│   └── useBinanceStream.ts     # WebSocket lifecycle hook
├── lib/
│   ├── services/
│   │   ├── binance.ts          # REST: getKlines(), getExchangeInfo()
│   │   └── websocket.ts        # WebSocket: combined trade + kline stream
│   ├── store.ts                # Zustand store + structural stop level logic
│   └── format.ts               # Price/USD/coin formatting utilities
├── types/
│   └── index.ts                # Candle, TradingPair, StopLevel, ConnectionStatus
└── constants/
    └── content.ts              # Education UI string constants
```

## Risk Formula

```
Position Size = Risk Amount / (Current Price - Stop Price)
Position Value = Position Size * Current Price
```

Example: Risking $100 with BTC at $90,000 and a standard stop at $87,300 = 0.037 BTC ($3,333 position).

---

*Education content is for learning purposes only — not financial advice.*
