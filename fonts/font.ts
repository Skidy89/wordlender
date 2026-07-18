import fs from "node:fs";

export const font = fs.readFileSync("./fonts/inter-bold.ttf", "base64");