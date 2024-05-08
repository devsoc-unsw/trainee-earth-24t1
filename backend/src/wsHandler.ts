import { WebSocketRequest } from './types/simulationTypes.js';

/**
 * Handles a WebSocket request by parsing the message and performing the appropriate action.
 *
 * @param {WebSocketRequest} message - The WebSocket request message (JSON object).
 * @param {WebSocket} ws - The WebSocket connection.
 * @throws {SyntaxError} If the message is not in the expected format.
 * @throws {UnrecognisedTypeError} If the message type is not recognized.
 */
export const handleWSRequest = (message: WebSocketRequest, ws: WebSocket) => {
  /**
   * Ensures the message provided by the client is in the format:
   * { "type": "something" }
   * Subject to change - consult WebSocketRequest type.
   */
  if (!message.type) {
    throw {
      name: 'SyntaxError',
      message: `invalid message; please ensure it's in the format { "type": "ping" }. don't forget - json only supports double quotes`,
    };
  }

  /**
   * Follow different strategies depending on what
   * the client wants from the server and send back the response.
   */
  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ res: 'pong' }));
      break;
    default:
      throw { name: 'UnrecognisedTypeError', message: 'invalid type value' };
  }
};
