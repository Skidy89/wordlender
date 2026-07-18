import { Readable } from "node:stream";
import fs from "node:fs";
import { GridRenderer } from "./render/render.js";
import type { Cell } from "./render/types.js";
type EvalResult = { text: string; color: string | null };
function evaluateGuess(answer: string, guess: string): EvalResult[] {
  const upperAnswer = answer.toUpperCase();
  const upperGuess = guess.toUpperCase();
  const answerCount: Record<string, number> = {};

  for (const ch of upperAnswer) {
    answerCount[ch] = (answerCount[ch] || 0) + 1;
  }

  const result: EvalResult[] = [];

  for (let i = 0; i < 5; i++) {
    const char = upperGuess[i] || "";
    if (char && char === upperAnswer[i]) {
      result[i] = { text: char, color: "#6aaa64" };
      if (answerCount[char]) answerCount[char]--;
    } else {
      result[i] = { text: char, color: null };
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i]?.color === null) {
      const char = result[i]?.text;
      if (char && answerCount[char] && answerCount[char] > 0) {
        result[i]!.color = "#c9b458";
        answerCount[char]--;
      } else {
        result[i]!.color = "#787c7e";
      }
    }
  }

  return result;
}

const response = await fetch("https://wordlender.vercel.app/api/render", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    answer: "JANED",

    guesses: ["WORLD", "HOUSE"],
  }),
});

if (!response.ok) {
  console.log("Status:", response.status);
  console.log("Headers:", Object.fromEntries(response.headers));
  console.log("Body:", await response.text());
  process.exit(1);
}
// @ts-ignore
const nodeStream = Readable.fromWeb(response.body!);

const file = fs.createWriteStream("output.png");

nodeStream.pipe(file);

await new Promise((resolve, reject) => {
  file.on("finish", resolve);
  file.on("error", reject);
});
const body = {
  answer: "JANED",
  guesses: ["WORLD", "HOUSE", "GUESS", "LARPE", "JANED"],
};
const renderer = new GridRenderer({
  rows: 6,
  cols: 5,
  tileSize: 62,
  gap: 6,
  padding: 12,
  background: "#000",
  scale: 2,
});
const cells: Cell[] = [];
const evaluations = body.guesses.map((g) =>
  g ? evaluateGuess(body.answer, g) : null,
);

for (let y = 0; y < 6; y++) {
  const row = evaluations[y] || null;

  for (let x = 0; x < 5; x++) {
    const cell = row ? row[x] : null;

    cells.push({
      x,
      y,
      text: cell?.text || "",
      fill: cell?.color || "#3a3a3c",
      color: "#fff",
    });
  }
}

const stream = await renderer.render(cells);

const file2 = fs.createWriteStream("output2.png");
const webStream = Readable.from(stream);
webStream.pipe(file2);

await new Promise((resolve, reject) => {
  file2.on("finish", resolve);
  file2.on("error", reject);
});
