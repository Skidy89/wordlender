import { GridRenderer } from "../src/render/render.js";


type Guess = {
    word: string;
};


type RequestBody = {

    answer: string;

    guesses: string[];

};


function evaluateGuess(
    answer: string,
    guess: string
) {

    const result = [];

    const answerChars =
        answer.toUpperCase().split("");

    const guessChars =
        guess.toUpperCase().split("");


    for(let i = 0; i < 5; i++) {

        const char = guessChars[i];
        if (!char) {
            result.push({
                char: "",
                color:"#3a3a3c"
            });
            continue;
        }


        if(char === answerChars[i]) {

            result.push({
                char,
                color:"#6aaa64"
            });

        }
        else if(answerChars.includes(char)) {

            result.push({
                char,
                color:"#c9b458"
            });

        }
        else {

            result.push({
                char,
                color:"#787c7e"
            });

        }

    }


    return result;

}



export async function POST(
    req: Request
) {

    const body =
        await req.json() as RequestBody;


    const cells = [];


    for(
        let y = 0;
        y < 6;
        y++
    ) {

        const guess =
            body.guesses[y];


        for(
            let x = 0;
            x < 5;
            x++
        ) {


            const char =
                guess?.[x] ?? "";


            const result =
                guess
                ? evaluateGuess(
                    body.answer,
                    guess
                )[x]
                : null;



            cells.push({

                x,

                y,

                text: char.toUpperCase(),

                fill:
                    result?.color
                    ??
                    "#3a3a3c",

                color:"#fff"

            });

        }

    }



    const renderer =
        new GridRenderer({

            rows:6,

            cols:5,

            tileSize:62,

            gap:6,

            padding:12,

            background:"#0000",

            scale:2

        });



    const stream =
        await renderer.render(cells);



    return new Response(
        stream,
        {
            headers:{
                "Content-Type":"image/png",

                "Cache-Control":"no-store"
            }
        }
    );

}