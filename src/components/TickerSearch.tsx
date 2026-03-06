"use client";

import { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  connected: "bg-emerald-400",
  connecting: "bg-amber-400",
  disconnected: "bg-slate-500",
  error: "bg-rose-400",
};

const MAX_RESULTS = 8;

export default function TickerSearch() {
  const listboxId = useId();
  const tradingPairs = useStore((s) => s.tradingPairs);
  const selectedSymbol = useStore((s) => s.selectedSymbol);
  const connectionStatus = useStore((s) => s.connectionStatus);
  const setSelectedSymbol = useStore((s) => s.setSelectedSymbol);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const upper = query.toUpperCase();
    return tradingPairs
      .filter(
        (p) =>
          p.symbol.includes(upper) ||
          p.baseAsset.includes(upper)
      )
      .slice(0, MAX_RESULTS);
  }, [query, tradingPairs]);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectPair = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [setSelectedSymbol]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectPair(filtered[highlightIndex].symbol);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const showDropdown = isOpen && filtered.length > 0;
  const statusColor = STATUS_COLORS[connectionStatus] ?? STATUS_COLORS.disconnected;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search coin (e.g. BTC, ETH)..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none"
          aria-label="Search trading pairs"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-activedescendant={
            showDropdown && highlightIndex >= 0
              ? `${listboxId}-option-${highlightIndex}`
              : undefined
          }
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {selectedSymbol.replace("USDT", "")}
          </span>
          <div
            className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
            title={connectionStatus}
            aria-label={`Connection status: ${connectionStatus}`}
          />
        </div>
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Trading pairs"
          className="absolute z-50 mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-lg animate-fade-in-fast"
        >
          {filtered.map((pair, i) => (
            <li
              key={pair.symbol}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === highlightIndex}
              className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === highlightIndex
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
              onMouseDown={() => selectPair(pair.symbol)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span className="font-medium">{pair.baseAsset}</span>
              <span className="text-slate-500 text-xs">{pair.symbol}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
