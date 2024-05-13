import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 *
 * @param imageData
 * @param name name of image
 * @param type image type "png", "jpg", etc
 * @returns url of the stored image or null if failed
 */
export async function storeImage(
  imageData: ArrayBuffer,
  name: string,
  type: string
): Promise<string | null> {
  const data = new FormData();
  data.append("image", imageData, `${name}.${type}`);
  data.append("type", "file");
  data.append("title", "Simple upload");
  data.append("description", "This is a simple image upload in Imgur");

  try {
    const res = await axios({
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.imgur.com/3/image",
      headers: {
        Authorization: "Client-ID " + process.env.IMGUR_KEY,
        ...data.getHeaders(),
      },
      data: data,
    });
    console.log("uploading image to imgur...");
    return res.data.data.link;
  } catch (err) {
    console.error(err);
    return null;
  }
}
