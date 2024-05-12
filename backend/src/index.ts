import express from "express";
import type { PlayerMap, Coordinates, Cell } from "./types/simulationTypes.ts";
import { run as runDB } from "src/db.ts";
import { WebSocketServer, WebSocket } from "ws";
import { handleWSRequest } from "src/wsHandler.ts";
import { GameLoop } from "./gameloopFramework.js";
import { simulationStep } from "./simulationServer.js";
import {
  generateCosmeticObject,
  generateHouseObject,
  generateVillagerObject,
  generateResourceObject,
} from "asset-gen/generate-image.ts";
import { AssetType, generateAsset } from "asset-gen/generate-asset.ts";

const EXPRESS_PORT = 3000;

const MAP_COLS = 10;
const MAP_ROWS = 10;

const app = express();

/**
 * This is how a GET request is structured in Express.
 */
app.get("/", (req, res) => {
  res.send("haiii guys");
});

/**
 * This will retrieve the map from the database.
 * Right now, it just generates a placeholder map.
 */
app.get("/map", (req, res) => {
  const map: PlayerMap = { cells: new Map<Coordinates, Cell>() };
  const origin: Coordinates = { x: 0, y: 0 };
  const originCell: Cell = {
    owner: "N/A",
    object: null,
  };
  map.cells.set(origin, originCell);
  // map.cells.set({ x: 0, y: 1 }, originCell);
  res.send(map);
});

/**
 * Connects to the database.
 * Doesn't do much right now.
 */
runDB().catch(console.dir);

const server = app.listen(EXPRESS_PORT, () => {
  console.log(`Earth app listening on port ${EXPRESS_PORT}`);
});

// Get cosmetic image
app.get("/gen/cosmetic", async (req, res) => {
  try {
    const asset = await generateAsset(AssetType.COSMETIC_ENVIRONMENT_OBJ);
    res.send(
      `<html><body><img src="${asset.processedImgUrl}" /></body></html>`
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get house image
app.get("/gen/house", async (req, res) => {
  try {
    const asset = await generateAsset(AssetType.HOUSE);
    res.send(
      `<html><body><img src="${asset.processedImgUrl}" /></body></html>`
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get villager image
app.get("/gen/villager", async (req, res) => {
  try {
    const asset = await generateAsset(AssetType.VILLAGER);
    res.send(
      `<html><body><img src="${asset.processedImgUrl}" /></body></html>`
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get resource building image
app.get("/gen/resource", async (req, res) => {
  try {
    const asset = await generateAsset(AssetType.COSMETIC_ENVIRONMENT_OBJ);
    res.send(
      `<html><body><img src="${asset.processedImgUrl}" /></body></html>`
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

/**
 * Instantiates a new WebSocketServer.
 * Runs on the same server and port as Express (3000).
 */
const wss = new WebSocketServer({ server: server });

/**
 * Handle a new client connecting to the WebSocket server.
 */
wss.on("connection", (ws: WebSocket) => {
  console.log("New WS connection opened");

  ws.on("error", console.error);

  /**
   * Executes when a message is received from the client.
   */
  ws.on("message", (msg) => {
    console.log(`Received ws message`);

    try {
      const message = JSON.parse(msg.toString("utf-8"));
      // handleWSRequest takes care of replying to the client
      // in wsHandler.ts
      handleWSRequest(message, ws);
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
      ws.send(
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
  ws.on("close", () => {
    console.log("WS connection closed");
  });
});

const myGameLoop = new GameLoop(simulationStep);
myGameLoop.startGameLoop();
