import fs from "node:fs";
import axios from "axios";
import {
  cropImage,
  // removeBackgroundStabilityAIViaFilename,
  // removeImageBGViaData,
  cutImage,
  // removeImageBGViaURL,
  flopImage,
  removeBackgroundStableDiffusion,
} from "asset-gen/edit-image.ts";
import {
  generateCosmeticObjectImage,
  generateResourceObjectImage,
  generateHouseObjectImage,
  generateVillagerObjectImage,
  generateHouseObjectImageV2,
  // generateVillagerObjectImageV2,
} from "asset-gen/generate-image.ts";
import { storeImageIntoBunny } from "asset-gen/store-image.ts";
import OpenAI from "openai";
import nanoid from "src/utils/nanoid.ts";

class Asset {
  private readonly _id: string;
  public readonly name: string;
  public readonly date: Date;
  // Array of URLs to image in object storage, in order of processing
  // First image is the original image generated by OpenAI
  // Last image is the final image after all
  private readonly remoteImages: NamedRemoteObject[] = [];

  constructor(
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

  addRemoteImage(namedRemoteObject: NamedRemoteObject) {
    this.remoteImages.push(namedRemoteObject);
  }

  getRemoteImages(): NamedRemoteObject[] {
    return this.remoteImages;
  }
}

class NamedRemoteObject {
  constructor(public name: string, public url: string) {}
}

export enum AssetType {
  COSMETIC_ENVIRONMENT_OBJ,
  RESOURCE_ENVIRONMENT_OBJ,
  HOUSE,
  VILLAGER,
}

// === Generate image based on prompt
export async function generateAsset(
  assetType: AssetType
): Promise<Asset | null> {
  let generatedImage: OpenAI.Images.Image;
  switch (assetType) {
    case AssetType.COSMETIC_ENVIRONMENT_OBJ:
      generatedImage = await generateCosmeticObjectImage();
      break;
    case AssetType.RESOURCE_ENVIRONMENT_OBJ:
      generatedImage = await generateResourceObjectImage();
      break;
    case AssetType.HOUSE:
      generatedImage = await generateHouseObjectImage();
      break;
    case AssetType.VILLAGER:
      generatedImage = await generateVillagerObjectImage();
      break;
    default:
      console.error("Invalid asset type");
      return null;
  }

  if (generatedImage == null || generatedImage.url == null) {
    console.error("Failed to generate image");
    return null;
  }

  const filename = `${AssetType[assetType]}-${new Date().toISOString()}`;
  const newAsset = new Asset(
    generatedImage.revised_prompt ?? "",
    generatedImage.fileType,
    filename
  );

  // === Save the original generated image to object storage ===
  // If asset name is n3w4sset, and type is png, the original generated image will be saved at n3w4sset/original.png in object storage

  // Note: The imageURL on OpenAI is only available for 60mins after generation,
  // so we need to download the image and store it in our own storage.
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

  const originalImgName = `original.${newAsset.type}`;
  const originalImgUrl = await storeImageIntoBunny(
    imageData,
    newAsset.name + "/",
    originalImgName
  );
  if (originalImgUrl == null) {
    console.error("Failed to store original image");
  } else {
    console.log(`Stored original image: ${originalImgUrl}`);
    newAsset.addRemoteImage(
      new NamedRemoteObject(originalImgName, originalImgUrl)
    );
  }

  // === Remove background from image and store ===
  imageData = await removeBackgroundStableDiffusion(imageData);
  if (imageData == null) {
    console.error("Failed to remove background from image using stability AI");
    return null;
  }

  const removeBGImgName = `stable-diffusion-removebg.${newAsset.type}`;
  const removeBGImgUrl = await storeImageIntoBunny(
    imageData,
    newAsset.name + "/",
    removeBGImgName
  );

  if (removeBGImgUrl == null) {
    console.error("Failed to store image after removing background");
  } else {
    console.log(`Stored image after removing background: ${removeBGImgUrl}`);
    newAsset.addRemoteImage(
      new NamedRemoteObject(removeBGImgName, removeBGImgUrl)
    );
  }

  // === Crop image and store ===
  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
    return null;
  }

