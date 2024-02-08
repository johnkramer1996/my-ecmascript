import ParserException from 'exceptions/ParseException'
import Token, { IToken } from './Token'
import TokenType from './TokenType'
import BinaryExpression, { binary } from './ast/BinaryExpression'
import IExpression from './ast/IExpression'
import IStatement from './ast/IStatement'
import LogStatement from './ast/LogStatement'
import Program from './ast/Program'
import Literal from './ast/Literal'
import { BlockStatement } from './ast/BlockStatement'
import { VaraibleDeclaration, VariableDeclarator } from './ast/AssignmentExpression'
import { Identifier } from './ast/Identifier'
import UpdateExpression from './ast/UpdateExpression'
import { IAccessible } from './ast/IAccessible'
import ContainerAccessExpression from './ast/ContainerAccessExpression'
import Lexer from './Lexer'

export class Location {
  static token: IToken
  static prevToken: IToken
  static blocks: IToken[] = []
  static statements: IToken[] = []
  static setToken(token: IToken) {
    if (token.getType() === TokenType.EOF && this.token.getType() === TokenType.EOF) return
    this.prevToken = this.token
    this.token = token
  }
  static getPrevToken() {
    return this.prevToken
  }
  static getCurrentToken() {
    return this.token
  }
  static startStatement() {
    this.statements.push(this.token)
  }
  static endStatement() {
    const startToken = this.statements.pop()
    if (!startToken) throw new Error('startToken')
    return startToken
  }
  static startBlock() {
    this.blocks.push(this.token)
  }
  static endBlock() {
    const startToken = this.blocks.pop()
    if (!startToken) throw new Error('startToken')
    return startToken
  }
}

type BinaryExpressionWithoutOperatorConsturctor = new (left: IExpression, right: IExpression) => BinaryExpression

type Binary =
  // | {
  //     name: string
  //     list: { token: TokenType; class: ConditionalExpressionWithoutOperatorConsturctor }[]
  //   }
  {
    name: string
    list: { token: TokenType; class: BinaryExpressionWithoutOperatorConsturctor }[]
  } // TODO make a general class

export default class Parser {
  public errors: ParserException[] = []
  private tokens: IToken[]
  private position = 0
  private size: number
  private brackets = [
    {
      openParent: TokenType.LPAREN,
      closeParent: TokenType.RPAREN,
    },
    {
      openParent: TokenType.LBRACKET,
      closeParent: TokenType.RBRACKET,
    },
    {
      openParent: TokenType.LBRACE,
      closeParent: TokenType.RBRACE,
    },
  ]
  private assignOperator = new Map([
    [TokenType.EQ, null],
    [TokenType.PLUSEQ, BinaryExpression.Operator.ADD],
    [TokenType.MINUSEQ, BinaryExpression.Operator.SUBTRACT],
    [TokenType.STAREQ, BinaryExpression.Operator.MULTIPLY],
    [TokenType.SLASHEQ, BinaryExpression.Operator.DIVIDE],
    [TokenType.PERCENTEQ, BinaryExpression.Operator.REMAINDER],
    [TokenType.AMPEQ, BinaryExpression.Operator.AND],
    [TokenType.CARETEQ, BinaryExpression.Operator.XOR],
    [TokenType.BAREQ, BinaryExpression.Operator.OR],
    [TokenType.COLONCOLONEQ, BinaryExpression.Operator.PUSH],
    [TokenType.LTLTEQ, BinaryExpression.Operator.LSHIFT],
    [TokenType.GTGTEQ, BinaryExpression.Operator.RSHIFT],
    [TokenType.GTGTGTEQ, BinaryExpression.Operator.URSHIFT],
  ])

  constructor(tokens: IToken[]) {
    this.tokens = tokens
    this.size = tokens.length
  }

  public parse(): Program {
    // TODO:
    // Location.setToken(this.get())
    // Location.startBlock()
    const statements: IStatement[] = []
    while (!this.match(TokenType.EOF)) {
      try {
        statements.push(this.statementOrBlock())
        while (this.match(TokenType.SEMIKOLON));
      } catch (e) {
        // TODO:
        // if (e instanceof ParseException) {
        //   console.error(`${e.name}: ${e.message}`, e.row, e.col)
        // }
        console.log(e)
        this.position++
        return new Program([])
      }
    }
    return new Program(statements)
  }

  private statementOrBlock(): IStatement {
    return this.lookMatch(0, TokenType.LBRACE) ? this.block() : this.statement()
  }

  private block(): IStatement {
    Location.startBlock()
    const statements: IStatement[] = []
    this.consume(TokenType.LBRACE)
    while (!this.match(TokenType.RBRACE)) {
      statements.push(this.statementOrBlock())
      while (this.match(TokenType.SEMIKOLON));
    }
    return new BlockStatement(statements)
  }

  private statement(): IStatement {
    Location.startStatement()

    if (this.match(TokenType.LOG)) return new LogStatement(this.expression())

    // TODO:
    // if (this.match(TokenType.IF)) return this.ifElseStatement()
    // if (this.match(TokenType.WHILE)) return this.whileStatement()
    // if (this.match(TokenType.DO)) return this.doWhileStatement()
    // if (this.match(TokenType.FOR)) return this.forStatement()
    // if (this.match(TokenType.BREAK)) return new BreakStatement()
    // if (this.match(TokenType.CONTINUE)) return new ContinueStatement()
    // if (this.match(TokenType.FUNCTION)) return this.functionDefine()
    // if (this.match(TokenType.RETURN)) return new ReturnStatement(this.expression())
    // if (this.match(TokenType.USE)) return new UseStatement(this.expression())
    // // if (this.match(TokenType.MATCH)) return new ExpressionStatement(this.matchExpression())
    // if (this.match(TokenType.DEBUGGER)) return new DebuggerStatement()
    if (this.lookMatch(0, TokenType.CONST) || this.lookMatch(0, TokenType.LET) || this.lookMatch(0, TokenType.VAR))
      return this.variableDeclaration()

    throw new Error('error statement')
    // try {
    //   return new ExpressionStatement(this.expression())
    // } catch (e) {
    //   if (e instanceof Error) {
    //     throw this.error(e.message)
    //     // throw this.error('Unknown statement ' + current + this.get())
    //     // }
    //   }
    //   throw 123
    // }
  }

