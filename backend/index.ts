const dotenv = require('dotenv');
dotenv.config();

const  express  = require('express');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY,});

app.get('/', (req, res) => {
  res.send('haiii guys');
});

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});

app.get('/gen', async (req, res) => {
  try {
    const data = await generateImage();
    const imageURL = data.data[0].url;
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log('oopsie error');
    res.status(500).send('oopsiees')
  }
});

async function generateImage() {
  const data = await openai.images.generate({
    model: "dall-e-3",
    prompt: "isometric perspective of a square base house. Cottage core theme. Keep all borders of house within image. Plain white transparent background.",
    n: 1,
    size: "1024x1024",
  });

  return data;
}
