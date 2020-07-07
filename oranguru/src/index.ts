import { createInterface } from "readline";
import { createLexer } from "./lexer";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * REPL
 */
function main() {
  console.log("starting REPL");

  rl.on("line", (input) => {
    console.log(input);

    const tokens = [];
    for (const token of createLexer(input)) {
      tokens.push(token);
    }

    console.log(tokens);
  });
}

main();
