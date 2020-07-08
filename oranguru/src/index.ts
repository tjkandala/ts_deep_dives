import { createInterface } from "readline";
import { userInfo } from "os";
import { createLexer } from "./lexer";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * REPL
 *
 * goal:
 * - write an interpeter in Oranguru
 */
function main() {
  const { username } = userInfo();
  console.log(`Hey ${username}, welcome to the Oranguru REPL!`);
  console.log(`Waiting for input...`);

  rl.on("line", (input) => {
    const tokens = [];
    for (const token of createLexer(input)) {
      tokens.push(token);
    }

    console.log(tokens);
  });
}

main();
