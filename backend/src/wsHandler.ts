import { WebSocket } from "ws";
import {
  isWebSocketRequest,
  InvalidWSRequestTypeError,
  InvalidWSRequestSubTypeError,
  WebSocketRequest,
  isPingWSReq,
  isPlayerVisitWSReq,
  ClientRequestType,
  assertWSReqType,
  PingWSReq,
  PlayerVisitWSReq,
  WSClients,
} from "@backend/types/wsTypes.ts";

/**
 * Handles a WebSocket request by parsing the request and performing the appropriate action.
 *
 * @param {WebSocketRequest} request - The WebSocket request (JSON object).
 * @param {WebSocket} ws - The WebSocket connection.
 * @throws {SyntaxError} If the request is not in the expected format.
 * @throws {InvalidWSRequestTypeError} If the request type is not recognized.
 */
export const handleWSRequest = (request: WebSocketRequest, ws: WebSocket) => {
  /**
   * Ensures the request provided by the client is in the format:
   * { "type": "something" }
   * Subject to change - consult WebSocketRequest type.
   */
  if (!isWebSocketRequest(request)) {
    throw new InvalidWSRequestTypeError();
  }

  console.log(`Handle ws message: ${JSON.stringify(request)}`);

  /**
   * Follow different strategies depending on what
   * the client wants from the server and send back the response.
   */
  switch (request.type) {
    case ClientRequestType.PING:
      console.log(`Handle wsreq as PING`);
      if (assertWSReqType<PingWSReq>(request, isPingWSReq)) {
        ws.send(JSON.stringify({ res: "PONG" }));
      }
      break;
    case ClientRequestType.PLAYER_VISIT:
      console.log(`Handle wsreq as PLAYER_VISIT`);
      if (assertWSReqType<PlayerVisitWSReq>(request, isPlayerVisitWSReq)) {
        const playerId = request.playerId;
        ws.send(JSON.stringify({ res: `Welcome back ${playerId}` }));
      }
      break;
    // ADD NEW WEBSOCKET REQUEST TYPES HERE
    default:
      throw new InvalidWSRequestSubTypeError();
  }
};

export const handleDisconnect = (userId: string, clients: WSClients) => {
  console.log(`${userId} disconnected.`);
  delete clients[userId];
};
