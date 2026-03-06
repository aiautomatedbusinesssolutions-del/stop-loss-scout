"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatUSD } from "@/lib/format";
import { EDUCATION_UI } from "@/constants/content";

export default function AccountSizeCalc() {
  const [accountSize, setAccountSize] = useState(10000);
  const setRiskAmount = useStore((s) => s.setRiskAmount);
  const riskAmount = useStore((s) => s.riskAmount);

  const risk1 = accountSize * 0.01;
  const risk2 = accountSize * 0.02;

  return (
    <div className="rounded-xl border border-sky-500/20 bg-slate-950/60 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-sky-400" />
        <h4 className="text-sm font-semibold text-slate-200">
          {EDUCATION_UI.calculatorTitle}
        </h4>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">
          {EDUCATION_UI.accountSizeLabel}
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
          <span className="text-slate-400">$</span>
          <input
            type="number"
            min={0}
            value={accountSize}
            onChange={(e) => {
              const val = e.currentTarget.valueAsNumber;
              setAccountSize(Number.isFinite(val) && val >= 0 ? val : 0);
            }}
            className="w-full bg-transparent text-slate-100 text-sm font-mono outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Account size in USD"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">1% Rule (conservative)</span>
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-emerald-400">
              {formatUSD(risk1)}
            </span>
            <button
              onClick={() => setRiskAmount(risk1)}
              className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              {EDUCATION_UI.useLabel}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">2% Rule (moderate)</span>
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-amber-400">
              {formatUSD(risk2)}
            </span>
            <button
              onClick={() => setRiskAmount(risk2)}
              className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              {EDUCATION_UI.useLabel}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {EDUCATION_UI.currentRiskLabel}{" "}
        <span className="font-mono tabular-nums text-slate-300">
          {formatUSD(riskAmount)}
        </span>
      </p>
    </div>
  );
}
