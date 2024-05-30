import {
  ServerMessageType,
  SimStateAssetsServerMsg,
  WebsocketClients,
} from "@backend/types/wsTypes.ts";
import createId from "@backend/utils/createId.ts";
import { serializeMapToJSON } from "@backend/utils/objectTyping.ts";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { handleClientMessage, handleDisconnect } from "./wsHandler.ts";
import { Assets } from "@backend/types/assetTypes.ts";
import { SimulationState } from "@backend/types/simulationTypes.ts";

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
          // handleWSRequest takes care of replying to the client
          // in wsHandler.ts
          handleClientMessage(message, connection);
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
