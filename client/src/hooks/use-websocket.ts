import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket(walletAddress?: string) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!walletAddress) return;
    
    // Connect to WebSocket server on /ws path
    // Use location.host to get correct host:port
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${location.host}/ws`;
    
    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case "transaction":
            // Invalidate transactions query to refetch
            queryClient.invalidateQueries({ queryKey: ["/api/transactions", walletAddress] });
            break;
            
          case "threat_detected":
            // Could show toast notification
            console.log("Threat detected:", message.data);
            break;
            
          case "bot_update":
            // Invalidate bots query
            queryClient.invalidateQueries({ queryKey: ["/api/arbitrage-bots", walletAddress] });
            break;
            
          case "tier_update":
            // Invalidate wallet query
            queryClient.invalidateQueries({ queryKey: ["/api/wallets", walletAddress] });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [walletAddress, queryClient]);
  
  return { connected, ws: wsRef.current };
}
