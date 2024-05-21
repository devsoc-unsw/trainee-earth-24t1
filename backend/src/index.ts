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
import { SimulationServer } from "./simulationServer.js";
import { simulationState1 } from "sample-data/simulation_state/simulation_state_1.ts";

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

const simulationState = SimulationState.deserialize(simulationState1);
const simulationServer = new SimulationServer(simulationState);
const myGameLoop = new GameLoop(simulationServer.simulationStep);
myGameLoop.startGameLoop();
