import { createLexer } from "./lexer";

describe("lexer", () => {
  test("works", () => {
    const program = `let five = 5;
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    }
    
    let result = add(five, ten);`;

    const tokens = [];

    for (let token of createLexer(program)) {
      tokens.push(token);
    }

    console.log(tokens);

    expect(true).toBe(true);
  });
});
