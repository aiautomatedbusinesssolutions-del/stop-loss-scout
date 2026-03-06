"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from "lightweight-charts";
import { useStore } from "@/lib/store";
import { computeStopLevels } from "@/lib/store";
import { formatPrice } from "@/lib/format";

const STOP_LEVEL_CONFIG = [
  { label: "Tight -2%", color: "#fb7185" },
  { label: "Standard -5%", color: "#fbbf24" },
  { label: "Wide -8%", color: "#34d399" },
];

export default function PriceChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const priceLinesRef = useRef<ReturnType<ISeriesApi<SeriesType>["createPriceLine"]>[]>([]);

  const klineData = useStore((s) => s.klineData);
  const currentPrice = useStore((s) => s.currentPrice);
  const selectedSymbol = useStore((s) => s.selectedSymbol);

  // Create chart once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      width: containerRef.current.clientWidth,
      height: window.innerWidth < 640 ? 300 : 450,
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#334155" },
      timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        barSpacing: window.innerWidth < 640 ? 4 : 6,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#fb7185",
      borderUpColor: "#34d399",
      borderDownColor: "#fb7185",
      wickUpColor: "#34d399",
      wickDownColor: "#fb7185",
    });

    candleSeriesRef.current = candleSeries as unknown as ISeriesApi<SeriesType>;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: window.innerWidth < 640 ? 300 : 450,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
        priceLinesRef.current = [];
      }
    };
  }, []);

  // Clear chart data immediately on symbol change to prevent ghost data
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    candleSeriesRef.current.setData([]);

    for (const line of priceLinesRef.current) {
      candleSeriesRef.current.removePriceLine(line);
    }
    priceLinesRef.current = [];
  }, [selectedSymbol]);

  // Update candle data when klineData changes
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    if (klineData.length === 0) return;

    const chartData = klineData.map((c) => ({
      time: (c.openTime / 1000) as import("lightweight-charts").UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeriesRef.current.setData(chartData);
    chartRef.current?.timeScale().scrollToRealTime();
  }, [klineData]);

  // Update stop-loss price lines when currentPrice changes
  useEffect(() => {
    if (!candleSeriesRef.current || currentPrice <= 0) return;

    // Remove old price lines
    for (const line of priceLinesRef.current) {
      candleSeriesRef.current.removePriceLine(line);
    }
    priceLinesRef.current = [];

    const stopLevels = computeStopLevels(currentPrice);

    stopLevels.forEach((level, i) => {
      const config = STOP_LEVEL_CONFIG[i];
      const priceLine = candleSeriesRef.current!.createPriceLine({
        price: level.price,
        color: config.color,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: config.label,
      });
      priceLinesRef.current.push(priceLine);
    });
  }, [currentPrice]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">
          {selectedSymbol.replace("USDT", " / USDT")} — 1H
        </h2>
        {currentPrice > 0 && (
          <span className="text-sm font-mono text-slate-100">
            ${formatPrice(currentPrice)}
          </span>
        )}
      </div>
      <div ref={containerRef} />
    </div>
  );
}
