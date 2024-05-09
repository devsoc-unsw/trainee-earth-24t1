const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
dotenv.config();

const  express  = require('express');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY,});

// Preset list of items to generate
const cosmeticList = ["Wooden Bench", "Flower Bush", "Stone Fountain", "Park Swing", "Wooden Arbor", "Garden Gazebo", "Tree Planter", "Street Vendor Stall", "Picnic Table", "Bird Feeder", "Wishing Well", "Herbal Garden", "Decorative floor Lantern", "Village Square Statue", "Public Library Booth", "Floral Archway", "Potted Plant Display", "Butterfly Garden", "Water Mill", "Wooden Footbridge"];
const resourceList = ["Lumber mill","Iron mine","Wheat farm","fishery","Chicken farm","brewery"];

app.listen(port, () => {
  console.log(`Earth app listening on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('haiii guys');
});

// Get cosmetic image
app.get('/gen/cosmetic', async (req, res) => {
  try {
    const data = await generateCosmeticObject();
    const imageURL = data.data[0].url;
    console.log(data.data[0].revised_prompt)
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err)
  }
})

// Get house image
app.get('/gen/house', async (req, res) => {
  try {
    const data = await generateHouseObject();
    const imageURL = data.data[0].url;
    console.log(data.data[0].revised_prompt)
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err)
  }
})

// Get resource building image
app.get('/gen/resource', async (req, res) => {
  try {
    const data = await generateResourceObject();
    const imageURL = data.data[0].url;
    console.log(data.data[0].revised_prompt)
    res.send(`<html><body><img src="${imageURL}" /></body></html>`);
  } catch (err) {
    console.log(err);
    res.status(500).send(err)
  }
})

// Picks a random street furniture
async function generateCosmeticObject() {
  const furniture = cosmeticList[randomInt(0, cosmeticList.length - 1)];
  const prompt = `Created a pixelated image with a standard isometric perspective of a ${furniture}, for my simulation game with a village theme. The item is placed against a plain white background.The item must be within the image's borders.`;
  return generateImage(prompt);
}

// Pick a random resource building
async function generateResourceObject() {
  const resource = resourceList[randomInt(0, resourceList.length - 1)];
  const prompt = `Created a pixelated image with a standard isometric perspective of a ${resource}, for my simulation game with a village theme. The item is placed against a plain white background. The item must be within the constraints of the image borders.`;
  return generateImage(prompt);
}

// Picks a random number between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get house
async function generateHouseObject() {
  const prompt = "Create a pixelated image with a standard isometric view showing a large, singular square house with warm lighting. It should be encapsulated in a village core theme that showcases the house's charming characteristics - a thatched roof, timber frames, an abundance of greenery, and other quaint details. The entire house must be contained within the image's borders, allowing for an unobstructed view of the dwelling. Let the house against a plain white background, highlighting the house's charming attributes and maintaining a straightforward composition. Remove the ground base depth, only grass.";
  return generateImage(prompt);
}

// Create image based on prompt
async function generateImage(prompt) {
  const data = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });

  return data;
}
