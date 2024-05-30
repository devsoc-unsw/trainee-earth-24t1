import {
  ClientMessageType,
  CreateVillagerWSReq,
  InvalidWSRequestSubTypeError,
  InvalidWSRequestTypeError,
  MoveEnviroObjectClientMsg,
  PingMsg,
  PlayerVisitMsg,
  ServerMessageType,
  SimStateAssetsServerMsg,
  WebsocketClients,
  WelcomeServerMsg,
  assertWSReqType,
  isClientWebsocketMessage,
  isCreateVillagerWSReq,
  isMoveEnviroObjectClientMsg,
  isPingMsg,
  isPlayerVisitMsg,
} from "@backend/types/wsTypes.ts";
import createId from "@backend/utils/createId.ts";
import { serializeMapToJSON } from "@backend/utils/objectTyping.ts";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Assets } from "@backend/types/assetTypes.ts";
import {
  Cells,
  EnviroObjectType,
  HouseObject,
  HouseObjectJSON,
  SimulationState,
  Villager,
  VillagerJSON,
  checkGridCells,
  checkGridCellsJSON,
  clearGridCells,
  fillGridCells,
  parsePosStr,
} from "@backend/types/simulationTypes.ts";
import { generateVillagerAsset } from "@backend/asset-gen/generate-asset.ts";
import { simulationState1 } from "@backend/sample-data/simulation_state/simulation_state_1.ts";
interface IRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
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
            case ClientMessageType.CREATE_VILLAGER:
              console.log(`Handle wsrequest was CREATE_VILLAGER`);
              if (
                assertWSReqType<CreateVillagerWSReq>(
                  message,
                  isCreateVillagerWSReq
                )
              ) {
                const { eye, hair, outfit } = message;

                const villagerAsset = generateVillagerAsset(
                  eye,
                  hair,
                  outfit
                ).then((villagerAsset) => {
                  // 1. Create the villager and put into simulation state (simulation state 1)
                  const newVillager = new Villager("farmer");
                  const newHouse = new HouseObject(newVillager._id);

                  const newHouseJSON: HouseObjectJSON = {
                    _id: newHouse.name,
                    name: newHouse.name,
                    asset: newHouse.asset,
                    ownder: newHouse.owner,
                    pos: newHouse.pos,
                    enviroType: EnviroObjectType.HOUSE,
                  }
                  
                  const { minX, minY, maxX, maxY } = findRange(this.simulationState.worldMap.cells)
                  for (let x = minX; x < maxX; x += 1) {
                    for (let y = minY; y < maxY; y += 1) {
                      if (checkGridCells(this.simulationState.worldMap.cells,
                        { x, y },
                        { dx: 9, dy: 9},
                        null,
                        true,
                        null,
                        true
                      )) {
                        
                      }
                    }
                  }

                  // 2. Create the asset and put into assets (assets1)

                  // 3. Broadcast the new simstate and assets to all clients
                  this.broadcastSimStateAssets(
                    this.simulationState,
                    this.assets
                  );

                  // 4. Wait for a bit then Inform the client that the villager was created
                  setTimeout(() => {
                    // 5. Inform the client that the villager was created
                    connection.send(
                      JSON.stringify({
                        type: ServerMessageType.NEW_VILLAGER_CREATED,
                        payload: villagerAsset.getRemoteImages().at(-1).url,
                      })
                    );
                  }, 100000);
                });
              }
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

export const findRange = (cells: Cells): IRange => {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  for (const coordStr of cells.keys()) {
    const { x, y } = parsePosStr(coordStr);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
};
