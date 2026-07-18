import { GridRenderer } from "../src/render/render.js";
import type { Cell } from "../src/render/types.js";

type RequestBody = {
  answer: string;
  guesses: string[];
};

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
      if (answerCount[char])
      answerCount[char]--;
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

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;

  const cells: Cell[] = [];
  const evaluations = body.guesses.map((g) =>
    g ? evaluateGuess(body.answer, g) : null
  );
  console.log(body);
  console.log(evaluations);
  console.log(cells);

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

  const renderer = new GridRenderer({
    rows: 6,
    cols: 5,
    tileSize: 62,
    gap: 6,
    padding: 12,
    background: "#000",
    scale: 2,
  });

  const stream = await renderer.render(cells);

  return new Response(stream, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}