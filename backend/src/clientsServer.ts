import {
  ClientMessageType,
  CreateVillagerServerMsg,
  InvalidWSRequestSubTypeError,
  InvalidWSRequestTypeError,
  MoveEnviroObjectClientMsg,
  NewVillagerAndHouseServerMsg,
  PingMsg,
  PlayerVisitMsg,
  ServerMessageType,
  SimStateAssetsServerMsg,
  VillagerReachedPathPointClientMsg,
  WebsocketClients,
  WelcomeServerMsg,
  assertWSReqType,
  isClientWebsocketMessage,
  isCreateVillagerServerMsg,
  isMoveEnviroObjectClientMsg,
  isPingMsg,
  isPlayerVisitMsg,
  isVillagerReachedPathPointClientMsg,
} from "@backend/types/wsTypes.ts";
import createId from "@backend/utils/createId.ts";
import {
  serializeMapToJSON,
  transformObjectValues,
} from "@backend/utils/objectTyping.ts";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Assets } from "@backend/types/assetTypes.ts";
import {
  AttributeValue,
  Cells,
  EnviroObjectType,
  HouseObject,
  HouseObjectJSON,
  Pos,
  SimulationState,
  VILLAGER_TYPES_ARRAY,
  Villager,
  VillagerJSON,
  buyPref,
  checkGridCells,
  checkGridCellsJSON,
  clearGridCells,
  fillGridCells,
  parsePosStr,
  resourceOrigin,
  serializePosStr,
} from "@backend/types/simulationTypes.ts";
import {
  generateHouseAsset,
  generateVillagerAsset,
} from "@backend/asset-gen/generate-asset.ts";
import { simulationState1 } from "@backend/sample-data/simulation_state/simulation_state_1.ts";
import { RANDOM_VILLAGER_NAMES } from "@backend/sample-data/random-villager-names.ts";
interface IRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
const maxAttribute = 15;

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
        // console.log(`Received ws message`);

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

          // console.log(`Handle ws message: ${JSON.stringify(message)}`);

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
                assertWSReqType<CreateVillagerServerMsg>(
                  message,
                  isCreateVillagerServerMsg
                )
              ) {
                this.handleCreateVillagerClientMsg(connection, message);
              } else {
                throw Error("Invalid message type");
              }
              break;
            case ClientMessageType.VILLAGER_REACHED_PATH_POINT:
              // console.log(`Handle wsreq as VILLAGER_REACHED_PATH_POINT`);
              if (
                assertWSReqType<VillagerReachedPathPointClientMsg>(
                  message,
                  isVillagerReachedPathPointClientMsg
                )
              ) {
                const { villagerId } = message;
                // console.log(`Villager ${villagerId} reached path point`);
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

  async handleCreateVillagerClientMsg(
    connection: WebSocket,
    message: CreateVillagerServerMsg
  ) {
    // ======================
    // 0. Create assets for the villager and house and put into assets

    const { eye, hair, outfit } = message;
    const villagerAsset = await generateVillagerAsset(eye, hair, outfit);

    const houseAsset = await generateHouseAsset();
    this.assets.set(villagerAsset._id, villagerAsset);
    this.assets.set(houseAsset._id, houseAsset);

    // ======================
    // 1. Create the villager and house and put into simulation state
    const randomVillagerType =
      VILLAGER_TYPES_ARRAY[
        Math.floor(Math.random()) * VILLAGER_TYPES_ARRAY.length
      ];
    const randomVillagerName =
      RANDOM_VILLAGER_NAMES[
        Math.floor(Math.random()) * RANDOM_VILLAGER_NAMES.length
      ];
    const newVillager = new Villager(randomVillagerType, randomVillagerName);
    villagerAsset.name = newVillager.name;
    newVillager.energy = 20;
    newVillager.coins = 25;
    newVillager.characterAttributes = {};
    for (let attributeId of this.simulationState.attributes.keys()) {
      newVillager.characterAttributes[attributeId] = new AttributeValue(
        Math.floor(Math.random() * 10)
      );
    }
    const newHouse = new HouseObject(`villager ${newVillager.name} house`);
    newVillager.houseObject = newHouse._id;
    newVillager.assignment = null;
    newVillager.asset = villagerAsset._id;

    newVillager.resources = {};
    this.simulationState.resources.forEach((resource, resourceId) => {
      newVillager.resources[resourceId] = {
        total: 0,
        isSelling: 0,
        sellPrice: 0,
        buyPrice: 0,
        buyState: buyPref.notWanted,
        origin: resourceOrigin.bought,
      };
    });

    this.simulationState.attributes.forEach((attribute, attributeId) => {
      let baseValue = Math.ceil(Math.random() * (maxAttribute - 0));
      if (attributeId == "Speed" || attributeId == "Strength") {
        baseValue = Math.ceil(Math.random() * (maxAttribute - 7) + 7);
      }
      const instance = new AttributeValue(baseValue);

      newVillager.characterAttributes[attributeId] = instance;
    });

    let basePos: Pos | undefined = undefined;
    const { minX, minY, maxX, maxY } = findRange(
      this.simulationState.worldMap.cells
    );
    for (let x = minX; x < maxX; x += 1) {
      for (let y = minY; y < maxY; y += 1) {
        if (
          checkGridCells(
            this.simulationState.worldMap.cells,
            { x, y },
            { dx: 18, dy: 18 },
            [null],
            true,
            null,
            true
          )
        ) {
          basePos = { x, y };
          break;
        }
      }
    }
    if (!basePos) {
      // If no place to assign new plot of land for new villager, create some new cells on the map
      // Choose the side that is nearest to the center of the map
      const midX = Math.floor((minX + maxX + 1) / 2);
      const midY = Math.floor((minY + maxY + 1) / 2);
      const diffX = Math.abs(midX - minX);
      const diffY = Math.abs(midY - minY);
      const newCells: Cells = new Map();
      if (diffX > diffY) {
        for (let x = maxX; x < maxX + 20; x += 1) {
          for (let y = minY; y <= maxY; y += 1) {
            newCells.set(serializePosStr({ x, y }), null);
          }
        }
        // Fill in a random 18x18 grid of the new cells
        const randomY = Math.floor(Math.random() * (maxY - minY - 20)) + minY;
        fillGridCells(
          newCells,
          { x: maxX + 10, y: randomY },
          { dx: 18, dy: 18 },
          null,
          true,
          newVillager._id,
          true
        );
        fillGridCells(
          newCells,
          { x: maxX + 10, y: randomY },
          { dx: 10, dy: 10 },
          newHouse._id,
          true,
          newVillager._id,
          false
        );
      } else {
        for (let x = minX; x <= maxX; x += 1) {
          for (let y = maxY; y < maxY + 20; y += 1) {
            newCells.set(serializePosStr({ x, y }), null);
          }
        }
        // Fill in a random 18x18 grid of the new cells
        const randomX = Math.floor(Math.random() * (maxX - minX - 20)) + minX;
        fillGridCells(
          newCells,
          { x: randomX, y: maxY + 10 },
          { dx: 18, dy: 18 },
          null,
          true,
          newVillager._id,
          true
        );
        fillGridCells(
          newCells,
          { x: randomX, y: maxY + 10 },
          { dx: 10, dy: 10 },
          newHouse._id,
          true,
          newVillager._id,
          false
        );
      }
    }
    newVillager.basePos = basePos;
    newVillager.pos = { x: basePos.x, y: basePos.y + 5 };
    newHouse.pos = basePos;
    newVillager.villagerPath = [];
    newHouse.asset = houseAsset._id;

    this.simulationState.villagers.set(newVillager._id, newVillager);
    this.simulationState.enviroObjects.set(newHouse._id, newHouse);

    // 3. Broadcast the new simstate and assets to all clients
    this.broadcastSimStateAssets(this.simulationState, this.assets);

    // 4. Wait for a bit then Inform the client that the villager was created
    setTimeout(() => {
      // 5. Inform the client that the villager was created
      const newVillagerAndHouseServerMsg: NewVillagerAndHouseServerMsg = {
        type: ServerMessageType.NEW_VILLAGER_AND_HOUSE_CREATED,
        villagerAsset: villagerAsset.serialize(),
        houseAsset: houseAsset.serialize(),
      };
      connection.send(JSON.stringify(newVillagerAndHouseServerMsg));
    }, 500);
  }
}

const handleDisconnect = (userId: string, clients: WebsocketClients) => {
  console.log(`${userId} disconnected.`);
  clients.delete(userId);
};

const findRange = (cells: Cells): IRange => {
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
