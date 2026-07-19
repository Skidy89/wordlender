import sharp from "sharp";
import type { Cell, GridOptions } from "./types.js";
import { Readable } from "stream";
import path from "node:path";
import { font } from "../../fonts/font.js";
import fs from "node:fs";

export class GridRenderer {
  constructor(private readonly options: Required<GridOptions>) {}

  async render(cells: Cell[]) {
    const fontsDir = path.join(process.cwd(), "fonts");
    process.env.FONTCONFIG_PATH = fontsDir;
    process.env.FONTCONFIG_FILE = path.join(fontsDir, "fonts.conf");
    const cacheDir = "/tmp/fonts-cache";
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const {
      rows,
      cols,
      tileSize,
      gap,
      padding,
      background,
      scale = 1,
    } = this.options;

    const sTile = tileSize * scale;
    const sGap = gap * scale;
    const sPad = padding * scale;

    const width = cols * sTile + (cols - 1) * sGap + sPad * 2;
    const height = rows * sTile + (rows - 1) * sGap + sPad * 2;

    let svg = "";

    for (const cell of cells) {
      svg += this.drawCell(cell, sTile, sGap, sPad, scale);
    }

    const image = `
<svg
xmlns="http://www.w3.org/2000/svg"
width="${width}"
height="${height}"
viewBox="0 0 ${width} ${height}">

<style>
@font-face {
  font-family: "Inter";
  src: url(data:font/ttf;base64,${font}) format("truetype");
  font-weight: 700;
  font-style: normal;
}

text {
  font-family: "Inter";
  font-weight: 700;
}
</style>

<rect
width="100%"
height="100%"
fill="${background}"/>

${svg}

</svg>
`;

    const buffer = await sharp(Buffer.from(image), { density: 72 }).png({
      quality: 50,
      compressionLevel: 9,
    });
    return Readable.toWeb(buffer) as ReadableStream<Uint8Array>;
  }

  private drawCell(
    cell: Cell,
    tileSize: number,
    gap: number,
    padding: number,
    scale: number,
  ) {
    const x = padding + cell.x * (tileSize + gap);
    const y = padding + cell.y * (tileSize + gap);

    let svg = `
<rect
x="${x}"
y="${y}"
width="${tileSize}"
height="${tileSize}"
rx="${cell.radius ? cell.radius * scale : 8 * scale}"
fill="${cell.fill ?? "#fdfbfb"}"
stroke="${cell.stroke ?? "#d3d6da"}"
stroke-width="${cell.strokeWidth ? cell.strokeWidth * scale : 2 * scale}"
/>
`;

    if (cell.text) {
      const fontSize = (cell.fontSize ?? 34) * scale;
      svg += `
<text
x="${x + tileSize / 2}"
y="${y + tileSize / 2}"
font-size="${fontSize}"
font-weight="${cell.fontWeight ?? 700}"
fill="${cell.color ?? "#000"}"
font-family="sans-serif"
text-anchor="middle"
dominant-baseline="central">
${parseXML(cell.text)}
</text>
`;
    }

    if (cell.image) {
      svg += `
<image
href="${cell.image}"
x="${x}"
y="${y}"
width="${tileSize}"
height="${tileSize}"
/>
`;
    }

    return svg;
  }
}

function parseXML(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
