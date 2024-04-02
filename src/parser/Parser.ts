import ParseException from 'exceptions/ParseException'
import Token, { IToken } from './Token'
import TokenType from './TokenType'
import BinaryExpression, { BinaryOperator, binary } from './ast/BinaryExpression'
import IExpression from './ast/IExpression'
import IStatement from './ast/IStatement'
import LogStatement from './ast/LogStatement'
import Program from './ast/Program'
import Literal from './ast/Literal'
import { BlockStatement } from './ast/BlockStatement'
import AssignmentExpression, { AssignmentOperator } from './ast/AssignmentExpression'
import { VaraibleDeclaration, VariableDeclarator } from './ast/VariableDeclarator'
import { Identifier } from './ast/Identifier'
import UpdateExpression from './ast/UpdateExpression'
import { IAccessible } from './ast/IAccessible'
import Lexer from './Lexer'
import { ArrayPattern } from './ast/ArrayPattern'
import { AssignmentPattern } from './ast/AssignmentPattern'
import ArrayExpression from './ast/ArrayExpression'
import ObjectExpression from './ast/ObjectExpression'
import ExpressionStatement from './ast/ExpressionStatement'
import { FunctionDeclarationStatement } from './ast/FunctionDeclarationStatement'
import { Params } from './ast/Params'
import { CallExpression, NewExpression } from './ast/CallExpression'
import FunctionExpression from './ast/FunctionExpression'
import ReturnStatement from './ast/ReturnStatement'
import {
  ClassDeclarationStatement,
  KindMethod,
  MethodDefinition,
  PropertyDefinition,
  Super,
} from './ast/ClassDeclarationStatement'
import MemberExpression from './ast/MemberExpression'
import { ThisExpression } from './ast/ThisExpression'
import UnaryExpression from './ast/UnaryExpression'
//! LOCATION

export default class Parser {
  public errors: ParseException[] = []
  private tokens: IToken[]
  private position = 0
  private size: number
  private keywords = [...Lexer.KEYWORDS.values()]
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
  private assignOperator = new Map<TokenType, AssignmentOperator>([
    [TokenType.EQ, AssignmentExpression.Operator.ASSIGNMENT],
    [TokenType.PLUSEQ, AssignmentExpression.Operator.ADDITION_ASSIGNMENT],
    [TokenType.MINUSEQ, AssignmentExpression.Operator.SUBSTRACTION_ASSIGNMENT],
    [TokenType.STAREQ, AssignmentExpression.Operator.MULTIPLICATION_ASSIGNMENT],
    [TokenType.SLASHEQ, AssignmentExpression.Operator.DIVISION_ASSIGNMENT],
    [TokenType.PERCENTEQ, AssignmentExpression.Operator.REMAINDER_ASSIGNMENT],
    [TokenType.AMPEQ, AssignmentExpression.Operator.ADDITION_ASSIGNMENT],
    [TokenType.CARETEQ, AssignmentExpression.Operator.BitwiseXOR_ASSIGNMENT],
    [TokenType.BAREQ, AssignmentExpression.Operator.BitwiseOR_ASSIGNMENT],
    [TokenType.LTLTEQ, AssignmentExpression.Operator.LEFTSHIFT_ASSIGNMENT],
    [TokenType.GTGTEQ, AssignmentExpression.Operator.RIGHTSHIFT_ASSIGNMENT],
    [TokenType.GTGTGTEQ, AssignmentExpression.Operator.UnsignedrightshiftASSIGNMENT],
  ])

  constructor(tokens: IToken[]) {
    this.tokens = tokens
    this.size = tokens.length
  }

  public parse(): Program {
    const statements: IStatement[] = []
    while (!this.match(TokenType.EOF)) {
      try {
        statements.push(this.statementOrBlock())
        while (this.match(TokenType.SEMIKOLON));
      } catch (e) {
        if (e instanceof ParseException) {
          console.error(`${e.name}: ${e.message}`, e.row, e.col)
        }
        console.error(e)
        this.position++
        return new Program([])
      }
    }
    return new Program(statements)
  }

  public parseFunction(): IStatement {
    const statements: IStatement[] = []
    while (!this.match(TokenType.EOF)) {
      try {
        statements.push(this.statementOrBlock())
        while (this.match(TokenType.SEMIKOLON));
      } catch (e) {
        if (e instanceof ParseException) {
          console.error(`${e.name}: ${e.message}`, e.row, e.col)
        }
        console.error(e)
        this.position++
        return new Program([])
      }
    }
    return new BlockStatement(statements)
  }

