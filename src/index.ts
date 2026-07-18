import { Readable } from "node:stream";
import fs from "node:fs";


const response = await fetch(
 "https://wordlender.vercel.app/api/render",
 {
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body:JSON.stringify({

    answer:"JANED",

    guesses:[
      "WORLD",
      "HOUSE"
    ]

  })
 }
);

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