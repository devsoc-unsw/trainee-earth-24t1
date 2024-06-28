import express from 'express';
import {
  Pos,
  Cell,
  SimulationState,
  WorldMap,
  serializePosStr,
} from '../types/simulationTypes.js';
import { run as runDB } from '@backend/src/db.js';
import { WebSocketServer, WebSocket } from 'ws';
import { GameLoop } from './gameloopFramework.js';
import {
  assets1 as ASSETS,
  simulationState1 as SIMULATION_STATE,
} from '@backend/sample-data/simulation_state/simulation_state_1.js';
import { SimulationServer } from './simulationServer.js';
import {
  deserializeJSONToMap,
  serializeMapToJSON,
} from '../utils/objectTyping.js';
import {
  generateHouseAsset,
  generateVillagerAsset,
  generateProductionObjectAsset,
  generateCosmeticObjectAsset,
  generateResourceItemAsset,
  // generateVillagerAssetV2
} from '@backend/asset-gen/generate-asset.js';
import cosmeticPresetJSON from '@backend/sample-data/gen-assets/cosmetic_assets/presets.json';
import resourcePresetJSON from '@backend/sample-data/gen-assets/resource_assets/presets.json';
import axios, { AxiosResponse } from 'axios';
import { cropImage } from '@backend/asset-gen/edit-image.js';
import fs from 'fs';
import { storeImageIntoBunny } from '@backend/asset-gen/store-image.js';
import { Asset } from '@backend/types/assetTypes.js';
import {
  ServerMessageType,
  SimStateAssetsServerMsg,
  WebsocketClients,
} from '@backend/types/wsTypes.js';
import createId from '@backend/utils/createId.js';
import { CommunicationServer } from './clientsServer.js';

const EXPRESS_PORT = 3000;

const app = express();

/**
 * This is how a GET request is structured in Express.
 */
app.get('/', (req, res) => {
  res.send('haiii guys');
});

/**
 * This will retrieve the map from the database.
 * Right now, it just generates a placeholder map.
 */
app.get('/map', (req, res) => {
  const map: WorldMap = new WorldMap();
  const origin: Pos = { x: 0, y: 0 };
  const originCell: Cell = new Cell(origin);
  map.addCell(serializePosStr(origin), originCell);
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
app.get('/gen/cosmetic-object', async (req, res) => {
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
app.get('/gen/production-object', async (req, res) => {
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
app.get('/gen/house', async (req, res) => {
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
app.get('/gen/villager', async (req, res) => {
  try {
    const { eye, hair, outfit } = req.query;
    const asset = await generateVillagerAsset(eye, hair, outfit);
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

// app.get("/gen/villager", async (req, res) => {
//   try {
//     const asset = await generateResourceItemAsset();
//     res.send(
//       `<html><body><img src="${
//         asset.getRemoteImages().at(-1).url
//       }" /></body></html>`
//     );
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// })

app.get('/edit/cosmetic', async (req, res) => {
  try {
    const presets = cosmeticPresetJSON;
    for (const preset of presets) {
      console.log(`downloading ${preset.name}`);
      try {
        const response: AxiosResponse<ArrayBuffer> = await axios({
          url: preset.url,
          method: 'GET',
          responseType: 'arraybuffer',
        });

        // response.data will be an ArrayBuffer
        const arrayBuffer: ArrayBuffer = response.data;

        console.log('Image fetched successfully as ArrayBuffer');
        const imageData = await cropImage(arrayBuffer);
        console.log(imageData);

        const bufferView = new Uint8Array(imageData);
        const nodeBuffer = Buffer.from(bufferView);

        fs.writeFile('temp/cropped_edges.png', nodeBuffer, (err) => {
          if (err) {
            console.error('Error writing file:', err);
          } else {
            console.log('File written successfully:', 'temp/cropped_edges.png');
          }
        });
        // delete
        // deleteImageFromBunny(preset.url)
        // upload again
        storeImageIntoBunny(nodeBuffer, preset.name, '/edges-cropped2.png');
      } catch (error) {
        console.error('Error fetching the image:', error);
        return undefined;
      }
    }
    res.send('all gs');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/edit/resource', async (req, res) => {
  try {
    const presets = resourcePresetJSON;
    for (const preset of presets) {
      console.log(`downloading ${preset.name} ${preset.url}`);
      try {
        const response: AxiosResponse<ArrayBuffer> = await axios({
          url: preset.url,
          method: 'GET',
          responseType: 'arraybuffer',
        });

        // response.data will be an ArrayBuffer
        const arrayBuffer: ArrayBuffer = response.data;

        console.log('Image fetched successfully as ArrayBuffer');
        const imageData = await cropImage(arrayBuffer);
        console.log(imageData);

        const bufferView = new Uint8Array(imageData);
        const nodeBuffer = Buffer.from(bufferView);

        fs.writeFile('temp/cropped_edges.png', nodeBuffer, (err) => {
          if (err) {
            console.error('Error writing file:', err);
          } else {
            console.log('File written successfully:', 'temp/cropped_edges.png');
          }
        });
        // delete
        // deleteImageFromBunny(preset.url)
        // upload again
        storeImageIntoBunny(nodeBuffer, preset.name, '/edges-cropped2.png');
      } catch (error) {
        console.error('Error fetching the image:', error);
        return undefined;
      }
    }
    res.send('all gs');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// =====================================
// === Load initial simulation state ===
// =====================================
const simulationState = SimulationState.deserialize(SIMULATION_STATE);
const assets = deserializeJSONToMap(ASSETS, Asset.deserialize);

// ========================
// === WebSocket server ===
// ========================

const commServer = new CommunicationServer(server, simulationState, assets);

// =================
// === Game Loop ===
// =================
const simulationServer = new SimulationServer(
  simulationState,
  assets,
  commServer
);
simulationServer.simulationInit();
const myGameLoop = new GameLoop(simulationServer.simulationStep);
myGameLoop.startGameLoop();
