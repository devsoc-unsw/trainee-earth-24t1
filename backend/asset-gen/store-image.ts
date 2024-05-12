export async function imgToURL(buffer) {
  const data = new FormData();
  data.append("image", buffer, "image.png");
  data.append("type", "file");
  data.append("title", "Simple upload");
  data.append("description", "This is a simple image upload in Imgur");

  try {
    const response = await axios({
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
    return response.data.data.link;
  } catch (err) {
    console.error(err);
  }
}
