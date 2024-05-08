import { express } from 'express';
import { Map, Cell } from './types';
const app = express();
const port = 3000;

const MAP_COLS = 10;
const MAP_ROWS = 10;

app.get('/', (req, res) => {
  res.send('haiii guys');
});

app.get('/map', (req, res) => {
  // boilerplate map
  const map: Cell[][] = Array.from({ length: MAP_COLS }, () =>
    Array(MAP_ROWS).fill(null)
  );
  res.send(map);
});

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});
