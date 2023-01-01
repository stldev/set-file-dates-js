import { readdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import path, { resolve } from "node:path";
import * as url from "url";
import { startingPath, debug, batchLogAmount } from "./config.js";

const extensionsImg = [".jpg", ".jpeg", ".heic"];
const extensionsVid = [".3gp", ".mov", ".mp4"];

let counter = 0;
let progress = "";

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) yield* getFiles(res);
    if (!dirent.isDirectory()) yield res?.toLowerCase();
  }
}

async function start() {
  console.time("set-file-props");

  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  const scriptPath = path.join(__dirname, "./set-file-props.ps1");

  console.log(`===== STARTING_PATH ===== ${startingPath}`);

  for await (const f of getFiles(startingPath)) {
    counter += 1;
    const fExtension = f.substring(f.lastIndexOf("."), f.length);
    const isValid = [...extensionsImg, ...extensionsVid].includes(fExtension);

    if (isValid) {
      const lastSlash = f.lastIndexOf("\\");
      const fileDir = f.substring(0, lastSlash);
      const fileName = f.substring(lastSlash + 1, f.length);
      const propertyNumber = extensionsImg.includes(fExtension) ? 12 : 208;

      const scriptArgs = `-filedir "${fileDir}" -filename "${fileName}" -propnumber ${propertyNumber} -debug ${debug}`;

      execSync(`${scriptPath} ${scriptArgs}`, {
        stdio: "inherit",
        encoding: "utf-8",
        shell: "powershell",
      });
    }

    if (counter % batchLogAmount === 0) {
      progress += ".";
      console.log(progress);
    }
  }

  console.log(`Total files processed = ${counter}`);
  console.timeEnd("set-file-props");
}

start();
