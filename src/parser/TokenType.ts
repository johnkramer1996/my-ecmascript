enum TokenType {
  WORD,
  NUMBER,
  TEXT,
  HEX_NUMBER,

  // keyword
  LOG,
  IF,
  ELSE,
  WHILE,
  FOR,
  DO,
  BREAK,
  CONTINUE,
  FUNCTION,
  RETURN,
  CASE,
  CONST,
  LET,
  VAR,
  THIS,
  NULL,
  TRUE,
  FALSE,
  UNDEFINED,
  DEBUGGER,
  NEW,
  CLASS,
  EXTENDS,
  CONSTRUCTOR,
  SUPER,
  STATIC,
  TYPEOF,
  DELETE,

  PLUS, // +
  MINUS, // -
  STAR, // *
  SLASH, // /
  PERCENT, // %
  EQ, // =
  EQEQ, // ==
  EQEQEQ, // ==
  EXCLEQ, // !=
  EXCLEQEQ, // !=
  LTEQ, // <=
  LT, // <
  GT, // >
  GTEQ, // >=

  //compound assignment operators
  PLUSEQ, // +=
  MINUSEQ, // -=
  STAREQ, // *=
  SLASHEQ, // /=
  PERCENTEQ, // %=
  AMPEQ, // &=
  CARETEQ, // ^=
  BAREQ, // |=
  LTLTEQ, // <<=
  GTGTEQ, // >>=
  GTGTGTEQ, // >>>=

  PLUSPLUS, // ++
  MINUSMINUS, // --

  LTLT, // <<
  GTGT, // >>
  GTGTGT, // >>>

  EXCL, // !
  TILDE, // ~
  CARET, // ^
  BAR, // |
  BARBAR, // ||
  AMP, // &
  AMPAMP, // &&

  SEMIKOLON, // ;
  QUESTION, // ?
  COLON, // :

  LPAREN, // (
  RPAREN, // )
  LBRACKET, // [
  RBRACKET, // ]
  LBRACE, // {
  RBRACE, // }
  DOT, // .
  COMMA, // ,
  ARROW, // =>

  EOF,
}

export default TokenType
