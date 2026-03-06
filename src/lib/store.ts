import { create } from "zustand";
import { Candle, ConnectionStatus, StopLevel, TradingPair } from "@/types";

interface StoreState {
  selectedSymbol: string;
  currentPrice: number;
  klineData: Candle[];
  connectionStatus: ConnectionStatus;
  riskAmount: number;
  tradingPairs: TradingPair[];

  setSelectedSymbol: (symbol: string) => void;
  setCurrentPrice: (price: number) => void;
  setKlineData: (candles: Candle[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRiskAmount: (amount: number) => void;
  setTradingPairs: (pairs: TradingPair[]) => void;
  updateLatestCandle: (candle: Candle) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedSymbol: "BTCUSDT",
  currentPrice: 0,
  klineData: [],
  connectionStatus: "disconnected",
  riskAmount: 100,
  tradingPairs: [],

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setCurrentPrice: (price) => set({ currentPrice: price }),
  setKlineData: (candles) => set({ klineData: candles }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setRiskAmount: (amount) => set({ riskAmount: amount }),
  setTradingPairs: (pairs) => set({ tradingPairs: pairs }),
  updateLatestCandle: (candle) =>
    set((state) => {
      const isNew = !state.klineData.some((c) => c.openTime === candle.openTime);
      const updatedKlines = isNew
        ? [...state.klineData, candle]
        : state.klineData.map((c) => c.openTime === candle.openTime ? candle : c);
      return { klineData: updatedKlines.slice(-200) };
    }),
}));

const BUFFER = 0.001; // 0.1% buffer below each level
const SEPARATION = 0.97; // 3% minimum separation between levels

const LEVEL_CONFIG = [
  { label: "Tight", color: "#fb7185", description: "Recent low (12h)" },
  { label: "Standard", color: "#fbbf24", description: "Consolidation floor" },
  { label: "Wide", color: "#34d399", description: "Major structural low" },
] as const;

const FALLBACK_PERCENTS = [0.02, 0.05, 0.10];

// --- Structural cache ---
let structuralCacheKey = "";
let structuralCacheValue: { tight: number; standard: number; wide: number } | null = null;

function buildCacheKey(klineData: Candle[]): string {
  if (klineData.length === 0) return "";
  return `${klineData.length}:${klineData[0].openTime}:${klineData[klineData.length - 1].openTime}`;
}

// --- Hardened min-low scanner ---
function minLowInRange(candles: Candle[], from: number, to: number): number | null {
  const start = Math.max(0, from);
  const end = Math.min(candles.length, to);
  if (start >= end) return null;

  let lowest = candles[start].low;
  for (let i = start + 1; i < end; i++) {
    if (candles[i].low < lowest) lowest = candles[i].low;
  }
  return lowest;
}

function calcPercent(current: number, stop: number): number {
  return current > 0
    ? Math.round(((current - stop) / current) * 10000) / 100
    : 0;
}

function computeStructuralLevels(klineData: Candle[]): { tight: number; standard: number; wide: number } | null {
  const len = klineData.length;

  // Tight: lowest low of last 12 candles
  const tightRaw = minLowInRange(klineData, len - 12, len);
  if (tightRaw === null) return null;
  let tight = tightRaw * (1 - BUFFER);

  // Standard: absolute floor of consolidation base (index -60 to -10)
  const stdFrom = Math.max(0, len - 60);
  const stdTo = Math.max(stdFrom + 1, len - 10);
  const stdRaw = minLowInRange(klineData, stdFrom, stdTo);
  let standard = stdRaw !== null ? stdRaw * (1 - BUFFER) : tight * SEPARATION;

  // Strict inversion guard: standard must be at least 3% below tight
  if (standard >= tight * SEPARATION) {
    standard = tight * SEPARATION;
  }

  // Wide: absolute lowest low across entire history
  const wideRaw = minLowInRange(klineData, 0, len);
  let wide = wideRaw !== null ? wideRaw * (1 - BUFFER) : standard * SEPARATION;

  // Strict inversion guard: wide must be at least 3% below standard
  if (wide >= standard * SEPARATION) {
    wide = standard * SEPARATION;
  }

  return { tight, standard, wide };
}

export function computeStopLevels(
  price: number | null | undefined,
  klineData: Candle[] = []
): StopLevel[] {
  const safePrice = price && price > 0 ? price : 0;
  const len = klineData.length;

  let tightPrice: number;
  let standardPrice: number;
  let widePrice: number;

  if (len >= 12) {
    // Check structural cache
    const cacheKey = buildCacheKey(klineData);
    let structural: { tight: number; standard: number; wide: number } | null;

    if (cacheKey === structuralCacheKey && structuralCacheValue !== null) {
      structural = structuralCacheValue;
    } else {
      structural = computeStructuralLevels(klineData);
      structuralCacheKey = cacheKey;
      structuralCacheValue = structural;
    }

    if (structural) {
      tightPrice = structural.tight;
      standardPrice = structural.standard;
      widePrice = structural.wide;
    } else {
      // Structural scan failed — use fallback percents
      tightPrice = safePrice * (1 - FALLBACK_PERCENTS[0]);
      standardPrice = safePrice * (1 - FALLBACK_PERCENTS[1]);
      widePrice = safePrice * (1 - FALLBACK_PERCENTS[2]);
    }
  } else {
    // Not enough data — use fallback percents
    tightPrice = safePrice * (1 - FALLBACK_PERCENTS[0]);
    standardPrice = safePrice * (1 - FALLBACK_PERCENTS[1]);
    widePrice = safePrice * (1 - FALLBACK_PERCENTS[2]);
  }

  const stops = [tightPrice, standardPrice, widePrice];

  return LEVEL_CONFIG.map((config, i) => ({
    label: config.label,
    percent: calcPercent(safePrice, stops[i]),
    price: stops[i],
    color: config.color,
    description: config.description,
  }));
}
