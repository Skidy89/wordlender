import { GridRenderer } from "../src/render/render.js";

export async function POST(req: Request) {

    const body = await req.json();

    const renderer = new GridRenderer(body.options);

    const stream = await renderer.render(body.cells);

    return new Response(stream, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-store",
        },
    });
}

export async function GET(req: Request) {

    return new Response("please provide a request body", {
        status: 400,
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-store",
        },
    });
}
