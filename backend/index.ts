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
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Create a list of 20 possible street furniture for my simulation game with a village theme. Do not have duplicate items that are very similar, for example, signpost and streetlamp would be the same thing. Half the items on the list must be flora related such as flower bushes. In the output, print them out with item names only, with space as a delimiter." }],
    model: "gpt-4-turbo-preview",
  });
  const furnitures = completion.choices[0].message.content.split(' ');

  const furniture = furnitures[randomInt(0, furnitures.length - 1)];
  const prompt = `Created a pixelated image with a standard isometric perspective of a ${furniture}, for my simulation game with a village theme. The item is placed against a plain white background.The item must be within the image's borders.`;
  return generateImage(prompt);
}

// Pick a random resource building
async function generateResourceObject() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Create a list of 20 possible resource production buildings for my simulation game with a village theme. In the output, print them out with item names only, with space as a delimiter. Make item names with two words in snake case." }],
    model: "gpt-4-turbo-preview",
  });
  const resources = completion.choices[0].message.content.split(' ');
  console.log(resources)
  
  const resource = resources[randomInt(0, resources.length - 1)];
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
