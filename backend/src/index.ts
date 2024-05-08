import express from 'express';
import type { PlayerMap, Coordinates, Cell } from './types/simulationTypes.ts';
import { run as runDB } from './db.js';
import { WebSocketServer, WebSocket } from 'ws';

const EXPRESS_PORT = 3000;

const MAP_COLS = 10;
const MAP_ROWS = 10;

const app = express();

app.get('/', (req, res) => {
  res.send('haiii guys');
});

app.get('/map', (req, res) => {
  const map: PlayerMap = { cells: new Map<Coordinates, Cell>() };
  const origin: Coordinates = { x: 0, y: 0 };
  const originCell: Cell = {
    owner: 'N/A',
    object: null,
  };
  map.cells.set(origin, originCell);
  // map.cells.set({ x: 0, y: 1 }, originCell);
  res.send(map);
});

runDB().catch(console.dir);

const server = app.listen(EXPRESS_PORT, () => {
  console.log(`Earth app listening on port ${EXPRESS_PORT}`);
});

const wss = new WebSocketServer({ server: server });

wss.on('connection', (ws: WebSocket) => {
  console.log('New WS connection opened');

  ws.on('error', console.error);

  ws.on('message', (msg) => {
    ws.send('got your msg ' + msg);
  });

  ws.on('close', () => {
    console.log('WS connection closed');
  });
});

console.log(wss);
