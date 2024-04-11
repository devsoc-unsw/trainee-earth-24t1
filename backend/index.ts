const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
dotenv.config();

const  express  = require('express');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY,});

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('haiii guys');
});

app.get('/gen', async (req, res) => {
  try {
    const data = await generateImage();
    const imageURL = data.data[0].url;
    console.log(data.data[0].revised_prompt)
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send('oopsiees')
  }
});

async function generateImage() {
  // use chat gpt to get a specifric furniture
  const furniture = 'lamppost'
  const prompt = `Created a pixelated image with a standard isometric perspective of a cosmetic object. Create an image of ${furniture}. The item is placed against a plain white background.`;

  const data = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });
  // house generator
  // "Create a pixelated image with a standard isometric view showing a quaint, singular square house with warm lighting. It should be encapsulated in a village core theme that showcases the house's charming characteristics - a thatched roof, timber frames, an abundance of greenery, and other quaint details. The entire house must be contained within the image's borders, allowing for an unobstructed view of the dwelling. Let the house against a plain white background, highlighting the house's charming attributes and maintaining a straightforward composition. Remove the ground base depth, only grass."

  // map prompt
  // prompt: "Generate an isometric view of an empty map with a grid overlay, suitable for a simulator game. The map should depict a flat terrain with only grass and some bushes and measure 900x900 units, displaying only the surface level with a grass layer, omitting any lower layers such as dirt or rock. The entire map must be contained within the image's borders.",

  // cosmetic objects


  return data;
}
