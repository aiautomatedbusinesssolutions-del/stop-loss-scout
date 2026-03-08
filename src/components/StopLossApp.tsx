"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { getExchangeInfo, getKlines } from "@/lib/services/binance";
import { useBinanceStream } from "@/hooks/useBinanceStream";
import TickerSearch from "./TickerSearch";
import PriceChart from "./PriceChart";
import RiskDashboard from "./RiskDashboard";
import EducationSection from "./education/EducationSection";

export default function StopLossApp() {
  const selectedSymbol = useStore((s) => s.selectedSymbol);
  const setTradingPairs = useStore((s) => s.setTradingPairs);
  const setKlineData = useStore((s) => s.setKlineData);
  const setCurrentPrice = useStore((s) => s.setCurrentPrice);

  const [isPairsLoading, setIsPairsLoading] = useState(true);
  const [pairsError, setPairsError] = useState<string | null>(null);

  const klineRequestIdRef = useRef(0);

  // Activate WebSocket stream
  useBinanceStream();

  // Load trading pairs on mount
  useEffect(() => {
    getExchangeInfo()
      .then(setTradingPairs)
      .catch((err) => {
        setPairsError(err instanceof Error ? err.message : "Failed to load trading pairs");
      })
      .finally(() => setIsPairsLoading(false));
  }, [setTradingPairs]);

  // Load historical klines on symbol change
  useEffect(() => {
    if (!selectedSymbol) return;

    const requestId = ++klineRequestIdRef.current;

    setKlineData([]);
    setCurrentPrice(0);

    getKlines(selectedSymbol)
      .then((candles) => {
        if (requestId !== klineRequestIdRef.current) return;
        setKlineData(candles);
        // Only seed price from historical data if live price hasn't arrived yet
        const livePrice = useStore.getState().currentPrice;
        if (livePrice === 0 && candles.length > 0) {
          setCurrentPrice(candles[candles.length - 1].close);
        }
      })
      .catch(() => {});
  }, [selectedSymbol, setKlineData, setCurrentPrice]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <TickerSearch />
      </div>

      {isPairsLoading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading trading pairs...</span>
        </div>
      )}

      {pairsError && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-slate-900 p-8 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">{pairsError}</span>
        </div>
      )}

      {!isPairsLoading && !pairsError && (
        <>
          <PriceChart />
          <RiskDashboard />
          <EducationSection />
        </>
      )}
    </div>
  );
}
