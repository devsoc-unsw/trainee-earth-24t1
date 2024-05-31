import {
  ClientMessageType,
  InvalidWSRequestSubTypeError,
  InvalidWSRequestTypeError,
  MoveEnviroObjectClientMsg,
  PingMsg,
  PlayerVisitMsg,
  ServerMessageType,
  SimStateAssetsServerMsg,
  VillagerReachedPathPointClientMsg,
  WebsocketClients,
  WelcomeServerMsg,
  assertWSReqType,
  isClientWebsocketMessage,
  isMoveEnviroObjectClientMsg,
  isPingMsg,
  isPlayerVisitMsg,
  isVillagerReachedPathPointClientMsg,
} from "@backend/types/wsTypes.ts";
import createId from "@backend/utils/createId.ts";
import { serializeMapToJSON } from "@backend/utils/objectTyping.ts";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Assets } from "@backend/types/assetTypes.ts";
import {
  SimulationState,
  clearGridCells,
  fillGridCells,
} from "@backend/types/simulationTypes.ts";

/**
 * Wrapper for WebSocket server. Handles communications between server and
 * clients. I would call this WebSocketServer but that is already taken by
 * the ws library.
 */
export class CommunicationServer {
  private clientConnections: WebsocketClients;
  private websocketServer: WebSocketServer;
  private simulationState: SimulationState;
  private assets: Assets;

  constructor(
    httpServer: Server,
    simulationState: SimulationState,
    assets: Assets
  ) {
    /**
     * Instantiates a new WebSocketServer.
     * Runs on the same server and port as the http server
     */
    this.websocketServer = new WebSocketServer({ server: httpServer });
    this.clientConnections = new Map();
    this.simulationState = simulationState;
    this.assets = assets;

    /**
     * Handle a new client connecting to the WebSocket server.
     */
    this.websocketServer.on("connection", (connection: WebSocket) => {
      const userId = createId();
      console.log(
        `\n======\nNew WS connection opened. Assigned userId ${userId}`
      );
      this.clientConnections.set(userId, connection);
      console.log(`Clients count: ${this.clientConnections.size}`);
      console.log(`Assets count: ${assets.size}`);

      console.log(`Sending simstate and assets to ${userId}`);
      const simStateAssetsServerMsg: SimStateAssetsServerMsg = {
        type: ServerMessageType.SIM_STATE_ASSETS,
        simulationState: this.simulationState.serialize(),
        assets: serializeMapToJSON(this.assets),
      };
      connection.send(JSON.stringify(simStateAssetsServerMsg));

      connection.on("error", console.error);

      /**
       * Executes when a message is received from the client.
       */
      connection.on("message", (msg) => {
        console.log(`Received ws message`);

        try {
          const message = JSON.parse(msg.toString("utf-8"));
          /**
           * Ensures the request provided by the client is in the format:
           * { "type": "something" }
           * Subject to change - consult WebSocketRequest type.
           */
          if (!isClientWebsocketMessage(message)) {
            throw new InvalidWSRequestTypeError();
          }

          console.log(`Handle ws message: ${JSON.stringify(message)}`);

          /**
           * Follow different strategies depending on what
           * the client wants from the server and send back the response.
           */
          switch (message.type) {
            case ClientMessageType.PING:
              console.log(`Handle wsreq as PING`);
              if (assertWSReqType<PingMsg>(message, isPingMsg)) {
                connection.send(JSON.stringify({ type: "PONG" }));
              }
              break;
            case ClientMessageType.PLAYER_VISIT:
              console.log(`Handle wsreq as PLAYER_VISIT`);
              if (assertWSReqType<PlayerVisitMsg>(message, isPlayerVisitMsg)) {
                const playerId = message.playerId;
                connection.send(
                  JSON.stringify({
                    type: ServerMessageType.WELCOME,
                    text: `Welcome ${playerId}`,
                  } as WelcomeServerMsg)
                );
              }
              break;
            case ClientMessageType.MOVE_ENVIRO_OBJECT:
              console.log(`Handle wsreq as MOVE_ENVIRO_OBJECT`);
              if (
                assertWSReqType<MoveEnviroObjectClientMsg>(
                  message,
                  isMoveEnviroObjectClientMsg
                )
              ) {
                const { enviroObjectId, newPos } = message;
                console.log(
                  `Move enviro object ${enviroObjectId} to ${newPos.x}, ${newPos.y}`
                );

                const prevEnviroObject =
                  this.simulationState.enviroObjects.get(enviroObjectId);
                const enviroObjectDim = this.assets.get(
                  prevEnviroObject.asset
                ).dimensions;

                clearGridCells(
                  this.simulationState.worldMap.cells,
                  prevEnviroObject.pos,
                  enviroObjectDim,
                  true, // clear object from cell grid
                  false // dont clear owner from cell
                );
                fillGridCells(
                  this.simulationState.worldMap.cells,
                  newPos,
                  enviroObjectDim,
                  enviroObjectId,
                  true,
                  null,
                  false
                );

                this.simulationState.enviroObjects.get(enviroObjectId).pos =
                  newPos;
                this.broadcastSimStateAssets(this.simulationState, this.assets);
              }
              break;
            case ClientMessageType.VILLAGER_REACHED_PATH_POINT:
              console.log(`Handle wsreq as VILLAGER_REACHED_PATH_POINT`);
              if (
                assertWSReqType<VillagerReachedPathPointClientMsg>(
                  message,
                  isVillagerReachedPathPointClientMsg
                )
              ) {
                const { villagerId } = message;
                console.log(`Villager ${villagerId} reached path point`);
                this.simulationState.villagers
                  .get(villagerId)
                  .villagerPath.shift();
                // this.broadcastSimStateAssets(this.simulationState, this.assets);
              }
              break;
            // ADD NEW WEBSOCKET REQUEST TYPES HERE
            default:
              throw new InvalidWSRequestSubTypeError();
          }
        } catch (e) {
          console.error(e);
          let clientErrorMsg = e.message;
          if (e.name === "InvalidWSRequestTypeError") {
            // tidies up the error message to explain more clearly why
            // a message may have failed because the JSON couldn't parse
            clientErrorMsg = `invalid message; please ensure it's in the format { "type": "PING" }. don't forget - json only supports double quotes`;
          } else {
            console.log(e.name);
          }
          // sends the error back to the client
          connection.send(
            JSON.stringify({
              err: {
                name: e.name,
                message: clientErrorMsg,
              },
            })
          );
        }
      });

      /**
       * Executes when a client closes.
       */
      connection.on("close", () => {
        console.log(`\n=======\nWS connection to ${userId} closed`);
        handleDisconnect(userId, this.clientConnections);
      });
    });
  }

  broadcastSimStateAssets(simulationState: SimulationState, assets: Assets) {
    console.log("Broadcasting simstate and assets to all clients");
    const simStateAssetsServerMsg: SimStateAssetsServerMsg = {
      type: ServerMessageType.SIM_STATE_ASSETS,
      simulationState: simulationState.serialize(),
      assets: serializeMapToJSON(assets),
    };
    this.clientConnections.forEach((connection) => {
      connection.send(JSON.stringify(simStateAssetsServerMsg));
    });
  }
}

const handleDisconnect = (userId: string, clients: WebsocketClients) => {
  console.log(`${userId} disconnected.`);
  clients.delete(userId);
};
