import { ClientMessageType } from "@backend/types/wsTypes";
import { useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WS_URL = "ws://127.0.0.1:3000";

/**
 * @deprecated We are using plain WebSocket browser API. See WorldMap.tsx
 */
const WSBox = () => {
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<ClientMessageType>(WS_URL, {
      share: true,
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      onOpen: () => {
        console.log("WebSocket connection established.");
      },
      onClose: () => {
        console.log("WebSocket connection closed.");
      },
    });

  useEffect(() => {
    if (lastJsonMessage) {
      console.log(`Received ws message:`, lastJsonMessage);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      console.log("WebSocket connection is open. Send PING message.");
      sendJsonMessage({ type: "PING" });
    }
  }, [sendJsonMessage, readyState]);

  useEffect(() => {
    console.log(`readyState changed to: ${readyState}`);
  }, [readyState]);

  return <div>WebSocket Box</div>;
};
export default WSBox;
