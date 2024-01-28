import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";
import * as jpegJs from "jpeg-js";
import libheif from "libheif-js/wasm-bundle.js";

async function decodeImage(image) {
  const width = image.get_width();
  const height = image.get_height();

  const arrayBuffer = await new Promise((resolve, reject) => {
    image.display(
      { data: new Uint8ClampedArray(width * height * 4), width, height },
      (displayData) => {
        if (!displayData) return reject(new Error("HEIF processing error"));
        resolve(displayData.data.buffer); // get the ArrayBuffer from the Uint8Array
      }
    );
  });

  return { width, height, data: arrayBuffer };
}

export async function convert(fileDir = "", fileName = "") {
  const heicPath = `${fileDir}/${fileName}.heic`;
  const jpgPath = `${fileDir}/${fileName}.jpg`;

  if (existsSync(jpgPath)) return 0; // This HEIC already converted

  const buffer = await readFile(heicPath);
  let data;
  try {
    const decoder = new libheif.HeifDecoder();
    data = decoder.decode(buffer);
  } catch (err) {
    console.log("ERROR in libheif.HeifDecoder!");
    console.log("heicPath: ", heicPath);
    console.log("Stacktrace: ", err);
    return 0;
  }

  const image = await decodeImage(data[0]);
  const quality = 92;

  const imgJpg = jpegJs.encode(
    { data: Buffer.from(image.data), width: image.width, height: image.height },
    quality
  ).data;

  await writeFile(jpgPath, imgJpg);

  return 1;
}

// convert();
