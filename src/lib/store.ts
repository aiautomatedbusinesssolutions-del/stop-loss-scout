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

export function computeStopLevels(price: number | null | undefined): StopLevel[] {
  const safePrice = price && price > 0 ? price : 0;

  return [
    {
      label: "Tight",
      percent: 2,
      price: safePrice * 0.98,
      color: "#fb7185",
      description: "For active traders",
    },
    {
      label: "Standard",
      percent: 5,
      price: safePrice * 0.95,
      color: "#fbbf24",
      description: "Balanced approach",
    },
    {
      label: "Wide",
      percent: 8,
      price: safePrice * 0.92,
      color: "#34d399",
      description: "For swing traders",
    },
  ];
}
