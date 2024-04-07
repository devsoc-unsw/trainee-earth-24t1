const  express  = require('express');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: "addkeyhere",});

app.get('/', (req, res) => {
  res.send('haiii guys');
});

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});

app.get('/gen', (req, res) => {
  res.send(generateImage());
});

async function generateImage() {
  const data = await openai.images.generate({
    model: "dall-e-3",
    prompt: "isometric perspective of a square base house. Cottage core theme. Keep all borders of house within image. Plain white background.",
    n: 1,
    size: "1024x1024",
  });

  console.log(data);
}
