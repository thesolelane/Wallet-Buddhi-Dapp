import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type ServerEvent =
  | { type: "hello" }
  | { type: "purchase"; walletId: string; token: unknown }
  | { type: "alert"; walletId: string; alert: unknown };

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const msg: ServerEvent = JSON.parse(event.data);
        if (msg.type === "purchase") {
          queryClient.invalidateQueries({ queryKey: [`/api/wallets/${msg.walletId}/tokens`] });
        } else if (msg.type === "alert") {
          queryClient.invalidateQueries({ queryKey: [`/api/wallets/${msg.walletId}/alerts`] });
        }
      } catch (err) {
        console.error("WebSocket parse error", err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [queryClient]);

  return { connected };
}