  // Cut edges from both sides
  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error('Failed to cut image');
    return null;
  } 

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error('Failed to flop image');
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error('Failed to cut image');
    return null;
  } 

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error('Failed to flop image');
    return null;
  }

  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
    return null;
  }

  const croppedImgName = `edges-cropped.${newAsset.type}`;
  const croppedImgUrl = await storeImageIntoBunny(
    imageData,
    newAsset.name + "/",
    croppedImgName
  );
  if (croppedImgUrl == null) {
    console.error("Failed to store image after cropping");
  } else {
    console.log(`Stored image after cropping: ${croppedImgUrl}`);
    newAsset.addRemoteImage(
      new NamedRemoteObject(croppedImgName, croppedImgUrl)
    );
  }
  // ===

  return newAsset;
}

export async function generateHouseAssetV2(): Promise<Asset | null> {
  // === Generate image of house object and create asset ===
  const generatedImage = await generateHouseObjectImageV2();

  if (generatedImage == null || generatedImage.url == null) {
    console.error("Failed to generate image");
    return null;
  }

  const filename = `house-${new Date().toISOString()}`;
  const newAsset = new Asset(
    generatedImage.revised_prompt ?? "",
    generatedImage.fileType,
    filename
  );

  let imageData: ArrayBuffer | null = null;

  // === Save the original generated image to object storage ===

  // Note: The imageURL on OpenAI is only available for 60mins after generation, so we need to download the image and store it in our own storage.
  console.log(`Retrieving generated image from OpenAI: ${generatedImage.url}`);
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

  const originalImgName = `original.${newAsset.type}`;
  const originalImgUrl = await storeImageIntoBunny(
    imageData,
    newAsset.name + "/",
    originalImgName
  );

  if (originalImgUrl == null) {
    console.error("Failed to store original image");
  } else {
    console.log(`Stored original image: ${originalImgUrl}`);
    newAsset.addRemoteImage(
      new NamedRemoteObject(originalImgName, originalImgUrl)
    );
  }

  // === Remove background from image and store ===

  // fs.writeFileSync(
  //   `./asset-gen/assets/${newAsset.getFilename()}`,
  //   Buffer.from(imageData)
  // );

  imageData = await removeBackgroundStableDiffusion(imageData);
  if (imageData == null) {
    console.error("Failed to remove background from image using stability AI");
    return null;
  }

  const removeBGImgName = `stable-diffusion-removebg.${newAsset.type}`;
  const removeBGImgUrl = await storeImageIntoBunny(
    imageData,
    newAsset.name + "/",
    removeBGImgName
  );

  if (removeBGImgUrl == null) {
    console.error("Failed to store image after removing background");
  } else {
    console.log(`Stored image after removing background: ${removeBGImgUrl}`);
    newAsset.addRemoteImage(
      new NamedRemoteObject(removeBGImgName, removeBGImgUrl)
    );
  }

  // === Crop image and store ===

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

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error('Failed to flop image');
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error('Failed to cut image');
    return null;
  } 

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error('Failed to flop image');
    return null;
  }

  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
    return null;
  }

  const croppedImgName = `edges-cropped.${newAsset.type}`;
  const croppedImgUrl = await storeImageIntoBunny(
    imageData,
    newAsset.name + "/",
    croppedImgName
  );
  if (croppedImgUrl == null) {
    console.error("Failed to store image after cropping");
  } else {
    console.log(`Stored image after cropping: ${croppedImgUrl}`);
    newAsset.addRemoteImage(
      new NamedRemoteObject(croppedImgName, croppedImgUrl)
    );
  }

  // ===

  return newAsset;
}
