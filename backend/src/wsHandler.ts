import { WebSocket } from "ws";
import {
  isClientWebsocketMessage,
  InvalidWSRequestTypeError,
  InvalidWSRequestSubTypeError,
  ClientWebsocketMessage,
  isPingMsg,
  isPlayerVisitMsg,
  ClientMessageType,
  assertWSReqType,
  PingMsg,
  PlayerVisitMsg,
  WebsocketClients,
  PongMsg,
  ServerMessageType,
  WelcomeServerMsg,
} from "@backend/types/wsTypes.ts";

/**
 * Handles a WebSocket request by parsing the request and performing the appropriate action.
 *
 * @param {ClientWebsocketMessage} request - The WebSocket request (JSON object).
 * @param {WebSocket} ws - The WebSocket connection.
 * @throws {SyntaxError} If the request is not in the expected format.
 * @throws {InvalidWSRequestTypeError} If the request type is not recognized.
 */
export const handleClientMessage = (
  request: ClientWebsocketMessage,
  ws: WebSocket
) => {
  /**
   * Ensures the request provided by the client is in the format:
   * { "type": "something" }
   * Subject to change - consult WebSocketRequest type.
   */
  if (!isClientWebsocketMessage(request)) {
    throw new InvalidWSRequestTypeError();
  }

  console.log(`Handle ws message: ${JSON.stringify(request)}`);

  /**
   * Follow different strategies depending on what
   * the client wants from the server and send back the response.
   */
  switch (request.type) {
    case ClientMessageType.PING:
      console.log(`Handle wsreq as PING`);
      if (assertWSReqType<PingMsg>(request, isPingMsg)) {
        ws.send(JSON.stringify({ type: "PONG" }));
      }
      break;
    case ClientMessageType.PLAYER_VISIT:
      console.log(`Handle wsreq as PLAYER_VISIT`);
      if (assertWSReqType<PlayerVisitMsg>(request, isPlayerVisitMsg)) {
        const playerId = request.playerId;
        ws.send(
          JSON.stringify({
            type: ServerMessageType.WELCOME,
            text: `Welcome ${playerId}`,
          } as WelcomeServerMsg)
        );
      }
      break;
    // ADD NEW WEBSOCKET REQUEST TYPES HERE
    default:
      throw new InvalidWSRequestSubTypeError();
  }
};

export const handleDisconnect = (userId: string, clients: WebsocketClients) => {
  console.log(`${userId} disconnected.`);
  clients.delete(userId);
};
