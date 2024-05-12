import axios from "axios";
import FormData from "form-data";
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