  private statementOrBlock(): IStatement {
    return this.lookMatch(0, TokenType.LBRACE) ? this.block() : this.statement()
  }

  private block(): IStatement {
    const statements: IStatement[] = []
    this.consume(TokenType.LBRACE)
    while (!this.match(TokenType.RBRACE)) {
      statements.push(this.statementOrBlock())
      while (this.match(TokenType.SEMIKOLON));
    }
    return new BlockStatement(statements)
  }

  private statement(): IStatement {
    if (this.match(TokenType.LOG)) return new LogStatement(this.expression())

    // TODO:
    // if (this.match(TokenType.IF)) return this.ifElseStatement()
    // if (this.match(TokenType.WHILE)) return this.whileStatement()
    // if (this.match(TokenType.DO)) return this.doWhileStatement()
    // if (this.match(TokenType.FOR)) return this.forStatement()
    // if (this.match(TokenType.BREAK)) return new BreakStatement()
    // if (this.match(TokenType.CONTINUE)) return new ContinueStatement()
    if (this.match(TokenType.CLASS)) return this.classDeclaration()
    if (this.match(TokenType.FUNCTION)) return this.functionDeclaration()
    if (this.match(TokenType.RETURN)) return new ReturnStatement(this.expression())
    // if (this.match(TokenType.USE)) return new UseStatement(this.expression())
    // if (this.match(TokenType.DEBUGGER)) return new DebuggerStatement()
    if (this.lookMatch(0, TokenType.CONST) || this.lookMatch(0, TokenType.LET) || this.lookMatch(0, TokenType.VAR))
      return this.variableDeclaration()

    try {
      return new ExpressionStatement(this.expression())
    } catch (e) {
      if (e instanceof Error) {
        throw this.error(e.message)
      }
      throw this.error('Unknown statement ' + this.get())
    }
  }

  public variableDeclaration() {
    const kind = this.get().getText()
    this.match(TokenType.CONST) || this.match(TokenType.LET) || this.match(TokenType.VAR)
    const declarations: VariableDeclarator[] = []
    do {
      const identifier = this.identifierOrArrayPattern()

      if (this.match(TokenType.EQ)) {
        declarations.push(new VariableDeclarator(identifier, this.expression()))
      } else if (kind === 'let' || kind === 'var') {
        declarations.push(new VariableDeclarator(identifier, null))
      } else {
        throw new SyntaxError('Missing initializer in const declaration') // remain const
      }
    } while (this.match(TokenType.COMMA))

    return new VaraibleDeclaration(declarations, kind)
  }

  private classDeclaration(): IStatement {
    const id = new Identifier(this.consume(TokenType.WORD).getText())
    const hasExt = this.match(TokenType.EXTENDS)
    const extends_ = hasExt ? new Identifier(this.consume(TokenType.WORD).getText()) : null
    const classDeclaration = new ClassDeclarationStatement(id, extends_)
    this.consume(TokenType.LBRACE)
    while (!this.match(TokenType.RBRACE)) {
      const static_ = this.match(TokenType.STATIC)
      if (this.lookMatch(0, TokenType.WORD)) {
        const id = this.identifier()
        if (this.lookMatch(0, TokenType.LPAREN)) {
          classDeclaration.addMethod(this.methodDefinition(id, static_))
          continue
        }
        classDeclaration.addField(this.propertyDefinition(id, static_))
        continue
      }
      if (this.match(TokenType.CONSTRUCTOR)) {
        classDeclaration.addMethod(this.methodDefinition(new Identifier('constructor'), false, 'constructor'))
        continue
      }
    }

    return classDeclaration
  }

  private methodDefinition(name: Identifier, static_ = false, type?: KindMethod): MethodDefinition {
    return new MethodDefinition(name, this.functionExpression(name), static_, type)
  }

  private propertyDefinition(key: Identifier, static_ = false): PropertyDefinition {
    const value = this.match(TokenType.EQ) ? this.expression() : null
    return new PropertyDefinition(key, value, static_)
  }

  private expression(): IExpression {
    return this.assignment()
  }

