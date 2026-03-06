import { Candle } from "@/types";

const WS_BASE = "wss://stream.binance.us:9443/stream";
const THROTTLE_MS = 500;
const BASE_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;

export interface WebSocketCallbacks {
  onPrice: (price: number) => void;
  onKline: (candle: Candle) => void;
  onStatusChange: (status: "connecting" | "connected" | "disconnected" | "error") => void;
}

export function createBinanceStream(symbol: string, callbacks: WebSocketCallbacks) {
  const lowerSymbol = symbol.toLowerCase();
  const url = `${WS_BASE}?streams=${lowerSymbol}@trade/${lowerSymbol}@kline_1h`;

  let ws: WebSocket | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  let lastPriceUpdate = 0;
  let throttledPrice: number | null = null;
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;

  function flushThrottledPrice() {
    if (throttledPrice !== null) {
      callbacks.onPrice(throttledPrice);
      throttledPrice = null;
      lastPriceUpdate = Date.now();
    }
    throttleTimer = null;
  }

  function throttlePrice(price: number) {
    const now = Date.now();
    if (now - lastPriceUpdate >= THROTTLE_MS) {
      lastPriceUpdate = now;
      callbacks.onPrice(price);
    } else {
      throttledPrice = price;
      if (!throttleTimer) {
        throttleTimer = setTimeout(flushThrottledPrice, THROTTLE_MS - (now - lastPriceUpdate));
      }
    }
  }

  function parseMessage(data: string) {
    const msg = JSON.parse(data);
    if (!msg.stream || !msg.data) return;

    if (msg.stream.endsWith("@trade")) {
      const price = parseFloat(msg.data.p);
      if (Number.isFinite(price)) {
        throttlePrice(price);
      }
    } else if (msg.stream.endsWith("@kline_1h")) {
      const k = msg.data.k;
      if (k) {
        const candle: Candle = {
          openTime: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        };
        callbacks.onKline(candle);
      }
    }
  }

  function connect() {
    if (destroyed) return;

    callbacks.onStatusChange("connecting");
    ws = new WebSocket(url);

    ws.onopen = () => {
      if (destroyed) { ws?.close(); return; }
      reconnectAttempt = 0;
      callbacks.onStatusChange("connected");
    };

    ws.onmessage = (event) => {
      try {
        parseMessage(event.data as string);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (destroyed) return;
      callbacks.onStatusChange("disconnected");
      scheduleReconnect();
    };

    ws.onerror = () => {
      if (destroyed) return;
      callbacks.onStatusChange("error");
      ws?.close();
    };
  }

  function scheduleReconnect() {
    if (destroyed) return;
    const delay = Math.min(BASE_RECONNECT_MS * Math.pow(2, reconnectAttempt), MAX_RECONNECT_MS);
    reconnectAttempt++;
    reconnectTimer = setTimeout(connect, delay);
  }

  function destroy() {
    destroyed = true;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = null; }
    throttledPrice = null;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
    }
    ws = null;
  }

  connect();

  return { destroy };
}
