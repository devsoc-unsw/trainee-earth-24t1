import { WebSocket } from 'ws';
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
  GenerateRewardWSReq,
  isGenerateRewardWSReq,
} from 'types/wsTypes.ts';

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

  /**
   * Follow different strategies depending on what
   * the client wants from the server and send back the response.
   */
  switch (request.type) {
    case ClientRequestType.PING:
      console.log(`Handle wsreq as PING`);
      if (assertWSReqType<PingWSReq>(request, isPingWSReq)) {
        ws.send(JSON.stringify({ res: 'PONG' }));
      }
      break;
    case ClientRequestType.PLAYER_VISIT:
      console.log(`Handle wsreq as PLAYER_VISIT`);
      if (assertWSReqType<PlayerVisitWSReq>(request, isPlayerVisitWSReq)) {
        const playerId = request.playerId;
        ws.send(JSON.stringify({ res: `Welcome back ${playerId}` }));
      }
      break;
    case ClientRequestType.GENERATE_REWARD:
      console.log(`Handle wsreq as GENERATE_REWARD`);
      if (
        assertWSReqType<GenerateRewardWSReq>(request, isGenerateRewardWSReq)
      ) {
        // TODO: complete this stub
        // Has user generated an asset recently?
        // If yes, send NULL
        // If no, continue
        //
        // Determine which items the villager can create based on their
        // items, wealth, and pick one (or perhaps prompt the user to pick one?)
        //
        // depends on AI Image generation
        // image = generateAndProcessAsset(prompt)
        //
        // Is there a corresponding WebSocket client(s) for the villager?
        // If yes, send it to them
        // If no, add to user's unseenNewAssets[]
        ws.send(JSON.stringify({ res: `TODO` }));
      }
      break;
    // ADD NEW WEBSOCKET REQUEST TYPES HERE
    default:
      throw new InvalidWSRequestSubTypeError();
  }
};
