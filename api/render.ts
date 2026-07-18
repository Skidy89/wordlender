import { GridRenderer } from "../src/render/render.js";

type Guess = { word: string };
type RequestBody = { answer: string; guesses: string[] };

function evaluateGuess(answer: string, guess: string) {
    const upperAnswer = answer.toUpperCase();
    const upperGuess = guess.toUpperCase();
    const result: Array<{ char: string; color: string }> = [];
    const answerCount: Record<string, number> = {};

    for (const ch of upperAnswer) {
        answerCount[ch] = (answerCount[ch] || 0) + 1;
    }

    const temp = new Array(5).fill(null);

    for (let i = 0; i < 5; i++) {
        const char = upperGuess[i] || "";
        if (char && char === upperAnswer[i]) {
            temp[i] = { char, color: "#6aaa64" };
            if (!answerCount[char]) {
                answerCount[char] = 0;
            }
            answerCount[char]--;
        } else {
            temp[i] = { char, color: null };
        }
    }

    for (let i = 0; i < 5; i++) {
        if (temp[i].color === null) {
            const char = temp[i].char;
            if (char && answerCount[char] && answerCount[char] > 0) {
                temp[i].color = "#c9b458";
                answerCount[char]--;
            } else {
                temp[i].color = "#787c7e";
            }
        }
    }

    return temp;
}

export async function POST(req: Request) {
    const body = (await req.json()) as RequestBody;

    const cells: any[] = [];
    const evaluations = body.guesses.map((g) =>
        g ? evaluateGuess(body.answer, g) : null
    );

    for (let y = 0; y < 6; y++) {
        const row = evaluations[y] || null;
        for (let x = 0; x < 5; x++) {
            const cell = row ? row[x] : null;
            cells.push({
                x,
                y,
                text: cell?.char || "",
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