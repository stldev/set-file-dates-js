import { readdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import path, { resolve } from "node:path";
import * as url from "url";
import {
  startingPath,
  debug,
  batchLogAmount,
  emailTo,
  emailSubject,
  emailUser,
  emailPass,
  convertHeic,
} from "./config.js";
import { convert } from "./heic-convert.js";

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
  const startTime = new Date().toLocaleString();
  console.time("set-file-props");

  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

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
      let scriptArgs = `-filedir "${fileDir}" -filename "${fileName}" -propnumber ${propertyNumber} -debug ${debug}`;

      if (convertHeic && fExtension === ".heic") {
        const newJpgFromHeic = await convert(fileDir, fileName.split(".")[0]);
        scriptArgs += ` -setnewjpg ${newJpgFromHeic}`;
      }

      const first4 = fileName.substring(0, 4);
      const middle2 = fileName.substring(4, 6);
      const last2 = fileName.substring(6, 8);

      const dateFromFileName = new Date(
        Number(first4),
        Number(middle2) - 1,
        Number(last2),
        10,
        10,
        10
      );

      if (!isNaN(dateFromFileName)) {
        const fileNameDateIso = dateFromFileName.toISOString();
        scriptArgs += ` -filenamedate "${fileNameDateIso}"`;
      }

      const scriptPath = path.join(__dirname, "./set-file-props.ps1");

      execSync(`${scriptPath} ${scriptArgs}`, {
        stdio: "inherit",
        encoding: "utf-8",
        shell: "powershell",
      });
    }

    if (counter % batchLogAmount === 0) {
      progress += ".";
      const progressLog = `[${counter}]${progress}`;
      console.log(progressLog);
    }
  }

  const emailBody = `StartingPath: ${startingPath}.<hr>Total files processed: ${counter}.<hr>Started at: ${startTime}.`;
  console.log(emailBody);
  console.timeEnd("set-file-props");

  const scriptPath2 = path.join(__dirname, "./send-email.ps1");
  const scriptArgs2 = `-emailto "${emailTo}" -emailsubject "${emailSubject}" -emailbody "${emailBody}" -emailuser "${emailUser}" -emailpass "${emailPass}"`;

  execSync(`${scriptPath2} ${scriptArgs2}`, {
    stdio: "inherit",
    encoding: "utf-8",
    shell: "powershell",
  });
}

start();
