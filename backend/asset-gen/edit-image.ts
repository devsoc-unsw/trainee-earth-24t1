import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import fs from 'node:fs';
import { Readable } from 'node:stream';

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
  formData.append('size', 'auto');
  formData.append('image_file', imageData, `${name}.${type}`);
  formData.append('crop', 'true');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVEBG_KEY,
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
  formData.append('size', 'auto');
  formData.append('image_url', imageUrl.toString());

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVEBG_KEY,
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
  formData.append('image', Buffer.from(imageData), {
    filename: 'image.png', // request doenst work without this, idk
  });
  formData.append('output_format', 'png');

  const response = await axios.postForm(
    `https://api.stability.ai/v2beta/stable-image/edit/remove-background`,
    formData,
    {
      validateStatus: undefined,
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${process.env.STABILITYAI_API_KEY}`,
        Accept: 'image/*',
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
// Kinda redundant now
export async function cropImage(
  imageData: ArrayBuffer
): Promise<ArrayBuffer | null> {
  try {
    const data = await sharp(imageData)
      .extractChannel('alpha')
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
    const metadata = await sharp(imageData).metadata();

    const width = metadata.width;
    const height = metadata.height;

    const length = await getNonAlphaPixel(imageData, width, height);

    const adjacent = width - length;
    const opposite = adjacent * Math.tan((60 * Math.PI) / 180);
    const m = adjacent / opposite;
    const padding = 20;

    // i know its fat just trust the process
    const editedImage = await sharp(imageData)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(async ({ data, info }) => {
        const { width, height, channels } = info;

        let currIndex = 0;
        for (let y = 0; y < height; y++) {
          // y = mx + length ;
          for (let x = 0; x < width; x++) {
            // NOTE: threshold is left
            const threshold = m * x + length - padding;
            // Pixel falls under the line
            if (y > threshold) {
              data[currIndex] = 0;
              data[currIndex + 1] = 0;
              data[currIndex + 2] = 0;
              data[currIndex + 3] = 0;
            }
            currIndex += 4;
          }
        }

        const buffer = await sharp(data, { raw: { width, height, channels } })
          .toFormat('png')
          .toBuffer();
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );
        return arrayBuffer;
      });

    return editedImage;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getNonAlphaPixel(
  imageData: ArrayBuffer,
  width: number,
  height: number
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
      return y;
    }
  }
}

export async function flopImage(
  imageData: ArrayBuffer
): Promise<ArrayBuffer | null> {
  try {
    const editedImage = await sharp(imageData)
      .flop()
      .toFormat('png')
      .toBuffer();

    const arrayBuffer = editedImage.buffer.slice(
      editedImage.byteOffset,
      editedImage.byteOffset + editedImage.byteLength
    );
    return arrayBuffer;
  } catch (error) {
    console.error(error);
    return null;
  }
}
