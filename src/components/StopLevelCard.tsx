"use client";

import { StopLevel } from "@/types";
import { formatPrice, formatUSD, formatCoinAmount } from "@/lib/format";

interface StopLevelCardProps {
  level: StopLevel;
  currentPrice: number;
  riskAmount: number;
  baseAsset: string;
}

export default function StopLevelCard({
  level,
  currentPrice,
  riskAmount,
  baseAsset,
}: StopLevelCardProps) {
  const distance = currentPrice - level.price;
  const positionSize = distance > 0 ? riskAmount / distance : 0;
  const positionValue = positionSize * currentPrice;

  return (
    <div className="min-h-[220px] rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: level.color }}
          />
          <h3 className="text-sm font-semibold text-slate-100">{level.label}</h3>
        </div>
        <span className="text-xs text-slate-400">{level.description}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Stop Price</span>
          <span className="font-mono tabular-nums text-slate-200">${formatPrice(level.price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Distance</span>
          <span className="font-mono tabular-nums" style={{ color: level.color }}>
            -{level.percent}%
          </span>
        </div>

        {currentPrice > 0 && riskAmount > 0 && (
          <>
            <div className="my-2 border-t border-slate-800" />
            <div className="flex justify-between">
              <span className="text-slate-400">Position Size</span>
              <span className="font-mono tabular-nums text-slate-200">
                {formatCoinAmount(positionSize)} {baseAsset}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Position Value</span>
              <span className="font-mono tabular-nums text-slate-200">
                {formatUSD(positionValue)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
