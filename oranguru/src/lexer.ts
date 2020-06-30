/**
 * Chapter 1: Lexing
 *
 * 1.1 Lexical Analysis
 *
 * - turn source code into a more accessible form
 * - source code -> tokens -> abstract syntax tree
 * - source code to tokens is called "lexical analysis"/"lexing"
 * - tokens are small data structures fed into the parser => AST
 * - whitespace length doesn't matter in Monkey
 *
 */

enum TokenType {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  // Identifiers + literals
  IDENT = "IDENT", // add, foobar, x, y, ...
  INT = "INT", // 1234
  // Operators
  ASSIGN = "=",
  PLUS = "+",
  // Delimiters
  COMMA = ",",
  SEMICOLON = ";",
  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",
  // Keywords
  FUNCTION = "FUNCTION",
  LET = "LET",
}

type Token = [TokenType, string];

interface Lexer {
  nextToken(): Token;
}

export function createLexer(source: string): Lexer {
  /** current position in input (points to current char) */
  let position = 0;
  /** current reading position in input (after current char) */
  let readPosition = 1;
  /** TODO: unicode values*/
  let char = source[0];

  function readChar() {
    if (readPosition >= source.length) {
      char = ""; // empty string signals EOF
    } else {
      char = source[readPosition];
    }
    position = readPosition;
    readPosition++;
  }

  function readIdentifier() {
    let start = position;
    while (isLetter(char)) {
      readChar();
    }
    return source.slice(start, position);
  }

  function skipWhitespace() {
    while (isWhitespace(char)) {
      readChar();
    }
  }

  return {
    nextToken() {
      let tok: Token;

      skipWhitespace();

      /**
       * What our lexer needs to do is recognize whether the
       * current character is a letter and if so, it needs to
       * read the rest of the identifier/keyword until it encounters
       * a non-letter-character. Having read that identifier/keyword, we
       * then need to find out if it is a identifier or a keyword, so that
       * we can use the correct token.TokenType.
       */

      switch (char) {
        case "=":
          tok = [TokenType.ASSIGN, char];
        case ";":
          tok = [TokenType.SEMICOLON, char];
        case "(":
          tok = [TokenType.LPAREN, char];
        case ")":
          tok = [TokenType.RPAREN, char];
        case ",":
          tok = [TokenType.COMMA, char];
        case "+":
          tok = [TokenType.PLUS, char];
        case "{":
          tok = [TokenType.LBRACE, char];
        case "}":
          tok = [TokenType.RBRACE, char];
        case "":
          tok = [TokenType.EOF, ""];
        default:
          // change this after completing 'isDigit'
          if (typeof char === "string") {
            const literal = readIdentifier();
            tok = [lookupIdent(literal), literal];
            return tok;
          } else {
            tok = [TokenType.ILLEGAL, char];
          }
      }

      readChar();
      return tok;
    },
  };
}

function isLetter(char: string): boolean {
  return (
    ("a" <= char && char <= "z") || ("A" <= char && char <= "Z") || char === "_"
  );
}

function isDigit(char: string): boolean {
  return false;
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

const keywords = Object.freeze({
  fn: TokenType.FUNCTION,
  let: TokenType.LET,
});

function lookupIdent(
  ident: string
): typeof keywords[keyof typeof keywords] | TokenType.IDENT {
  return TokenType.IDENT;
}

// type Values<T> = T[keyof T];

// type vals = Values<typeof keywords>;
