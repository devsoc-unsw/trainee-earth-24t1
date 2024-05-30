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
  CreateVillagerWSReq,
  isCreateVillagerWSReq,
  PingMsg,
  PlayerVisitMsg,
  WebsocketClients,
  PongMsg,
  ServerMessageType,
  WelcomeServerMsg,
} from "@backend/types/wsTypes.ts";
const WS_URL = "ws://127.0.0.1:3000";

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
    case ClientMessageType.CREATE_VILLAGER:
      console.log(`Handle wsrequest was CREATE_VILLAGER`);
      if (assertWSReqType<CreateVillagerWSReq>(request, isCreateVillagerWSReq)) {
        const { eye, hair, outfit } = request;

        const villagerAsset = {
          getRemoteImages: () => [{ url: `${WS_URL}/gen/villager?eye=${eye}&hair=${hair}&outfit=${outfit}` }]
        }

        ws.send(JSON.stringify({ type: 'VILLAGER_CREATED', payload: villagerAsset.getRemoteImages().at(-1).url }));
      }
    // ADD NEW WEBSOCKET REQUEST TYPES HERE
    default:
      throw new InvalidWSRequestSubTypeError();
  }
};

export const handleDisconnect = (userId: string, clients: WebsocketClients) => {
  console.log(`${userId} disconnected.`);
  clients.delete(userId);
};
