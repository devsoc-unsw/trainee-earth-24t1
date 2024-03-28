import { express } from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('haiii guys');
});

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});
