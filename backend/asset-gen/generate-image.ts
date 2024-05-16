import OpenAI from "openai";
import { generateText } from "./generate-text.ts";

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
export async function generateCosmeticObject(): Promise<OpenAI.Images.Image | null> {
  const furniture = cosmeticList[randomInt(0, cosmeticList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${furniture}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background.The item must be within the image's borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Pick a random resource building
export async function generateResourceObject(): Promise<OpenAI.Images.Image | null> {
  const resource = resourceList[randomInt(0, resourceList.length - 1)];
  const prompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a singular ${resource}, for my simulation game with a village theme. Ensure that the lighting appears to come from the west side, casting appropriate shadows. The item is placed against a plain white background. The item must be within the constraints of the image borders whilst being as large as possible.`;
  return generateImage(prompt);
}

// Picks a random number between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get house
export async function generateHouseObject(): Promise<OpenAI.Images.Image | null> {
  const prompt =
    "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Create a simple pixelated image with a standard isometric view showing a large, singular square house with warm lighting. Ensure that the lighting appears to come from the west side, casting appropriate shadows. It should be encapsulated in a village core theme that showcases the house's charming characteristics - a thatched roof, timber frames with some greenery. The entire house must be contained within the image's borders, allowing for an unobstructed view of the dwelling. Let the house against a plain white background, highlighting the house's charming attributes and maintaining a straightforward composition. The item must be within the constraints of the image borders whilst being as large as possible.";
  return generateImage(prompt);
}

export async function generateVillagerObject(): Promise<OpenAI.Images.Image | null> {
  const prompt =
    "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Created a simple pixelated image with a standard isometric perspective of a pixelated cute villager in a detailed pixel art style. Put the villager against a plain white background with no additional items.";
  return generateImage(prompt);
}

export async function generateHouseObjectCustom(): Promise<OpenAI.Images.Image | null> {
  const textGenerationMessages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
    [
      {
        role: "system",
        content:
          "You are a world-class architectural designer specializing in light-hearted, pleasant, friendly styles and integrating a vast variety of building architectures from all ages throughout history and places around the world. Help the user design some highly aesthetic, visually pleasing descriptions of house architectures.",
      },
      {
        role: "user",
        content:
          "Write a short description of the architectural style of a village lodge. The style could be anything from village house architecture such as ancient Egyptian mudbrick homes, Greek stone cottages, Japanese machiya townhouses, medieval European timber-framed houses, Moroccan riads, Mughal courtyard homes, Georgian English manors, Victorian American terraces, Swiss chalets, Craftsman bungalows, Spanish colonial haciendas, Scandinavian mid-century modern designs, or sleek contemporary eco-lodges, or a combination of these, or anything else you can think of! The more unique and special and niche, the better. Be creative, it is completely up to you what style you choose! Make sure it is a cute cozy friendly design. The house must be the primary subject, any other secondary elements should be tiny. No trees. Be brief, coherent, clear, sharp, picturesque. Around 120 words. Start the first sentence with 'The villager's house is...'",
      },
    ];

  const responseChoice = await generateText(textGenerationMessages);
  if (responseChoice == null) {
    console.error("Failed to generate text");
    return null;
  }
  const villageHouseDescription = responseChoice.message.content;

  const generateImagePrompt = `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: A cute aesthetic standard isometric aerial view of a single large square villager's house. ${villageHouseDescription} Warm, soft light sources from within the house cast a cozy glow on the charming facade and inviting atmosphere. The short two-storey house is 30 metres by 30 metres in dimension, sitting on a thin flat perfectly square standard isometric platform of size 40 metres by 40 metres made of thin stone tiles, perfectly centered in the image, maintaining a straightforward composition. The house must be the primary subject of the image, any other secondary elements should be small and entirely contained within the bounds of the platform, allowing for an unobstructed view of the house. Trees and other elements are very small compared to the large house. The entire square platform must be fully visible and fully contained within the frame of the image. The house is quaint and cozy with a storybook charm. The surrounding yard is lightly adorned with tiny complementary elements. The ground is a flat open space with a grassy texture in the color of spring green and the edges of the platform are lined smooth and straight with stone bricks. Warm, gentle, pleasant light source from the west. Style is 3D boxy art RPG video game with a soft texture. Completely plain white background, floating in white space.`;

  console.log(`Final prompt for generateImage: ${generateImagePrompt}\n`);

  return generateImage(generateImagePrompt);
}

async function generateImage(
  prompt: string
): Promise<OpenAI.Images.Image | null> {
  try {
    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });
    console.log(`Revised prompt by dalle3: ${res.data[0].revised_prompt}`);
    console.log(`Generated image from dalle3: ${res.data[0].url}\n`);
    return res.data[0];
  } catch (err) {
    if (err.response) {
      console.error(err.response.status);
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
    return null;
  }
}
