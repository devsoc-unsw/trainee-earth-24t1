import assert from "assert";
import { CustomError } from "utils/customError.ts";

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
    throw {
      name: "BadlyFormattedWSTypeError",
      message: `Expected request to satify typeguard ${WSReqTypeGuard.name}. Value of request: ${request}`,
    };
  }
}

export class InvalidWSRequestTypeError extends CustomError {
  public constructor(
    message: string = `Invalid WebSocketRequest object; does not align with format { "type": "PING" } with a valid RequestType enum value for the type. Don't forget - json only supports double quotes`
  ) {
    super(message);
  }
}
export class InvalidWSRequestSubTypeError extends CustomError {
  public constructor(
    message: string = `Invalid WebSocketRequest subtype object. Does not have a valid RequestType enum value for the type or does not align with one of the WebSocketRequest subtypes in src/types/wsTypes.ts`
  ) {
    super(message);
  }
}
