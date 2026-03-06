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

const LEVEL_CONFIG = [
  { label: "Tight", color: "#fb7185", description: "Recent low (12h)" },
  { label: "Standard", color: "#fbbf24", description: "Consolidation floor" },
  { label: "Wide", color: "#34d399", description: "Major structural low" },
] as const;

const FALLBACK_PERCENTS = [0.02, 0.05, 0.08];

function findLowestLowInRange(candles: Candle[], from: number, to: number): number {
  const start = Math.max(0, from);
  const end = Math.min(candles.length, to);
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

export function computeStopLevels(
  price: number | null | undefined,
  klineData: Candle[] = []
): StopLevel[] {
  const safePrice = price && price > 0 ? price : 0;
  const len = klineData.length;
  const hasStructure = len >= 12;

  let tightPrice: number;
  let standardPrice: number;
  let widePrice: number;

  if (hasStructure) {
    // Tight: lowest low of last 12 candles
    tightPrice = findLowestLowInRange(klineData, len - 12, len) * (1 - BUFFER);

    // Standard: absolute floor of the consolidation base (index -60 to -10)
    const stdFrom = Math.max(0, len - 60);
    const stdTo = Math.max(stdFrom + 1, len - 10);
    standardPrice = findLowestLowInRange(klineData, stdFrom, stdTo) * (1 - BUFFER);

    // Defensive: standard must be below tight
    if (standardPrice >= tightPrice) {
      standardPrice = tightPrice * 0.98;
    }

    // Wide: absolute lowest low across entire history
    widePrice = findLowestLowInRange(klineData, 0, len) * (1 - BUFFER);

    // Defensive: wide must be below standard
    if (widePrice >= standardPrice) {
      widePrice = standardPrice * 0.97;
    }
  } else {
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
