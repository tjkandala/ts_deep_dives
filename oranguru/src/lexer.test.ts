import { createLexer } from "./lexer";

describe("lexer", () => {
  test("works", () => {
    const program = `let five = 5;
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    }
    
    let result = add(five, ten);`;

    const expectedTokens = [
      ["LET", "let"],
      ["IDENT", "five"],
      ["ASSIGN", "="],
      ["INT", "5"],
      ["SEMICOLON", ";"],
      ["LET", "let"],
      ["IDENT", "ten"],
      ["ASSIGN", "="],
      ["INT", "10"],
      ["SEMICOLON", ";"],
      ["LET", "let"],
      ["IDENT", "add"],
      ["ASSIGN", "="],
      ["FUNCTION", "fn"],
      ["LPAREN", "("],
      ["IDENT", "x"],
      ["COMMA", ","],
      ["IDENT", "y"],
      ["RPAREN", ")"],
      ["LBRACE", "{"],
      ["IDENT", "x"],
      ["PLUS", "+"],
      ["IDENT", "y"],
      ["SEMICOLON", ";"],
      ["RBRACE", "}"],
      ["LET", "let"],
      ["IDENT", "result"],
      ["ASSIGN", "="],
      ["IDENT", "add"],
      ["LPAREN", "("],
      ["IDENT", "five"],
      ["COMMA", ","],
      ["IDENT", "ten"],
      ["RPAREN", ")"],
      ["SEMICOLON", ";"],
    ];

    const tokens = [];

    for (let token of createLexer(program)) {
      tokens.push(token);
    }

    for (let i = 0; i < tokens.length; i++) {
      expect(tokens[i]).toStrictEqual(expectedTokens[i]);
    }
  });
});
