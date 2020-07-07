/**
 * Oranguru
 *
 * TODO:
 * - implement lexer as iterator
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
  | Operator
  // Delimiters
  | Delimiter
  // Keywords
  | Keyword;

type Operator =
  | ["ASSIGN", "="]
  | ["PLUS", "+"]
  | ["MINUS", "-"]
  | ["BANG", "!"]
  | ["ASTERISK", "*"]
  | ["SLASH", "/"]
  | ["LESSTHAN", "<"]
  | ["GREATERTHAN", ">"]
  | ["EQUAL", "=="]
  | ["NOT_EQUAL", "!="];

type Delimiter =
  | ["COMMA", ","]
  | ["SEMICOLON", ";"]
  | ["LPAREN", "("]
  | ["RPAREN", ")"]
  | ["LBRACE", "{"]
  | ["RBRACE", "}"];

// TODO: narrower types. will have to refactor 'lookupIdent' further
type Keyword =
  | ["FUNCTION", string]
  | ["LET", string]
  | ["TRUE", string]
  | ["FALSE", string]
  | ["IF", string]
  | ["ELSE", string]
  | ["RETURN", string];

// type TokenType = Token[0];

export function* createLexer(source: string) {
  // setup
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

  function readNumber() {
    let start = position;
    while (isDigit(char)) {
      readChar();
    }
    return source.slice(start, position);
  }

  function skipWhitespace() {
    while (isWhitespace(char)) {
      readChar();
    }
  }

  function peekChar() {
    if (readPosition > source.length) {
      return "";
    } else {
      return source[readPosition];
    }
  }

  function nextToken() {
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
        // TODO: implement 'makeTwoCharToken()'
        if (peekChar() == "=") {
          readChar();
          tok = ["EQUAL", "=="];
        } else {
          tok = ["ASSIGN", char];
        }
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
      case "-":
        tok = ["MINUS", char];
        break;
      case "!":
        if (peekChar() == "=") {
          readChar();
          tok = ["NOT_EQUAL", "!="];
        } else {
          tok = ["BANG", char];
        }
        break;
      case "*":
        tok = ["ASTERISK", char];
        break;
      case "/":
        tok = ["SLASH", char];
        break;
      case "<":
        tok = ["LESSTHAN", char];
        break;
      case ">":
        tok = ["GREATERTHAN", char];
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
        if (isLetter(char)) {
          const literal = readIdentifier();
          tok = [lookupIdent(literal), literal];
          return tok;
        } else if (isDigit(char)) {
          tok = ["INT", readNumber()];
          return tok;
        } else {
          tok = ["ILLEGAL", char];
        }
    }

    readChar();
    return tok;
  }

  // iteration
  while (true) {
    const tok = nextToken();
    if (tok[0] === "EOF") {
      return tok;
    } else {
      yield tok;
    }
  }
}

function isLetter(char: string): boolean {
  return (
    ("a" <= char && char <= "z") || ("A" <= char && char <= "Z") || char === "_"
  );
}

/** only supports integers */
function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

const keywords = Object.freeze({
  fn: "FUNCTION",
  let: "LET",
  true: "TRUE",
  false: "FALSE",
  if: "IF",
  else: "ELSE",
  return: "RETURN",
});

function lookupIdent(identOrKeyword: string): Keyword[0] | "IDENT" {
  if (isKeyword(identOrKeyword)) {
    // don't worry about this cast. user-defined type guards aren't type-safe either
    return keywords[identOrKeyword] as Keyword[0];
  }
  // user-defined identifier
  return "IDENT";
}

/** user-defined typeguard to discriminate keywords from identifiers */
function isKeyword(
  identOrKeyword: string
): identOrKeyword is keyof typeof keywords {
  return identOrKeyword in keywords;
}
