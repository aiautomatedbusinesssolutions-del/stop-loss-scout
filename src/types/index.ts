export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface StopLevel {
  label: string;
  percent: number;
  price: number;
  color: string;
  description: string;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
