import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";
import * as jpegJs from "jpeg-js";
import * as pkg from "libheif-js";

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
  // export async function convert() {
  // const fileName = "20220320_140753923_iOS";
  // const fileDir = "C:/_CODE/_STLDEV/set-file-dates-js/imgs/rick";
  const heicPath = `${fileDir}/${fileName}.heic`;
  const jpgPath = `${fileDir}/${fileName}.jpg`;

  if (existsSync(jpgPath)) {
    // console.log("This HEIC already converted!");
    return 0;
  }

  const buffer = await readFile(heicPath);
  const decoder = new pkg.libheif.HeifDecoder();
  const data = decoder.decode(buffer);
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
