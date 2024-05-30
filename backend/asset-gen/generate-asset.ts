import axios from "axios";
import {
  cropImage,
  // removeBackgroundStabilityAIViaFilename,
  // removeImageBGViaData,
  cutImage,
  // removeImageBGViaURL,
  flopImage,
  removeBackgroundStableDiffusion,
} from "@backend/asset-gen/edit-image.ts";
import {
  generateCosmeticObjectImage,
  generateProductionObjectImage,
  generateVillagerImage,
  generateHouseImage,
  // generateVillagerObjectImageV2,
} from "@backend/asset-gen/generate-image.ts";
import { storeImageIntoBunny } from "@backend/asset-gen/store-image.ts";
import OpenAI from "openai";
import { Asset, RemoteImage } from "@backend/types/assetTypes.ts";

export enum AssetType {
  COSMETIC_ENVIRONMENT_OBJ,
  RESOURCE_ENVIRONMENT_OBJ,
  VILLAGER,
}

// === Generate image based on prompt
// Note: Should unwrap this funciton into multiple functions that each handle
// generating a specific asset
async function generateAsset(assetType: AssetType): Promise<Asset | null> {
  let generatedImage: OpenAI.Images.Image;
  switch (assetType) {
    case AssetType.COSMETIC_ENVIRONMENT_OBJ:
      generatedImage = await generateCosmeticObjectImage();
      break;
    case AssetType.RESOURCE_ENVIRONMENT_OBJ:
      generatedImage = await generateProductionObjectImage();
      break;
    case AssetType.VILLAGER:
      generatedImage = await generateVillagerImage();
      break;
    default:
      console.error("Invalid asset type");
      return null;
  }

  if (generatedImage == null || generatedImage.url == null) {
    console.error("Failed to generate image");
    return null;
  }

  const assetName = `${AssetType[assetType]}-${new Date().toISOString()}`;
  const newAsset = new Asset(
    generatedImage.revised_prompt ?? "",
    assetName,
    generatedImage.fileType
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
    newAsset.addRemoteImage(new RemoteImage(originalImgName, originalImgUrl));
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
    newAsset.addRemoteImage(new RemoteImage(removeBGImgName, removeBGImgUrl));
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
    console.error("Failed to cut image");
    return null;
  }

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error("Failed to flop image");
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error("Failed to cut image");
    return null;
  }

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error("Failed to flop image");
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
    newAsset.addRemoteImage(new RemoteImage(croppedImgName, croppedImgUrl));
  }
  // ===

  return newAsset;
}

export async function generateHouseAsset(): Promise<Asset | null> {
  // === Generate image of house object and create asset ===
  const generatedImage = await generateHouseImage();

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
    newAsset.addRemoteImage(new RemoteImage(originalImgName, originalImgUrl));
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
    newAsset.addRemoteImage(new RemoteImage(removeBGImgName, removeBGImgUrl));
  }

  // === Crop image and store ===

  imageData = await cropImage(imageData);
  if (imageData == null) {
    console.error("Failed to crop image");
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error("Failed to cut image");
    return null;
  }

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error("Failed to flop image");
    return null;
  }

  imageData = await cutImage(imageData);
  if (imageData == null) {
    console.error("Failed to cut image");
    return null;
  }

  imageData = await flopImage(imageData);
  if (imageData == null) {
    console.error("Failed to flop image");
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
    newAsset.addRemoteImage(new RemoteImage(croppedImgName, croppedImgUrl));
  }

  // ===

  return newAsset;
}

export async function generateVillagerAsset(): Promise<Asset | null> {
  // TODO: Implement this in a specialised way rather than delegate to
  // generateAsset()
  return generateAsset(AssetType.VILLAGER);
}

export async function generateProductionObjectAsset(): Promise<Asset | null> {
  // TODO: Implement this in a specialised way rather than delegate to
  // generateAsset()
  return generateAsset(AssetType.RESOURCE_ENVIRONMENT_OBJ);
}

export async function generateCosmeticObjectAsset(): Promise<Asset | null> {
  return await generateAsset(AssetType.COSMETIC_ENVIRONMENT_OBJ);
}
