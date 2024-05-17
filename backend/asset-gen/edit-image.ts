import axios from "axios";
import FormData from "form-data";
import { ButtonGroup } from "semantic-ui-react";
import sharp from "sharp";

// Remove bg given image data
export async function removeImageBGViaData(
  imageData: ArrayBuffer,
  name: string,
  type: string
): Promise<ArrayBuffer | null> {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", imageData, `${name}.${type}`);
  formData.append("crop", "true");

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
      throw Error(
        `Error from request to removebg: ${response.status}; ${response.statusText}`
      );
    }
    return response.data;
  } catch (err) {
    throw err;
  }
}

// Remove bg given URL of image
export async function removeImageBGViaURL(
  url: URL
): Promise<ArrayBuffer | null> {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", url.toString());

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
      throw Error(
        `Error from request to removebg: ${response.status}; ${response.statusText}`
      );
    }
    return response.data;
  } catch (err) {
    throw err;
  }
}

// Removes additional space after background removal
// Kinda redundant now
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

export async function cutImage(
  imageData: ArrayBuffer
): Promise<ArrayBuffer | null> {
  try {
    const metadata = await sharp(imageData).metadata()

    const width = metadata.width;
    const height = metadata.height;

    const length = await getNonAlphaPixel(imageData, width, height);
    console.log(`the pixel found is ${length}`)

    const adjacent = width - length;
    const opposite = adjacent * Math.tan((60 * Math.PI) / 180);
    const m = adjacent/opposite;

    const editedImage = await sharp(imageData)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then( async ({ data, info }) => {
        const { width, height, channels } = info;
        console.log(width, height)
        let currIndex = 0;
        for (let y = 0; y < height/2; y++) {
          // y = mx + length ; 
          for (let x = 0; x < width; x++) {
            // const threshold = m*x + length;
            // Pixel falls under the line
            // if (y > threshold) {
              data[currIndex] = 0;
              data[currIndex + 1] = 0;
              data[currIndex + 2] = 0;
              data[currIndex + 3] = 0;
            // }
            currIndex += 4;
          }
        }
        await sharp(data, { raw: { width, height, channels } })
          .toFormat('png')
          .toFile('cut.png')
        return await sharp(data, { raw: { width, height, channels } }).toBuffer();
      })

    return editedImage;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getNonAlphaPixel(
  imageData: ArrayBuffer,
  width: number,
  height: number,
): Promise<number | null> {
  let length = 0;

  for (let y = 0; y < height; y++) {
    const pixelBuffer = await sharp(imageData)
      .extract({ left: 0, top: y, width: 1, height: 1 })
      .raw()
      .toBuffer();

    // Assuming RGBA format (4 channels)
    const alphaIndex = 3;
    const alphaValue = pixelBuffer[alphaIndex];

    if (alphaValue > 0 && y > length) {
      length = y;
    }
  }
  return length;
}