  public variableDeclaration() {
    const kind = this.get().getText()
    this.match(TokenType.CONST) || this.match(TokenType.LET) || this.match(TokenType.VAR)
    const declarations: VariableDeclarator[] = []
    do {
      const identifier = new Identifier(this.consume(TokenType.WORD).getText())
      if (this.match(TokenType.EQ)) {
        declarations.push(new VariableDeclarator(identifier, this.expression()))
      } else if (kind === 'let' || kind === 'var') {
        declarations.push(new VariableDeclarator(identifier, null))
      } else throw new SyntaxError('Missing initializer in const declaration')
    } while (this.match(TokenType.COMMA))

    return new VaraibleDeclaration(declarations, kind)
  }

  private expression(): IExpression {
    const expr = this.binary()
    return expr
  }

  private dotOrBracketNotation(): IExpression[] {
    const indices: IExpression[] = []
    while (this.lookMatch(0, TokenType.DOT) || this.lookMatch(0, TokenType.LBRACKET)) {
      if (this.match(TokenType.DOT)) {
        const current = this.get()
        const keywords = [...Lexer.KEYWORDS.values()]
        const isKeyword = keywords.find((k) => k === current.getType())
        const tokenType = isKeyword ? current.getType() : TokenType.WORD
        const property = this.consume(tokenType).getText()
        const key = new Literal(property, current.getRaw())
        indices.push(key)
      }
      if (this.match(TokenType.LBRACKET)) {
        indices.push(this.expression())
        this.consume(TokenType.RBRACKET)
      }
    }
    return indices
  }

  private binary(priority = 0): IExpression {
    const currentBinaries = binary[priority]
    if (!currentBinaries) return this.unary()
    let leftExpr = this.binary(priority + 1)

    while (true) {
      const coincidence = currentBinaries.list.some((binary) => {
        const BinaryConstructor = binary.class
        const has = this.match(binary.token)
        if (!has) return false
        const rightExpr = this.binary(priority + 1)
        leftExpr = new BinaryConstructor(leftExpr, rightExpr)
        return true
      })
      if (coincidence) continue
      break
    }

    return leftExpr
  }

  private unary(): IExpression {
    if (this.match(TokenType.PLUSPLUS)) return new UpdateExpression(UpdateExpression.Operator.INCREMENT, this.primary())
    if (this.match(TokenType.MINUSMINUS))
      return new UpdateExpression(UpdateExpression.Operator.DECREMENT, this.primary())

    return this.variable()
  }

  private primary(): IExpression {
    // if (this.match(TokenType.COLONCOLON)) return new FunctionReferenceExpression(this.consume(TokenType.WORD).getText())
    // if (this.match(TokenType.MATCH)) return this.matchExpression()
    // if (this.lookMatch(0, TokenType.LPAREN)) return this.nested()

    return this.variable()
  }

  private variable(): IExpression {
    if (this.lookMatch(0, TokenType.WORD)) {
      const qualifiedNameExpr = this.qualifiedName()
      // TODO:
      // if (this.lookMatch(0, TokenType.LPAREN)) return this.callExpression(qualifiedNameExpr)

      if (this.match(TokenType.PLUSPLUS))
        return new UpdateExpression(UpdateExpression.Operator.INCREMENT, qualifiedNameExpr, false)
      if (this.match(TokenType.MINUSMINUS))
        return new UpdateExpression(UpdateExpression.Operator.DECREMENT, qualifiedNameExpr, false)
      return qualifiedNameExpr
    }
    const value = this.value()
    console.log({ value })
    return value
  }

  private value(): IExpression {
    const current = this.get()

    if (this.match(TokenType.NUMBER)) return new Literal(Number(current.getText()), current.getRaw())
    // TODO:
    // if (this.match(TokenType.WORD)) return new Literal(current.getText(), current.getRaw())

    throw this.error('Expression expected instead get ' + current)
  }

  private qualifiedName(): IAccessible {
    if (
      this.lookMatch(0, TokenType.WORD) &&
      (this.lookMatch(1, TokenType.LBRACKET) || this.lookMatch(1, TokenType.DOT))
    )
      return new ContainerAccessExpression(this.consume(TokenType.WORD).getText(), this.dotOrBracketNotation())
    return new Identifier(this.consume(TokenType.WORD).getText())
  }

  private addPosition() {
    this.position++
    Location.setToken(this.get())
  }

  private consume(type: TokenType): IToken {
    const current = this.get()
    if (current.getType() !== type) throw this.error('Token ' + current + " doesn't match " + TokenType[type])
    this.addPosition()
    return current
  }

  private match(type: TokenType): boolean {
    return type === this.get().getType() ? (this.addPosition(), true) : false
  }

  private lookMatch(pos: number, type: TokenType): boolean {
    return this.get(pos).getType() === type
  }

  private get(relativePosition: number = 0): IToken {
    const position = this.position + relativePosition
    if (position >= this.size) return new Token(TokenType.EOF, '', '', -1, -1, -1, -1)
    return this.tokens[position]
  }

  private error(text: string): Error {
    const current = this.get()
    return new ParserException(text, current.getRow(), current.getCol())
  }
}
