/**
 * Oranguru
 *
 * TODO:
 * - stream source code from files, as opposed to passing in a string to eval. attatch filenames
 * and line numbers for better error messages!
 * - implement 'import' keyword
 *
 * fun goals:
 * - make this faster than the original monkey language
 */

type Token =
  | ["ILLEGAL", string] // a token/character we don't know about
  | ["EOF", ""] // "end of file"
  // Identifiers + literals
  | ["IDENT", string] // e.g. add, foobar, x, y, ...
  | ["INT", string] // 1234
  // Operators
  | ["ASSIGN", "="]
  | ["PLUS", "+"]
  // Delimiters
  | ["COMMA", ","]
  | ["SEMICOLON", ";"]
  | ["LPAREN", "("]
  | ["RPAREN", ")"]
  | ["LBRACE", "{"]
  | ["RBRACE", "}"]
  // Keywords
  | Keyword;

type Keyword = ["FUNCTION", string] | ["LET", string];

type TokenType = Token[0];

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
      char = ""; // empty string (not whitespace) signals EOF
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
          tok = ["ASSIGN", char];
          break;
        case ";":
          tok = ["SEMICOLON", char];
          break;
        case "(":
          tok = ["LPAREN", char];
          break;
        case ")":
          tok = ["RPAREN", char];
          break;
        case ",":
          tok = ["COMMA", char];
          break;
        case "+":
          tok = ["PLUS", char];
          break;
        case "{":
          tok = ["LBRACE", char];
          break;
        case "}":
          tok = ["RBRACE", char];
          break;
        case "":
          tok = ["EOF", ""];
          break;
        default:
          // change this after completing 'isDigit'
          if (typeof char === "string") {
            const literal = readIdentifier();
            tok = [lookupIdent(literal), literal];
            return tok;
          } else {
            tok = ["ILLEGAL", char];
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

const keywords: { [token: string]: Keyword[0] } = Object.freeze({
  fn: "FUNCTION",
  let: "LET",
});

function lookupIdent(identOrKeyword: string): Keyword[0] | "IDENT" {
  if (isKeyword(identOrKeyword)) {
    return identOrKeyword;
  }
  // user-defined identifier
  return "IDENT";
}

/** user-defined typeguard to discriminate keywords from identifiers */
function isKeyword(identOrKeyword: string): identOrKeyword is Keyword[0] {
  return identOrKeyword in keywords;
}

// type Values<T> = T[keyof T];

// type vals = Values<typeof keywords>;
