import express from "express";
import {
  type Coordinates,
  Cell,
  SimulationState,
  WorldMap,
} from "./types/simulationTypes.ts";
import { run as runDB } from "src/db.ts";
import { WebSocketServer, WebSocket } from "ws";
import { handleWSRequest } from "src/wsHandler.ts";
import { GameLoop } from "./gameloopFramework.js";
import { Asset } from "asset-gen/generate-asset.ts";
import {
  assets1,
  simulationState1,
} from "sample-data/simulation_state/simulation_state_1.ts";
import { SimulationServer } from "./simulationServer.js";
import { deserializeJSONToMap } from "./utils/objectTyping.ts";
import {
  generateHouseAsset,
  generateVillagerAsset,
  generateProductionObjectAsset,
  generateCosmeticObjectAsset,
  // generateVillagerAssetV2
} from "asset-gen/generate-asset.ts";
import cosmeticPresetJSON from "sample-data/gen-assets/cosmetic_object_assets/presets.json";
import housePresetJSON from "sample-data/gen-assets/house_object_assets/presets.json";
import resourcePresetJSON from "sample-data/gen-assets/resource_object_assets/presets.json";
import axios, { AxiosResponse } from "axios";
import { cropImage } from "asset-gen/edit-image.ts";
import fs from "fs";
import { storeImageIntoBunny } from "asset-gen/store-image.ts";

const EXPRESS_PORT = 3000;

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
  const map: WorldMap = new WorldMap();
  const origin: Coordinates = { x: 0, y: 0 };
  const originCell: Cell = new Cell(origin.x, origin.y);
  map.addCell(origin, originCell);
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

// Create a new cosmetic environemnt object asset
app.get("/gen/cosmetic-object", async (req, res) => {
  try {
    const asset = await generateCosmeticObjectAsset();
    res.send(
      `<html><body><img src="${
        asset.getRemoteImages().at(-1).url
      }" /></body></html>`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Create a new resource environemnt object asset
app.get("/gen/production-object", async (req, res) => {
  try {
    const asset = await generateProductionObjectAsset();
    res.send(
      `<html><body><img src="${
        asset.getRemoteImages().at(-1).url
      }" /></body></html>`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Create a new house asset
app.get("/gen/house", async (req, res) => {
  try {
    const asset = await generateHouseAsset();
    res.send(
      `<html><body><img src="${
        asset.getRemoteImages().at(-1).url
      }" /></body></html>`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Create a new villager asset
app.get("/gen/villager", async (req, res) => {
  try {
    const asset = await generateVillagerAsset();
    res.send(
      `<html><body><img src="${
        asset.getRemoteImages().at(-1).url
      }" /></body></html>`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get("/edit/cosmetic", async (req, res) => {
  try {
    const presets = cosmeticPresetJSON;
    for (const preset of presets) {
      console.log(`downloading ${preset.name}`);
      try {
        const response: AxiosResponse<ArrayBuffer> = await axios({
          url: preset.url,
          method: "GET",
          responseType: "arraybuffer",
        });

        // response.data will be an ArrayBuffer
        const arrayBuffer: ArrayBuffer = response.data;

        console.log("Image fetched successfully as ArrayBuffer");
        const imageData = await cropImage(arrayBuffer);
        console.log(imageData);

        const bufferView = new Uint8Array(imageData);
        const nodeBuffer = Buffer.from(bufferView);

        fs.writeFile("temp/cropped_edges.png", nodeBuffer, (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            console.log("File written successfully:", "temp/cropped_edges.png");
          }
        });
        // delete
        // deleteImageFromBunny(preset.url)
        // upload again
        storeImageIntoBunny(nodeBuffer, preset.name, "/edges-cropped2.png");
      } catch (error) {
        console.error("Error fetching the image:", error);
        return undefined;
      }
    }
    res.send("all gs");
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get("/edit/resource", async (req, res) => {
  try {
    const presets = resourcePresetJSON;
    for (const preset of presets) {
      console.log(`downloading ${preset.name} ${preset.url}`);
      try {
        const response: AxiosResponse<ArrayBuffer> = await axios({
          url: preset.url,
          method: "GET",
          responseType: "arraybuffer",
        });

        // response.data will be an ArrayBuffer
        const arrayBuffer: ArrayBuffer = response.data;

        console.log("Image fetched successfully as ArrayBuffer");
        const imageData = await cropImage(arrayBuffer);
        console.log(imageData);

        const bufferView = new Uint8Array(imageData);
        const nodeBuffer = Buffer.from(bufferView);

        fs.writeFile("temp/cropped_edges.png", nodeBuffer, (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            console.log("File written successfully:", "temp/cropped_edges.png");
          }
        });
        // delete
        // deleteImageFromBunny(preset.url)
        // upload again
        storeImageIntoBunny(nodeBuffer, preset.name, "/edges-cropped2.png");
      } catch (error) {
        console.error("Error fetching the image:", error);
        return undefined;
      }
    }
    res.send("all gs");
  } catch (err) {
    console.error(err);
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

const simulationServer = new SimulationServer(
  SimulationState.deserialize(simulationState1),
  deserializeJSONToMap(assets1, Asset.deserialize)
);
const myGameLoop = new GameLoop(simulationServer.simulationStep);
myGameLoop.startGameLoop();