  private assignment(): IExpression {
    const pos = this.position
    if (this.lookMatch(0, TokenType.WORD) || this.lookMatch(0, TokenType.THIS)) {
      const id = this.maybeLeftValue()
      if (id) {
        const expr = this.assignmentExpression(id)
        if (expr) return expr
      }
      this.position = pos
    }

    return this.binary()
  }

  private assignmentExpression(qualifiedName: IAccessible): AssignmentExpression | null {
    const current = this.get()
    const operator = this.assignOperator.get(current.getType())
    if (operator === undefined) return null
    this.match(current.getType())
    return new AssignmentExpression(operator, qualifiedName, this.expression())
  }

  private functionDeclaration(): FunctionDeclarationStatement {
    const name = new Identifier(this.consume(TokenType.WORD).getText())

    return new FunctionDeclarationStatement(name, this.params(), this.block())
  }

  private functionExpression(name: Identifier | null = null): FunctionExpression {
    const id = this.lookMatch(0, TokenType.WORD) ? new Identifier(this.consume(TokenType.WORD).getText()) : null

    return new FunctionExpression(id, name, this.params(), this.block())
  }

  private arrowFunctionExpression(): IExpression {
    const name = this.lookMatch(-2, TokenType.WORD) ? new Identifier(this.get(-2).getText()) : null
    const params = this.params()
    this.consume(TokenType.ARROW)
    const body = this.body()

    return new FunctionExpression(null, name, params, body)
  }

  private arrayLiteral(): IExpression {
    let index = 1

    let type = this.get(index).getType()
    // pass brackets
    for (
      let bracket = 0;
      (!(type === TokenType.RBRACKET) && !(type === TokenType.EOF)) || !(bracket === 0);
      type = this.get(++index).getType()
    ) {
      if (type === TokenType.LBRACKET) ++bracket
      if (type === TokenType.RBRACKET) --bracket
    }
    const isArrayExpression = !this.lookMatch(index + 1, TokenType.EQ)
    if (isArrayExpression) return this.arrayExprestion()

    const arrayPattern = this.arrayPattern()
    this.consume(TokenType.EQ)
    const arrayExprestion = this.arrayLiteral()
    return new AssignmentExpression(AssignmentOperator.ASSIGNMENT, arrayPattern, arrayExprestion)
  }

  private arrayPattern(): ArrayPattern {
    this.consume(TokenType.LBRACKET)
    const items: IAccessible[] = []
    while (!this.match(TokenType.RBRACKET)) {
      const name = this.identifierOrArrayPattern()
      const expr = this.match(TokenType.EQ) ? this.expression() : null
      items.push(expr ? new AssignmentPattern(name, expr) : name)
      this.match(TokenType.COMMA)
    }
    return new ArrayPattern(items)
  }

  private identifierOrArrayPattern(): IAccessible {
    if (this.lookMatch(0, TokenType.WORD)) return new Identifier(this.consume(TokenType.WORD).getText())
    return this.arrayPattern()
  }

  private identifier(): Identifier {
    return new Identifier(this.consume(TokenType.WORD).getText())
  }

  private arrayExprestion(): IExpression {
    this.consume(TokenType.LBRACKET)
    //TODO: elements change class arrayElements
    const elements: (IExpression | null)[] = []
    while (!this.match(TokenType.RBRACKET)) {
      const expr = this.lookMatch(0, TokenType.COMMA) ? null : this.expression()
      elements.push(expr)

      this.lookMatch(0, TokenType.RBRACKET) ? null : this.consume(TokenType.COMMA)
    }

    return new ArrayExpression(elements)
  }

  private objectLiteral(): IExpression {
    this.consume(TokenType.LBRACE)
    const elements: Map<IAccessible, IExpression> = new Map()
    while (!this.match(TokenType.RBRACE)) {
      const key = this.property()

      if (this.lookMatch(0, TokenType.LPAREN)) {
        const name = key instanceof Identifier ? key : null
        elements.set(key, this.functionExpression(name))
      } else {
        this.consume(TokenType.COLON)
        elements.set(key, this.expression())
      }

      this.lookMatch(0, TokenType.RBRACE) ? null : this.consume(TokenType.COMMA)
    }
    return new ObjectExpression(elements)
  }

