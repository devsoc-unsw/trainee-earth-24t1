import assert from "assert";

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

export class InvalidWSRequestTypeError extends Error {
  name: string;

  constructor(message?: string) {
    super(message);
    // set error name as constructor name, make it not enumerable to keep native Error behavior
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target#new.target_in_constructors
    // see https://github.com/adriengibrat/ts-custom-error/issues/30
    Object.defineProperty(this, "name", {
      value: new.target.name,
      enumerable: false,
      configurable: true,
    });
    // fix the extended error prototype chain
    // because typescript __extends implementation can't
    // see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    const setPrototypeOf: Function = (Object as any).setPrototypeOf;
    setPrototypeOf
      ? setPrototypeOf(this, new.target.prototype)
      : ((this as any).__proto__ = new.target.prototype);

    // try to remove contructor from stack trace
    const captureStackTrace: Function = (Error as any).captureStackTrace;
    captureStackTrace && captureStackTrace(this, new.target.constructor);
  }
}
