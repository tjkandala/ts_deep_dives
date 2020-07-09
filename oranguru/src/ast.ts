type ASTNode = StatementNode | ExpressionNode;

type StatementNode = {
  type: "statement";
  tokenLiteral: () => string;
};

type ExpressionNode = {
  type: "expression";
  tokenLiteral: () => string;
};

/**
 * the program (root node of AST) is simply a sequence of statements
 */
interface Program {
  statements: StatementNode[];
}
