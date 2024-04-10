import express from 'express';
import type { PlayerMap, Coordinates, Cell } from './types/simulationTypes.ts';
const app = express();
const port = 3000;

const MAP_COLS = 10;
const MAP_ROWS = 10;

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

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});
