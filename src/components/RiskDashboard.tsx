"use client";

import { useMemo } from "react";
import { DollarSign } from "lucide-react";
import { useStore } from "@/lib/store";
import { computeStopLevels } from "@/lib/store";
import { formatCoinAmount, formatUSD } from "@/lib/format";
import StopLevelCard from "./StopLevelCard";

const MAX_RISK_AMOUNT = 1_000_000;

export default function RiskDashboard() {
  const currentPrice = useStore((s) => s.currentPrice);
  const klineData = useStore((s) => s.klineData);
  const riskAmount = useStore((s) => s.riskAmount);
  const selectedSymbol = useStore((s) => s.selectedSymbol);
  const setRiskAmount = useStore((s) => s.setRiskAmount);

  const baseAsset = selectedSymbol.replace("USDT", "");

  const stopLevels = useMemo(
    () => computeStopLevels(currentPrice, klineData, selectedSymbol),
    [currentPrice, klineData, selectedSymbol]
  );

  // "Aha moment" — standard stop (index 1) summary
  const standardLevel = stopLevels[1];
  const standardDistance =
    standardLevel && currentPrice > 0
      ? currentPrice - standardLevel.price
      : 0;
  const standardPositionSize =
    standardDistance > 0 ? riskAmount / standardDistance : 0;
  const standardPositionValue = standardPositionSize * currentPrice;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
          <DollarSign className="h-4 w-4 text-amber-400" />
          How much are you willing to lose?
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
          <span className="text-slate-400">$</span>
          <input
            type="number"
            min={0}
            step={10}
            value={riskAmount}
            onChange={(e) => {
              const val = e.currentTarget.valueAsNumber;
              setRiskAmount(Number.isFinite(val) ? Math.min(Math.max(val, 0), MAX_RISK_AMOUNT) : 0);
            }}
            className="w-full bg-transparent text-slate-100 text-sm font-mono outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Risk amount in USD"
          />
        </div>

        {currentPrice > 0 && riskAmount > 0 && standardDistance > 0 && (
          <p className="mt-3 text-sm text-slate-400">
            Risking{" "}
            <span className="font-semibold text-amber-400">
              {formatUSD(riskAmount)}
            </span>{" "}
            → buy{" "}
            <span className="font-semibold text-emerald-400">
              {formatCoinAmount(standardPositionSize)} {baseAsset}
            </span>{" "}
            (
            <span className="text-slate-300">
              {formatUSD(standardPositionValue)} position
            </span>
            ) with standard stop
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stopLevels.map((level) => (
          <StopLevelCard
            key={level.label}
            level={level}
            currentPrice={currentPrice}
            riskAmount={riskAmount}
            baseAsset={baseAsset}
          />
        ))}
      </div>
    </div>
  );
}
