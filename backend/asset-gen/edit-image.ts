// Remove bg
export async function removeImageBG(url: URL) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", url);

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

    if (response.status != 200)
      return console.error("Error:", response.status, response.statusText);
    return response.data;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

export async function cropImage() {
  // Removes additional space after background removal
  try {
    const data = await sharp("before.png")
      .extractChannel("alpha")
      .trim()
      .toBuffer({ resolveWithObject: true });

    const { width, height, trimOffsetLeft, trimOffsetTop } = data.info;

    const newbuffer = await sharp("before.png")
      .extract({
        left: (trimOffsetLeft ?? 0) * -1,
        top: (trimOffsetTop ?? 0) * -1,
        width: width,
        height: height,
      })
      .toBuffer();
    return newbuffer;
  } catch (error) {
    console.error(error);
  }
}
