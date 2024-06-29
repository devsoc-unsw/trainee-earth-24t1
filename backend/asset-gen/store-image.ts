import FormData from 'form-data';
import axios from 'axios';
import { checkEnvVars } from '../utils/envVars.js';

/**
 * @deprecated Use storeImageIntoBunny instead
 *
 * @param imageData
 * @param name name of image
 * @param type image type "png", "jpg", etc
 * @returns url of the stored image or null if failed
 */
async function storeImageIntoImgur(
  imageData: ArrayBuffer,
  name: string,
  type: string
): Promise<string | null> {
  const data = new FormData();
  data.append('image', imageData, `${name}.${type}`);
  data.append('type', 'file');
  data.append('title', 'Simple upload');
  data.append('description', 'This is a simple image upload in Imgur');

  try {
    const res = await axios({
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.imgur.com/3/image',
      headers: {
        Authorization: 'Client-ID ' + process.env.IMGUR_KEY,
        ...data.getHeaders(),
      },
      data: data,
    });
    console.log('uploading image to imgur...');
    return res.data.data.link;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Stores an image into BunnyCDN storage and returns the URL of the stored image.
 * E.g. storeImageIntoBunny(imageData, "newDirectory/newSubDirectory", "myImage.png")
 * will store the image at "https://syd.storage.bunnycdn.com/trainee-earth-bunny/newDirectory/newSubDirectory/myImage.png"
 * and return the URL "https://flatearth.b-cdn.net/newDirectory/newSubDirectory/myImage.png"
 *
 * Note the former URL is private, users can only access the image through the latter URL.
 *
 * @param imageData
 * @param imagePath path in object storage to store image e.g. "newDirectory/newSubDirectory/". Expects trailing slash, no leading slash.
 * @param imageFileName name of image including extension e.g. "myImage.png". No leading slash.
 * @returns url of the stored image or null if failedk
 *
 */
export async function storeImageIntoBunny(
  imageData: ArrayBuffer,
  imagePath: string,
  imageFileName: string
): Promise<string | null> {
  checkEnvVars([
    'BUNNY_ACCESS_KEY',
    'BUNNY_STORAGE_ZONE_NAME',
    'BUNNY_CDN_NAME',
    'BUNNY_REGION',
  ]);

  const storageURL = `https://syd.storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE_NAME}/${imagePath}${imageFileName}`;
  const cdnURL = `https://${process.env.BUNNY_CDN_NAME}.b-cdn.net/${imagePath}${imageFileName}`;

  console.log('Uploading image to bunny...');
  const res = await axios.put(storageURL, imageData, {
    headers: {
      AccessKey: process.env.BUNNY_ACCESS_KEY,
      'Content-Type': 'application/octet-stream',
    },
  });

  if (res.status === 201) {
    console.log(`Image uploaded to bunny successfully at ${storageURL}.`);
    console.log(`Access the image at CDN ${cdnURL}.`);
  } else {
    console.error('Failed to upload image to bunny');
    console.error(res.data);
    return null;
  }

  return cdnURL;
}

export async function deleteImageFromBunny(
  pathname: string
): Promise<undefined> {
  const options = {
    method: 'DELETE',
    url: pathname,
    header: {
      AccessKey: `${process.env.BUNNY_ACCESS_KEY}`,
    },
  };

  await axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
}
