import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import fs from "node:fs";
import { Readable } from "node:stream";

/**
 * @deprecated Use removeBackgroundStableDiffusion instead
 *
 * Remove bg given image data
 *
 * @param imageData
 * @param name
 * @param type
 * @returns
 */
async function removeImageBGViaData(
  imageData: ArrayBuffer,
  name: string,
  type: string
): Promise<ArrayBuffer | null> {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", imageData, `${name}.${type}`);

  try {
    const response = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      responseType: "arraybuffer",
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVEBG_KEY,
      },
      // encoding: null,
    });

    if (response.status != 200) {
      console.error(
        `Error from request to removebg: ${response.status}; ${response.statusText}`
      );
      return null;
    }
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * @deprecated Use removeBackgroundStableDiffusion instead
 *
 * Remove bg given URL of image
 *
 * @param imageUrl
 * @returns
 */
async function removeImageBGViaURL(imageUrl: URL): Promise<ArrayBuffer | null> {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", imageUrl.toString());

  try {
    const response = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      responseType: "arraybuffer",
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVEBG_KEY,
      },
      // encoding: null,
    });

    if (response.status != 200) {
      console.error(
        `Error from request to removebg: ${response.status}; ${response.statusText}`
      );
      return null;
    }
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function removeBackgroundStableDiffusion(
  imageData: ArrayBuffer
): Promise<Buffer | null> {
  const formData = new FormData();
  formData.append("image", Buffer.from(imageData), {
    filename: "image.png", // request doenst work without this, idk
  });
  formData.append("output_format", "png");

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/edit/remove-background`,
    formData,
    {
      validateStatus: undefined,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.STABILITYAI_API_KEY}`,
        Accept: "image/*",
      },
    }
  );

  if (response.status === 200) {
    // fs.writeFileSync("./husky.png", Buffer.from(response.data));
    return response.data;
  } else {
    console.error(`${response.status}: ${response.data.toString()}`);
    return null;
  }
}

// Removes additional space after background removal
export async function cropImage(
  imageData: ArrayBuffer
): Promise<ArrayBuffer | null> {
  try {
    const data = await sharp(imageData)
      .extractChannel("alpha")
      .trim()
      .toBuffer({ resolveWithObject: true });

    const { width, height, trimOffsetLeft, trimOffsetTop } = data.info;

    const newImageData = await sharp(imageData)
      .extract({
        left: (trimOffsetLeft ?? 0) * -1,
        top: (trimOffsetTop ?? 0) * -1,
        width: width,
        height: height,
      })
      .toBuffer();
    return newImageData;
  } catch (error) {
    console.error(error);
    return null;
  }
}
