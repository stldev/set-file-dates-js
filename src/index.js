import { execSync } from "node:child_process";
import path from "node:path";

const testIt1 = path.join("test", "it");
console.log("testIt1: ", testIt1);

console.log("----------------------------------");

// const testIt2 = execSync("$PSVersionTable | ConvertTo-Json", {
const testIt2 = execSync("$PSVersionTable", {
  encoding: "utf-8",
  shell: "powershell",
});
console.log("testIt2: ", testIt2);
