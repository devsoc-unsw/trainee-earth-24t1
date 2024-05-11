export enum RequestType {
  PING,
}

export type WebSocketRequest = {
  type: RequestType;
};

export function isWebSocketRequest(obj: Object): obj is WebSocketRequest {
  return (obj as WebSocketRequest).type !== undefined;
}
