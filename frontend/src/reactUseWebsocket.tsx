import { MessageTypes } from "@backend/types/wsTypes.ts";
import { useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WS_URL = "ws://127.0.0.1:3000";

const WSBox = () => {
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<MessageTypes>(WS_URL, {
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

  return <div>WebSocket Box{lastJsonMessage?.type ?? "none"}</div>;
};
export default WSBox;