  private binary(priority = 0): IExpression {
    const currentBinaries = binary[priority]
    if (!currentBinaries) return this.objectCreation()
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

  private objectCreation(): IExpression {
    if (this.match(TokenType.NEW)) return this.maybeCallOrMember(this.maybeNewInARow())

    return this.unary()
  }

  private maybeNewInARow(): NewExpression {
    if (this.match(TokenType.NEW)) return this.newExpression(this.maybeCallOrMember(this.maybeNewInARow(), false))
    const word = this.consume(TokenType.WORD)
    return this.newExpression(this.maybeCallOrMember(new Identifier(word.getText()), false))
  }

  private newExpression(id: IExpression): NewExpression {
    const hasLParen = this.match(TokenType.LPAREN)
    const args: IExpression[] = []
    while (hasLParen && !this.match(TokenType.RPAREN)) {
      args.push(this.expression())
      if (!this.match(TokenType.COMMA)) {
        this.consume(TokenType.RPAREN)
        break
      }
    }

    return new NewExpression(id, args)
  }

  private unary(): IExpression {
    if (this.match(TokenType.PLUSPLUS))
      return new UpdateExpression(UpdateExpression.Operator.INCREMENT, this.leftValue())
    if (this.match(TokenType.MINUSMINUS))
      return new UpdateExpression(UpdateExpression.Operator.DECREMENT, this.leftValue())

    if (this.match(TokenType.DELETE)) return new UnaryExpression(UnaryExpression.Operator.DELETE, this.leftValue())
    if (this.match(TokenType.MINUS))
      return new UnaryExpression(UnaryExpression.Operator.NEGATION, this.primaryExpression())
    if (this.match(TokenType.EXCL))
      return new UnaryExpression(UnaryExpression.Operator.LOGICAL_NOT, this.primaryExpression())
    if (this.match(TokenType.TILDE))
      return new UnaryExpression(UnaryExpression.Operator.BITWISE_NOT, this.primaryExpression())
    if (this.match(TokenType.PLUS)) return new UnaryExpression(UnaryExpression.Operator.PLUS, this.primaryExpression())
    if (this.match(TokenType.TYPEOF))
      return new UnaryExpression(UnaryExpression.Operator.TYPEOF, this.primaryExpression())

    return this.primaryExpression()
  }

  private primaryExpression(): IExpression {
    if (this.lookMatch(0, TokenType.WORD) || this.lookMatch(0, TokenType.THIS)) {
      const leftOrRightValue = this.leftOrRightValue()
      if (leftOrRightValue instanceof CallExpression) return leftOrRightValue
      if (leftOrRightValue instanceof ThisExpression) return leftOrRightValue

      if (this.match(TokenType.PLUSPLUS))
        return new UpdateExpression(UpdateExpression.Operator.INCREMENT, leftOrRightValue, false)
      if (this.match(TokenType.MINUSMINUS))
        return new UpdateExpression(UpdateExpression.Operator.DECREMENT, leftOrRightValue, false)
      return leftOrRightValue
    }

    if (this.lookMatch(0, TokenType.LBRACKET)) return this.arrayLiteral()
    if (this.lookMatch(0, TokenType.LBRACE)) return this.objectLiteral()

    if (this.lookMatch(0, TokenType.LPAREN)) {
      let i = 1
      while (!this.lookMatch(i++, TokenType.RPAREN));
      const isArrowFunction = this.lookMatch(i, TokenType.ARROW)
      return isArrowFunction ? this.arrowFunctionExpression() : this.nested()
    }
    if (this.match(TokenType.FUNCTION)) return this.functionExpression()

    return this.variable()
  }

  private variable(): IExpression {
    if (this.match(TokenType.SUPER)) return this.callExpression(new Super())

    return this.literal()
  }

  private property(): IAccessible {
    const current = this.get()

    if (this.match(TokenType.WORD)) return new Identifier(current.getText()) // for property object {'a': 123} => {a: 123}
    if (this.match(TokenType.TRUE)) return new Identifier(current.getText())
    if (this.match(TokenType.FALSE)) return new Identifier(current.getText())

    return this.literal()
  }

  private literal(): IAccessible {
    const current = this.get()

    if (this.match(TokenType.NULL)) return this.nullLiteral(current.getText(), current.getRaw())
    if (this.match(TokenType.TRUE) || this.match(TokenType.FALSE))
      return this.booleanLiteral(current.getText(), current.getRaw())
    if (this.match(TokenType.TEXT)) return this.stringLiteral(current.getText(), current.getRaw())
    if (this.match(TokenType.NUMBER)) return this.numbericLiteral(current.getText(), current.getRaw())
    // if (this.match(TokenType.WORD)) return new Literal(current.getText(), current.getRaw())

    throw this.error('Expression expected instead get ' + current)
  }

  private nullLiteral(value: string, raw: string): IAccessible {
    return new Literal(value, raw)
  }

  private booleanLiteral(value: string, raw: string): IAccessible {
    return new Literal(value === 'true', raw)
  }

  private numbericLiteral(value: string, raw: string): IAccessible {
    return new Literal(Number(value), raw)
  }

  private stringLiteral(value: string, raw: string): IAccessible {
    return new Literal(value, raw)
  }

  private nested(): IExpression {
    this.consume(TokenType.LPAREN)
    const result = this.expression()
    this.consume(TokenType.RPAREN)
    return result
  }

  private maybeLeftValue(): IAccessible | null {
    const value = this.leftOrRightValue()
    if (value instanceof CallExpression) return null
    if (value instanceof ThisExpression) return null
    return value
  }

  private leftValue(): IAccessible {
    const value = this.leftOrRightValue()
    if (value instanceof CallExpression) throw this.error('only left value')
    if (value instanceof ThisExpression) throw this.error('only left value')
    return value
  }

  private leftOrRightValue(): IAccessible | CallExpression | ThisExpression {
    if (this.lookMatch(0, TokenType.WORD)) {
      const word = this.consume(TokenType.WORD)
      return this.maybeCallOrMember(new Identifier(word.getText()))
    }
    this.consume(TokenType.THIS)
    return this.maybeCallOrMember(new ThisExpression())
  }

  private maybeCallOrMember(
    id: IAccessible | CallExpression | ThisExpression,
    maybeCall = true,
  ): IAccessible | CallExpression | ThisExpression {
    if (maybeCall && this.lookMatch(0, TokenType.LPAREN)) return this.maybeCallOrMember(this.callExpression(id))

    const isOptional = this.lookMatch(0, TokenType.QUESTION) ? 1 : 0
    const isDotOrBracketNotation =
      this.lookMatch(isOptional, TokenType.LBRACKET) || this.lookMatch(isOptional, TokenType.DOT)
    if (isDotOrBracketNotation) return this.maybeCallOrMember(this.memberExpression(id), maybeCall)

    return id
  }

  private memberExpression(
    id: IAccessible | CallExpression | ThisExpression,
  ): IAccessible | CallExpression | ThisExpression {
    const isOptional = this.match(TokenType.QUESTION)

    if (this.match(TokenType.DOT)) {
      const current = this.get()
      const isKeyword = this.keywords.find((k) => k === current.getType()) // keyword also allow
      const tokenType = isKeyword ? current.getType() : TokenType.WORD
      const property = new Literal(this.consume(tokenType).getText(), current.getRaw())
      return new MemberExpression(id, property, false, !!isOptional)
    }
    if (this.match(TokenType.LBRACKET)) {
      const property = this.expression()
      this.consume(TokenType.RBRACKET)
      return new MemberExpression(id, property, true, !!isOptional)
    }
    throw this.error('property expect instead get ' + this.getName())
  }

  private callExpression(qualifiedName: IExpression): CallExpression {
    this.consume(TokenType.LPAREN)
    const args: IExpression[] = []
    while (!this.match(TokenType.RPAREN)) {
      args.push(this.expression())
      if (!this.match(TokenType.COMMA)) {
        this.consume(TokenType.RPAREN)
        break
      }
    }

    return new CallExpression(qualifiedName, args)
  }

  private params(): Params {
    this.consume(TokenType.LPAREN)
    const paramsNames = new Params()
    while (!this.match(TokenType.RPAREN)) {
      const value = this.identifierOrArrayPattern()
      paramsNames.add(value, this.match(TokenType.EQ) ? this.expression() : null)
      this.match(TokenType.COMMA)
    }
    return paramsNames
  }

  private body(): IStatement {
    return this.lookMatch(0, TokenType.LBRACE) ? this.block() : new ReturnStatement(this.expression())
  }

  private addPosition() {
    this.position++
  }

  private consume(type: TokenType): IToken {
    const current = this.get()
    if (!(current.getType() === type)) throw this.error('Token ' + current + " doesn't match " + TokenType[type])
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

  private getName() {
    const type = this.tokens[this.position].getType()
    return TokenType[type]
  }

  private error(text: string): Error {
    const current = this.get()
    return new ParseException(text, current.getRow(), current.getCol())
  }
}
