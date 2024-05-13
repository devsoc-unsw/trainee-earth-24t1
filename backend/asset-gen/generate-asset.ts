import axios from "axios";
import { cropImage, removeImageBGViaData } from "asset-gen/edit-image.ts";
import {
  generateCosmeticObject,
  generateResourceObject,
  generateHouseObject,
  generateVillagerObject,
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
      generatedImage = await generateHouseObject();
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

  imageData = await removeImageBGViaData(
    imageData,
    newAsset.name,
    newAsset.type
  );
  if (imageData == null) {
    console.error("Failed to remove background from image");
    return null;
  }

  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
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
