import { cropImage, removeImageBG } from "./edit-image";
import { imgToURL } from "./store-image";

// Picks a random street furniture
export async function generateCosmeticObject() {
  const furniture = cosmeticList[randomInt(0, cosmeticList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${furniture}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background.The item must be within the image's borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Pick a random resource building
export async function generateResourceObject() {
  const resource = resourceList[randomInt(0, resourceList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${resource}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background. The item must be within the constraints of the image borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Picks a random number between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get house
export async function generateHouseObject() {
  const prompt =
    "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Create a simple pixelated image with a standard isometric view showing a large, singular square house with warm lighting. Ensure that the lighting appears to come from the west side, casting appropriate shadows. It should be encapsulated in a village core theme that showcases the house's charming characteristics - a thatched roof, timber frames with some greenery. The entire house must be contained within the image's borders, allowing for an unobstructed view of the dwelling. Let the house against a plain white background, highlighting the house's charming attributes and maintaining a straightforward composition. The item must be within the constraints of the image borders whilst being as large as possible.";
  return generateImage(prompt);
}

export async function generateVillagerObject() {
  const prompt =
    "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a pixelated cute villager in a detailed pixel art style. Put the villager against a plain white background with no additional items.";
  return generateImage(prompt);
}

// Create image based on prompt
export async function generateImage(prompt) {
  const data = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });
  console.log(`Revised prompt by dalle: ${data.data[0].revised_prompt}`);
  const url = data.data[0].url;
  console.log(`Generated image from dalle: ${url}`);
  const buffer = await removeImageBG(url);
  const croppedBuffer = await cropImage();
  const cleanURL = await imgToURL(croppedBuffer);
  console.log(`Final image: ${cleanURL}`);
  return null;
}

export async function test() {
  const buffer = await cropImage();
  const url = await imgToURL(buffer);
  console.log(url);
}

// test()
