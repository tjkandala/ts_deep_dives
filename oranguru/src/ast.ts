type ASTNode = StatementNode | ExpressionNode;

type StatementNode = {
  type: "statement";
  tokenLiteral: () => string;
};

type ExpressionNode = {
  type: "expression";
  tokenLiteral: () => string;
};
