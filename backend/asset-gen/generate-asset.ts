import fs from "node:fs";
import axios from "axios";
import {
  cropImage,
  removeBackgroundStabilityAIViaFilename,
  removeImageBGViaData,
  cutImage,
  removeImageBGViaURL
} from "asset-gen/edit-image.ts";
import {
  generateCosmeticObject,
  generateResourceObject,
  generateHouseObject,
  generateVillagerObject,
  generateHouseObjectCustom,
} from "asset-gen/generate-image.ts";
import { storeImage } from "asset-gen/store-image.ts";
import OpenAI from "openai";

class Asset {
  private readonly _id: string;
  public readonly name: string;
  public readonly date: Date;
  public processedImgUrl: string | null = null;

  constructor(
    public readonly originalImgUrl: string,
    public description: string,
    public readonly type: string,
    name?: string
  ) {
    this._id = Math.random().toString(36).substring(12);
    this.name = name ?? this._id;
    this.date = new Date();
  }

  getFilename(): string {
    return `${this.name}.${this.type}`;
  }
}

export enum AssetType {
  COSMETIC_ENVIRONMENT_OBJ,
  RESOURCE_ENVIRONMENT_OBJ,
  HOUSE,
  VILLAGER,
}

// Create image based on prompt
export async function generateAsset(
  assetType: AssetType
): Promise<Asset | null> {
  let generatedImage: OpenAI.Images.Image;
  switch (assetType) {
    case AssetType.COSMETIC_ENVIRONMENT_OBJ:
      generatedImage = await generateCosmeticObject();
      break;
    case AssetType.RESOURCE_ENVIRONMENT_OBJ:
      generatedImage = await generateResourceObject();
      break;
    case AssetType.HOUSE:
      generatedImage = await generateHouseObjectCustom();
      break;
    case AssetType.VILLAGER:
      generatedImage = await generateVillagerObject();
      break;
    default:
      console.error("Invalid asset type");
      return null;
  }

  if (generatedImage == null || generatedImage.url == null) {
    console.error("Failed to generate image");
    return null;
  }

  const newAsset = new Asset(
    generatedImage.url,
    generatedImage.revised_prompt ?? "",
    generatedImage.url.split(".").pop() ?? "png"
  );

  console.log(`Retrieving generated image from OpenAI: ${generatedImage.url}`);

  let imageData: ArrayBuffer | null = null;
  try {
    let res = await axios.request<ArrayBuffer>({
      url: generatedImage.url,
      method: "GET",
      responseType: "arraybuffer",
    });
    imageData = res.data;
  } catch (err) {
    console.error(`Unable to retrive image from OpenAI: ${generatedImage.url}`);
    console.error(err);
    return null;
  }

  fs.writeFileSync(
    `./asset-gen/assets/${newAsset.getFilename()}`,
    Buffer.from(imageData)
  );

  imageData = await removeBackgroundStabilityAIViaFilename(
    `./asset-gen/assets/${newAsset.getFilename()}`
  );
  if (imageData == null) {
    console.error("Failed to remove background from image using stability AI");
    return null;
  }

  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error('Failed to cut image');
    return null;
  } 
  console.log('Finished cutting image')

  const processImgUrl = await storeImage(
    imageData,
    newAsset.name,
    newAsset.type
  );
  if (processImgUrl == null) {
    console.error("Failed to store image");
    return null;
  }

  newAsset.processedImgUrl = processImgUrl;
  console.log(`Final image: ${processImgUrl}`);

  return newAsset;
}

export async function generateHouse(): Promise<Asset | null> {
  const generatedImage = await generateHouseObjectCustom();

  if (generatedImage == null || generatedImage.url == null) {
    console.error("Failed to generate image");
    return null;
  }

  // Regular expression to match the file extension from the url that looks like this:
  // https://oaidalleapiprodscus.blob.core.windows.net/private/org-yM7OegJ0kpzT66ADsxqPVBwY/user-Z38ClRU3N9yfopoEhF3V4Ep2/img-yKdFK5DiOSw1SRaqrNZaov8H.png?st=2024-05-16T18%3A10%3A07Z&se=2024-05-16T20%3A10%3A07Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-05-16T08%3A09%3A27Z&ske=2024-05-17T08%3A09%3A27Z&sks=b&skv=2021-08-06&sig=PstFL6kjp775uGvzbkpxV4eirF0r7v/YX4BzXUJ3tsA%3D
  // Name: img-yKdFK5DiOSw1SRaqrNZaov8H
  // Extension: png
  const regex = /\/([^\/\.]+)\.(jpg|jpeg|png|gif|bmp|webp)(?=\?|$)/i;

  let newAsset = null;
  // Extract the file extension
  const match = generatedImage.url.match(regex);
  if (match) {
    if (match.length < 3) {
      console.error("Invalid match length");
      return null;
    }
    const filename = match[1];
    const extension = match[2];
    newAsset = new Asset(
      generatedImage.url,
      generatedImage.revised_prompt ?? "",
      extension,
      filename
    );
    console.log(`File name: ${filename}, File extension: ${extension}`);
  } else {
    console.error("No file extension found in the URL");
    return null;
  }
  if (newAsset == null) {
    console.error("Failed to create new asset");
    return null;
  }

  console.log(`Retrieving generated image from OpenAI: ${generatedImage.url}`);

  let imageData: ArrayBuffer | null = null;
  try {
    let res = await axios.request<ArrayBuffer>({
      url: generatedImage.url,
      method: "GET",
      responseType: "arraybuffer",
    });
    imageData = res.data;
  } catch (err) {
    console.error(`Unable to retrive image from OpenAI: ${generatedImage.url}`);
    console.error(err);
    return null;
  }

  fs.writeFileSync(
    `./asset-gen/assets/${newAsset.getFilename()}`,
    Buffer.from(imageData)
  );

  imageData = await removeBackgroundStabilityAIViaFilename(
    `./asset-gen/assets/${newAsset.getFilename()}`
  );
  if (imageData == null) {
    console.error("Failed to remove background from image using stability AI");
    return null;
  }

  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error('Failed to cut image');
    return null;
  } 

  const processImgUrl = await storeImage(
    imageData,
    newAsset.name,
    newAsset.type
  );
  if (processImgUrl == null) {
    console.error("Failed to store image");
    return null;
  }

  newAsset.processedImgUrl = processImgUrl;
  console.log(`Final image: ${processImgUrl}`);

  return newAsset;
}
