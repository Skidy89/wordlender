import sharp from "sharp";
import type { Cell, GridOptions } from "./types.js";
import { Readable } from "stream";
import fs from "node:fs";
import { font } from "../../fonts/font.js";


export class GridRenderer {
  constructor(private readonly options: Required<GridOptions>) {}

  async render(cells: Cell[]) {
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
}

text {
  font-family: "Inter";
}
</style>

<rect
width="100%"
height="100%"
fill="${background}"/>

${svg}

</svg>
`;

    const buffer = await sharp(Buffer.from(image), { density: 300 })
      .png({ quality: 100 })
    return Readable.toWeb(Readable.from(buffer)) as ReadableStream<Uint8Array>;
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
font-family="Inter"
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
