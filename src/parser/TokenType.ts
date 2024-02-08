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
  DEF,
  FUNCTION,
  RETURN,
  MATCH,
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

  PLUS, // +
  MINUS, // -
  STAR, // *
  SLASH, // /
  PERCENT, // %
  EQ, // =
  EQEQ, // ==
  EXCLEQ, // !=
  LTEQ, // <=
  LT, // <
  GT, // >
  GTEQ, // >=

  PLUSEQ, // +=
  MINUSEQ, // -=
  STAREQ, // *=
  SLASHEQ, // /=
  PERCENTEQ, // %=
  AMPEQ, // &=
  CARETEQ, // ^=
  BAREQ, // |=
  COLONCOLONEQ, // ::=
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
  COLONCOLON, // ::

  LPAREN, // (
  RPAREN, // )
  LBRACKET, // [
  RBRACKET, // ]
  LBRACE, // {
  RBRACE, // }
  COMMA, // ,
  DOT, // .

  EOF,
}

export default TokenType
