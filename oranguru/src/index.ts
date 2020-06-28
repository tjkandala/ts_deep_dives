/**
 * Translation of "Writing an interpreter in Go" to
 * my flavor of TypeScript
 *
 * Monkey Syntax:
 *
 * let age = 1;
 * let name = "Monkey";
 * let result = 10 * (20 / 2);
 *
 * let myArray = [1, 2, 3, 4, 5];
 * let tj = {"name": "TJ", "age": 22};
 *
 * myArray[0] // => 1
 * tj["name"] // => "TJ"
 *
 * let add = fn(a, b) { return a + b; };
 * add(1, 2) // => 3
 *
 * also supports higher order functions!
 *
 * Major parts of Monkey that we will build:
 * - the lexer
 * - the parser
 * - the Abstract Syntax Tree (AST)
 * - the internal object system
 * - the evaluator
 */
