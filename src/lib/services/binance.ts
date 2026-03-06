import { Candle, TradingPair } from "@/types";

const BASE_URL = "https://api.binance.com/api/v3";
const REQUEST_TIMEOUT_MS = 12_000;

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new Error(`Binance request failed (${res.status}) for ${url}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Binance request timed out after ${timeoutMs}ms`);
    }
    if (error instanceof TypeError) {
      throw new Error("Network error while contacting Binance. Check internet connection.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseKline(symbol: string, row: unknown): Candle {
  if (!Array.isArray(row) || row.length < 6) {
    throw new Error(`Invalid kline row format for ${symbol}`);
  }

  const openTime = Number(row[0]);
  const open = Number(row[1]);
  const high = Number(row[2]);
  const low = Number(row[3]);
  const close = Number(row[4]);
  const volume = Number(row[5]);

  if (![openTime, open, high, low, close, volume].every(Number.isFinite)) {
    throw new Error(`Invalid kline numeric data for ${symbol}`);
  }

  return { openTime, open, high, low, close, volume };
}

export async function getExchangeInfo(): Promise<TradingPair[]> {
  const data = await fetchJsonWithTimeout<{
    symbols?: Array<{
      symbol: string;
      baseAsset: string;
      quoteAsset: string;
      status: string;
      isSpotTradingAllowed: boolean;
    }>;
  }>(`${BASE_URL}/exchangeInfo`);

  if (!Array.isArray(data.symbols)) {
    throw new Error("Invalid exchangeInfo payload from Binance");
  }

  return data.symbols
    .filter(
      (s) =>
        s.quoteAsset === "USDT" &&
        s.status === "TRADING" &&
        s.isSpotTradingAllowed
    )
    .map((s) => ({
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
    }));
}

export async function getKlines(symbol: string): Promise<Candle[]> {
  const encodedSymbol = encodeURIComponent(symbol);
  const data = await fetchJsonWithTimeout<unknown>(
    `${BASE_URL}/klines?symbol=${encodedSymbol}&interval=1h&limit=200`
  );

  if (!Array.isArray(data)) {
    throw new Error(`Invalid klines payload for ${symbol}: expected array`);
  }

  return data.map((row) => parseKline(symbol, row));
}
