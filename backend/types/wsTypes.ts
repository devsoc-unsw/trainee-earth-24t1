import { CustomError } from "@backend/utils/customError.ts";

/**
 * Maps clientIds (created by server) to WebSocket objects which represent a
 * connection to a client.
 */
export type WSClients = Map<string, WebSocket>;

export enum ClientRequestType {
  PING = "PING",
  PLAYER_VISIT = "PLAYER_VISIT",
}

export interface WebSocketRequest {
  type: ClientRequestType;
}

export interface PingWSReq extends WebSocketRequest {
  type: ClientRequestType.PING;
}

export interface PlayerVisitWSReq extends WebSocketRequest {
  type: ClientRequestType.PLAYER_VISIT;
  playerId: string | null;
}

export function isWebSocketRequest(obj: Object): obj is WebSocketRequest {
  return (obj as WebSocketRequest).type !== undefined;
}

export function isPingWSReq(obj: WebSocketRequest): obj is PingWSReq {
  return (obj as WebSocketRequest).type === ClientRequestType.PING;
}

export function isPlayerVisitWSReq(
  obj: WebSocketRequest
): obj is PlayerVisitWSReq {
  return (
    obj.type === ClientRequestType.PLAYER_VISIT &&
    (obj as PlayerVisitWSReq).playerId !== undefined
  );
}

export function assertWSReqType<T extends WebSocketRequest>(
  request: WebSocketRequest,
  WSReqTypeGuard: (obj: Object) => obj is T
): request is T {
  if (WSReqTypeGuard(request)) {
    request;
    return true;
  } else {
    throw new BadlyFormattedWSTypeError(
      `Object is verified to be a valid WebSocketRequst object, but did not satify typeguard ${WSReqTypeGuard.name}. Either change the typeguard or get client to provide an object that satifies the typeguard. Value of request: ${request}`
    );
  }
}

export class WSTypeError extends CustomError {
  // A user-friendly error message to send back to the client
  errMsgForClient: string;
  public constructor(message: string, errMsgForClient: string) {
    super(message);
    this.errMsgForClient = errMsgForClient;
  }
}

export class InvalidWSRequestTypeError extends WSTypeError {
  public constructor(
    message: string = `Invalid WebSocketRequest object; does not align with format { "type": "PING" } with a valid RequestType enum value for the type Get client to provide a valid object.`,
    errMsgForClient: string = `Invalid WebSocketRequest object; please align with format { "type": "PING" } with a valid RequestType enum value for the type. Don't forget - json only supports double quotes`
  ) {
    super(message, errMsgForClient);
  }
}
export class InvalidWSRequestSubTypeError extends WSTypeError {
  public constructor(
    message: string = `Invalid WebSocketRequest type value. Does not have a valid ClientRequestType. Either add new ClientRequestType or get client to use an existing one. See ClientRequestType in rc/types/wsTypes.ts.`,
    errMsgForClient: string = `Invalid WebSocketRequest type value. Please use a valid type such as "PING" or "PLAYER_VISIT". Don't forget - json only supports double quotes.`
  ) {
    super(message, errMsgForClient);
  }
}

export class BadlyFormattedWSTypeError extends WSTypeError {
  public constructor(
    message?: string,
    errMsgForClient: string = `Badly formatted WebSocketRequest subtype object. Please provide an object that aligns with one of the WebSocketRequest subtypes in src/types/wsTypes.ts`
  ) {
    super(message, errMsgForClient);
  }
}
