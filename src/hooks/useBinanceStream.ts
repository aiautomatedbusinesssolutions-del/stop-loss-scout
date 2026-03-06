"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { createBinanceStream } from "@/lib/services/websocket";

export function useBinanceStream() {
  const selectedSymbol = useStore((s) => s.selectedSymbol);
  const setCurrentPrice = useStore((s) => s.setCurrentPrice);
  const setConnectionStatus = useStore((s) => s.setConnectionStatus);
  const updateLatestCandle = useStore((s) => s.updateLatestCandle);

  useEffect(() => {
    if (!selectedSymbol) return;

    const stream = createBinanceStream(selectedSymbol, {
      onPrice: setCurrentPrice,
      onKline: updateLatestCandle,
      onStatusChange: setConnectionStatus,
    });

    return () => {
      stream.destroy();
      setConnectionStatus("disconnected");
    };
  }, [selectedSymbol, setCurrentPrice, setConnectionStatus, updateLatestCandle]);
}
