import fs from "fs";
import { createServer } from "http";
import { Readable } from "stream";
/**
 * node streams + networking
 *
 * write a c++ addon
 */

console.log("hello world!");
fs.createReadStream(__dirname + "/../fun.txt").pipe(process.stdout);

async function main() {
  await new Promise((res) => setTimeout(res, 1000));
}

main();

const server = createServer((req, res) => {
  // req is a Readable Stream (http.IncomingMessage)
  // res is a Writable Stream (http.ServerResponse)

  let body = "";

  /**
   * get the data as utf-8 strings. if an encoding is not set,
   * Buffer objects will be received
   */
  req.setEncoding("utf8");

  // Readable streams emit 'data' events once a listener is added.
  req.on("data", (chunk) => {
    body += chunk;
  });

  (async () => {
    for await (const chunk of req) {
      console.log(chunk);
    }
  })();

  // the 'end' event indicates that the entire body has been received
  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      // write back something to the user
      res.write(typeof data);
      res.end("\n");
    } catch (err) {
      res.statusCode = 400;
      return res.end(`error: ${err.message}`);
    }
  });
});

server.listen("1337");

async function* generate() {
  yield "a";
  yield "b";
  yield "c";
}

const readable = Readable.from(generate());

readable.on("data", (chunk) => {
  console.log(chunk);
});
