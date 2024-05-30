import { CustomError } from "@backend/utils/customError.ts";
import { WebSocket } from "ws";
import { Assets, AssetsJSON } from "./assetTypes.ts";
import { SimulationStateJSON } from "./simulationTypes.ts";

/**
 * Maps clientIds (created by server) to WebSocket objects which represent a
 * connection to a client.
 */
export type WebsocketClients = Map<string, WebSocket>;

export enum ClientMessageType {
  PING = "PING",
  PLAYER_VISIT = "PLAYER_VISIT",
}

export enum ServerMessageType {
  PONG = "PONG",
  SIM_STATE_ASSETS = "ASSETS",
  WELCOME = "WELCOME",
}

export interface ClientWebsocketMessage {
  type: ClientMessageType;
}

export function isClientWebsocketMessage(
  obj: Object
): obj is ClientWebsocketMessage {
  return (obj as ClientWebsocketMessage).type !== undefined;
}
export interface ServerWebsocketMessage {
  type: ServerMessageType;
}
export function isServerWebsocketMessage(
  obj: Object
): obj is ServerWebsocketMessage {
  return (obj as ServerWebsocketMessage).type !== undefined;
}

export interface PingMsg extends ClientWebsocketMessage {
  type: ClientMessageType.PING;
}
export function isPingMsg(obj: ClientWebsocketMessage): obj is PingMsg {
  return (obj as ClientWebsocketMessage).type === ClientMessageType.PING;
}

export interface PongMsg extends ServerWebsocketMessage {
  type: ServerMessageType.PONG;
}
export function isPongMsg(obj: ServerWebsocketMessage): obj is PongMsg {
  return (obj as ServerWebsocketMessage).type === ServerMessageType.PONG;
}

export interface PlayerVisitMsg extends ClientWebsocketMessage {
  type: ClientMessageType.PLAYER_VISIT;
  playerId: string | null;
}
export function isPlayerVisitMsg(
  obj: ClientWebsocketMessage
): obj is PlayerVisitMsg {
  return (
    obj.type === ClientMessageType.PLAYER_VISIT &&
    (obj as PlayerVisitMsg).playerId !== undefined
  );
}

export interface WelcomeServerMsg extends ServerWebsocketMessage {
  type: ServerMessageType.WELCOME;
  text: string;
}
export function isWelcomeServerMsg(
  obj: ServerWebsocketMessage
): obj is WelcomeServerMsg {
  return (
    obj.type === ServerMessageType.WELCOME &&
    (obj as WelcomeServerMsg).text !== undefined
  );
}

/**
 * Server send simulation state and assets
 */
export interface SimStateAssetsServerMsg extends ServerWebsocketMessage {
  type: ServerMessageType.SIM_STATE_ASSETS;
  simulationState: SimulationStateJSON;
  assets: AssetsJSON;
}

export function isSimStateAssetsServerMsg(
  obj: ServerWebsocketMessage
): obj is SimStateAssetsServerMsg {
  return (
    obj.type === ServerMessageType.SIM_STATE_ASSETS &&
    (obj as SimStateAssetsServerMsg).simulationState !== undefined &&
    (obj as SimStateAssetsServerMsg).assets !== undefined
  );
}

/**
 * Asserts that a WebSocketRequest object is of a certain type. Else throws an error.
 * @param request
 * @param WSReqTypeGuard
 * @returns
 */
export function assertWSReqType<T extends ClientWebsocketMessage>(
  request: ClientWebsocketMessage,
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
