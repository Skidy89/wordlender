import fs from "node:fs";
import path from "node:path";

const fontPath = path.resolve(
  process.cwd(),
  "fonts/inter-bold.ttf"
);

export const font = fs.readFileSync(
    fontPath, "base64"
);