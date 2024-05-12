import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Preset list of items to generate
const cosmeticList = [
  "Wooden Bench",
  "Flower Bush",
  "Stone Fountain",
  "Park Swing",
  "Wooden Arbor",
  "Garden Gazebo",
  "Apple Tree",
  "Street Vendor Stall",
  "Picnic Table",
  "Bird Feeder",
  "Wishing Well",
  "Herbal bed",
  "Decorative floor Lantern",
  "Village Square Statue",
  "Public Library Booth",
  "Floral Archway",
  "Potted Plant",
  "Floral bush with butterflies",
  "Water Mill",
];
const resourceList = [
  "Lumber mill",
  "Iron mine",
  "Wheat farm",
  "fishery",
  "Chicken farm",
  "brewery",
];

// Picks a random street furniture
export async function generateCosmeticObject(): Promise<OpenAI.Images.Image> {
  const furniture = cosmeticList[randomInt(0, cosmeticList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${furniture}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background.The item must be within the image's borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Pick a random resource building
export async function generateResourceObject(): Promise<OpenAI.Images.Image> {
  const resource = resourceList[randomInt(0, resourceList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${resource}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background. The item must be within the constraints of the image borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Picks a random number between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get house
export async function generateHouseObject(): Promise<OpenAI.Images.Image> {
  const prompt =
    "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Create a simple pixelated image with a standard isometric view showing a large, singular square house with warm lighting. Ensure that the lighting appears to come from the west side, casting appropriate shadows. It should be encapsulated in a village core theme that showcases the house's charming characteristics - a thatched roof, timber frames with some greenery. The entire house must be contained within the image's borders, allowing for an unobstructed view of the dwelling. Let the house against a plain white background, highlighting the house's charming attributes and maintaining a straightforward composition. The item must be within the constraints of the image borders whilst being as large as possible.";
  return generateImage(prompt);
}

export async function generateVillagerObject(): Promise<OpenAI.Images.Image> {
  const prompt =
    "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a pixelated cute villager in a detailed pixel art style. Put the villager against a plain white background with no additional items.";
  return generateImage(prompt);
}

async function generateImage(prompt): Promise<OpenAI.Images.Image> {
  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });
  console.log(`Revised prompt by dalle: ${res.data[0].revised_prompt}`);
  console.log(`Generated image from dalle: ${res.data[0].url}`);
  return res.data[0];
}
