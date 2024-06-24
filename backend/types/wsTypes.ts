import { CustomError } from '@backend/utils/customError.ts';
import { WebSocket } from 'ws';
import { AssetJSON, AssetsJSON } from './assetTypes.ts';
import {
  EnviroObjectId,
  Pos,
  SimulationStateJSON,
  VillagerId,
} from './simulationTypes.ts';

/**
 * Maps clientIds (created by server) to WebSocket objects which represent a
 * connection to a client.
 */
export type WebsocketClients = Map<string, WebSocket>;

export enum ClientMessageType {
  PING = 'PING',
  PLAYER_VISIT = 'PLAYER_VISIT',
  CREATE_VILLAGER = 'CREATE_VILLAGER',
  MOVE_ENVIRO_OBJECT = 'MOVE_ENVIRO_OBJECT',
  VILLAGER_REACHED_PATH_POINT = 'VILLAGER_REACHED_PATH_POINT',
}

export enum ServerMessageType {
  PONG = 'PONG',
  SIM_STATE_ASSETS = 'SIM_STATE_ASSETS',
  WELCOME = 'WELCOME',
  NEW_VILLAGER_AND_HOUSE_CREATED = 'NEW_VILLAGER_CREATED',
}

// ==========================
// === Base Message types ===
// ==========================
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

// =======================
// === Client Messages ===
// =======================

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

export interface CreateVillagerServerMsg extends ClientWebsocketMessage {
  type: ClientMessageType.CREATE_VILLAGER;
  eye: string;
  hair: string;
  outfit: string;
}

export function isCreateVillagerServerMsg(
  obj: ClientWebsocketMessage
): obj is CreateVillagerServerMsg {
  return (
    obj.type === ClientMessageType.CREATE_VILLAGER &&
    (obj as CreateVillagerServerMsg).eye !== undefined &&
    (obj as CreateVillagerServerMsg).hair !== undefined &&
    (obj as CreateVillagerServerMsg).outfit !== undefined
  );
}

export interface MoveEnviroObjectClientMsg extends ClientWebsocketMessage {
  type: ClientMessageType.MOVE_ENVIRO_OBJECT;
  enviroObjectId: EnviroObjectId;
  newPos: Pos;
}
export function isMoveEnviroObjectClientMsg(
  obj: ClientWebsocketMessage
): obj is MoveEnviroObjectClientMsg {
  return (
    obj.type === ClientMessageType.MOVE_ENVIRO_OBJECT &&
    (obj as MoveEnviroObjectClientMsg).enviroObjectId !== undefined &&
    (obj as MoveEnviroObjectClientMsg).newPos !== undefined
  );
}

export interface VillagerReachedPathPointClientMsg
  extends ClientWebsocketMessage {
  type: ClientMessageType.VILLAGER_REACHED_PATH_POINT;
  villagerId: VillagerId;
}
export function isVillagerReachedPathPointClientMsg(
  obj: ClientWebsocketMessage
): obj is VillagerReachedPathPointClientMsg {
  return (
    obj.type === ClientMessageType.VILLAGER_REACHED_PATH_POINT &&
    (obj as VillagerReachedPathPointClientMsg).villagerId !== undefined
  );
}

// =======================
// === Server Messages ===
// =======================
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
export interface NewVillagerAndHouseServerMsg extends ServerWebsocketMessage {
  type: ServerMessageType.NEW_VILLAGER_AND_HOUSE_CREATED;
  villagerAsset: AssetJSON;
  houseAsset: AssetJSON;
}

export function isNewVillagerAndHouseServerMsg(
  obj: ServerWebsocketMessage
): obj is NewVillagerAndHouseServerMsg {
  return (
    obj.type === ServerMessageType.NEW_VILLAGER_AND_HOUSE_CREATED &&
    (obj as NewVillagerAndHouseServerMsg).villagerAsset !== undefined &&
    (obj as NewVillagerAndHouseServerMsg).houseAsset !== undefined
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

// ===========================
// ===========================

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
    if (!message) {
      message = 'No message provided in request.';
    }
    super(message, errMsgForClient);
  }
}
