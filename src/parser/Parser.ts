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
import { LexicalDeclaration, LexicalDeclarator } from './ast/VariableDeclarator'
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
  ClassDeclarationStatement as ClassDeclaration,
  ClassTail,
  ClassElementKind,
  MethodDefinition,
  FieldDefinition,
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
        statements.push(this.statementsAndDeclarations())
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

  public statementsAndDeclarations(): IStatement {
    // 14 ECMAScript Language: Statements and Declarations
    const statement = this.statement()
    if (statement) return statement
    const declaration = this.declaration()
    if (declaration) return declaration

    try {
      return new ExpressionStatement(this.expression())
    } catch (e) {
      if (e instanceof Error) {
        throw this.error(e.message)
      }
      throw this.error('Unknown statement ' + this.get())
    }
  }

  private block(): IStatement {
    const statements: IStatement[] = []
    this.consume(TokenType.LBRACE)
    while (!this.match(TokenType.RBRACE)) {
      const statement = this.statement()
      statement && statements.push(statement)
      while (this.match(TokenType.SEMIKOLON));
    }
    return new BlockStatement(statements)
  }

  private statement(): IStatement | null {
    if (this.match(TokenType.LOG)) return new LogStatement(this.expression())

    // BlockStatement[?Yield, ?Await, ?Return]
    if (this.lookMatch(0, TokenType.LBRACE)) return this.block()
    // VariableStatement[?Yield, ?Await]
    // if (this.lookMatch(0, TokenType.VAR)) return this.lexicalDeclaration()
    // EmptyStatement
    // ExpressionStatement[?Yield, ?Await]
    // IfStatement[?Yield, ?Await, ?Return]
    // BreakableStatement[?Yield, ?Await, ?Return]
    // ContinueStatement[?Yield, ?Await]
    // BreakStatement[?Yield, ?Await]
    // [+Return] ReturnStatement[?Yield, ?Await]
    // WithStatement[?Yield, ?Await, ?Return]
    // LabelledStatement[?Yield, ?Await, ?Return]
    // ThrowStatement[?Yield, ?Await]
    // TryStatement[?Yield, ?Await, ?Return]
    // DebuggerStatement

    // if (this.match(TokenType.IF)) return this.ifElseStatement()
    // if (this.match(TokenType.WHILE)) return this.whileStatement()
    // if (this.match(TokenType.DO)) return this.doWhileStatement()
    // if (this.match(TokenType.FOR)) return this.forStatement()
    // if (this.match(TokenType.BREAK)) return new BreakStatement()
    // if (this.match(TokenType.CONTINUE)) return new ContinueStatement()
    if (this.match(TokenType.RETURN)) return new ReturnStatement(this.expression())
    // if (this.match(TokenType.USE)) return new UseStatement(this.expression())
    // if (this.match(TokenType.DEBUGGER)) return new DebuggerStatement()

    return null
  }

  // Declaration[Yield, Await] :
  private declaration(): IStatement | null {
    // HoistableDeclaration[?Yield, ?Await, ~Default]
    const hoistableDeclaration = this.hoistableDeclaration()
    if (hoistableDeclaration) return hoistableDeclaration
    // ClassDeclaration[?Yield, ?Await, ~Default]
    if (this.match(TokenType.CLASS)) return this.classDeclaration()
    // LexicalDeclaration[+In, ?Yield, ?Await]
    if (this.match(TokenType.CONST)) return this.lexicalDeclaration('const')
    if (this.match(TokenType.LET)) return this.lexicalDeclaration('let')
    return null
  }

  // HoistableDeclaration[Yield, Await, Default] :
  public hoistableDeclaration(): IStatement | null {
    // FunctionDeclaration[?Yield, ?Await, ?Default]
    if (this.match(TokenType.FUNCTION)) return this.functionDeclaration()
    // GeneratorDeclaration[?Yield, ?Await, ?Default]
    // AsyncFunctionDeclaration[?Yield, ?Await, ?Default]
    // AsyncGeneratorDeclaration[?Yield, ?Await, ?Default]
    return null
  }

  // public variableDeclaration() {
  //   this.consume(TokenType.VAR)
  //   const declarations: VariableDeclarator[] = []
  //   do {
  //     const identifier = this.identifierOrArrayPattern()
  //     declarations.push(new VariableDeclarator(identifier, this.match(TokenType.EQ) ? this.expression() : null))
  //   } while (this.match(TokenType.COMMA))

  //   return new LexicalDeclaration(declarations, 'var')
  // }

  public lexicalDeclaration(letOrConst: 'let' | 'const') {
    const declarations: LexicalDeclarator[] = []
    do {
      const identifier = this.identifierOrArrayPattern()

      if (this.match(TokenType.EQ)) {
        declarations.push(new LexicalDeclarator(identifier, this.expression()))
      } else if (letOrConst === 'let') {
        declarations.push(new LexicalDeclarator(identifier, null))
      } else {
        throw new SyntaxError('Missing initializer in const declaration') // remain const
      }
    } while (this.match(TokenType.COMMA))

    return new LexicalDeclaration(declarations, letOrConst)
  }

  private classDeclaration(): IStatement {
    const bindingIdentifier = this.bindingIdentifier()
    const classTail = this.classTail()

    const classDeclaration = new ClassDeclaration(bindingIdentifier, classTail)

    return classDeclaration
  }

  private classExpression() {
    const id = this.lookMatch(0, TokenType.WORD) ? this.bindingIdentifier() : null
    const tail = this.classTail()
  }

  private classTail() {
    const classHeritage = this.lookMatch(0, TokenType.EXTENDS) ? this.classHeritage() : null
    const classBody = this.classBody()
    return new ClassTail(classHeritage, classBody)
  }

  private classHeritage() {
    this.consume(TokenType.EXTENDS)
    return this.bindingIdentifier()
  }

  private classBody(): (MethodDefinition | FieldDefinition)[] {
    const classElementList: (MethodDefinition | FieldDefinition)[] = []

    this.consume(TokenType.LBRACE)
    while (!this.match(TokenType.RBRACE)) {
      const static_ = this.match(TokenType.STATIC)
      if (this.lookMatch(0, TokenType.WORD)) {
        const id = this.bindingIdentifier()
        if (this.lookMatch(0, TokenType.LPAREN)) {
          classElementList.push(this.methodDefinition(id, static_))
          continue
        }
        classElementList.push(this.fieldDefinition(id, static_))
        continue
      }
      if (this.match(TokenType.CONSTRUCTOR)) {
        classElementList.push(this.methodDefinition(new Identifier('constructor'), false))
        continue
      }
    }
    return classElementList
  }

  private methodDefinition(name: Identifier, static_ = false): MethodDefinition {
    return new MethodDefinition(name, this.params(), this.block(), static_)
  }

  private fieldDefinition(key: Identifier, static_ = false): FieldDefinition {
    const value = this.match(TokenType.EQ) ? this.expression() : null
    return new FieldDefinition(key, value, static_)
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
    const name = this.bindingIdentifier()

    return new FunctionDeclarationStatement(name, this.params(), this.block())
  }

  private functionExpression(name: Identifier | null = null): FunctionExpression {
    const id = this.lookMatch(0, TokenType.WORD) ? this.bindingIdentifier() : null

    return new FunctionExpression(id, name, this.params(), this.block())
  }

  private arrowFunctionExpression(): IExpression {
    const name = this.lookMatch(-2, TokenType.WORD) ? new Identifier(this.get(-2).getText()) : null
    const params = this.params()
    this.consume(TokenType.ARROW)
    const body = this.body()

    return new FunctionExpression(null, name, params, body)
  }

  private arrayLiteralOrArrayPattern(): IExpression {
    let index = 0

    let type = this.get(index).getType()

    for (let bracket = 0; !(type === TokenType.RBRACKET || type === TokenType.EOF) || !(bracket === 0); ) {
      if (type === TokenType.LBRACKET) ++bracket
      if (type === TokenType.RBRACKET) --bracket
      type = this.get(++index).getType()
    }
    const isArrayExpression = this.lookMatch(index + 1, TokenType.EQ) === false
    if (isArrayExpression) return this.arrayLiteral()

    const arrayPattern = this.arrayPattern()
    this.consume(TokenType.EQ)
    const arrayExprestion = this.arrayLiteralOrArrayPattern()
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
    if (this.lookMatch(0, TokenType.WORD)) return this.bindingIdentifier()
    return this.arrayPattern()
  }

  private bindingIdentifier(): Identifier {
    return new Identifier(this.consume(TokenType.WORD).getText())
  }

  private arrayLiteral(): IExpression {
    this.consume(TokenType.LBRACKET)
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
      const key = this.literalPropertyName()

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

  // private updateExpression(): IExpression {
  //   if (this.match(TokenType.PLUSPLUS))
  //   return new UpdateExpression(UpdateExpression.Operator.INCREMENT, this.leftValue())
  // if (this.match(TokenType.MINUSMINUS))
  //   return new UpdateExpression(UpdateExpression.Operator.DECREMENT, this.leftValue())
  // }

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

    if (this.lookMatch(0, TokenType.LBRACKET)) return this.arrayLiteralOrArrayPattern()
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

    const obj = { true: 123 }

    return this.literal()
  }

  private literalPropertyName(): IAccessible {
    const current = this.get()

    if (this.lookMatch(0, TokenType.WORD)) return this.bindingIdentifier()
    if (this.match(TokenType.TEXT)) return this.stringLiteral(current.getText(), current.getRaw())
    if (this.match(TokenType.NUMBER)) return this.numericLiteral(current.getText(), current.getRaw())
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
    if (this.match(TokenType.NUMBER)) return this.numericLiteral(current.getText(), current.getRaw())

    throw this.error('Expression expected instead get ' + current)
  }

  private nullLiteral(value: string, raw: string): IAccessible {
    return new Literal(value, raw)
  }

  private booleanLiteral(value: string, raw: string): IAccessible {
    return new Literal(value === 'true', raw)
  }

  private numericLiteral(value: string, raw: string): IAccessible {
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
      return this.maybeCallOrMember(this.bindingIdentifier())
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
