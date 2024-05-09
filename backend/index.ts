const dotenv = require('dotenv');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
dotenv.config();

const  express  = require('express');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY,});

// Preset list of items to generate
const cosmeticList = ["Wooden Bench", "Flower Bush", "Stone Fountain", "Park Swing", "Wooden Arbor", "Garden Gazebo", "Apple Tree", "Street Vendor Stall", "Picnic Table", "Bird Feeder", "Wishing Well", "Herbal bed", "Decorative floor Lantern", "Village Square Statue", "Public Library Booth", "Floral Archway", "Potted Plant", "Floral bush with butterflies", "Water Mill"];
const resourceList = ["Lumber mill", "Iron mine", "Wheat farm", "fishery", "Chicken farm", "brewery"];

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
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${furniture}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background.The item must be within the image's borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Pick a random resource building
async function generateResourceObject() {
  const resource = resourceList[randomInt(0, resourceList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${resource}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background. The item must be within the constraints of the image borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Picks a random number between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get house
async function generateHouseObject() {
  const prompt = "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Create a simple pixelated image with a standard isometric view showing a large, singular square house with warm lighting. Ensure that the lighting appears to come from the west side, casting appropriate shadows. It should be encapsulated in a village core theme that showcases the house's charming characteristics - a thatched roof, timber frames with some greenery. The entire house must be contained within the image's borders, allowing for an unobstructed view of the dwelling. Let the house against a plain white background, highlighting the house's charming attributes and maintaining a straightforward composition. The item must be within the constraints of the image borders whilst being as large as possible.";
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

// Remove bg
function removeImageBG(url) {
  const formData = new FormData();
  formData.append('size', 'auto');
  formData.append('image_url', url);
  
  axios({
    method: 'post',
    url: 'https://api.remove.bg/v1.0/removebg',
    data: formData,
    responseType: 'arraybuffer',
    headers: {
      ...formData.getHeaders(),
      'X-Api-Key': process.env.REMOVEBG_KEY,
    },
    encoding: null
  })
  .then((response) => {
    if(response.status != 200) return console.error('Error:', response.status, response.statusText);
    fs.writeFileSync("anothaone.png", response.data);
  })
  .catch((error) => {
      return console.error('Request failed:', error);
  });
}
