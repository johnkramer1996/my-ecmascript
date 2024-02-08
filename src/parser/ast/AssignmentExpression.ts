import Variables from 'parser/lib/Variables'
import IExpression from './IExpression'
import IStatement from './IStatement'
import { Identifier } from './Identifier'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import IVisitor from './IVisitor'
import IValue from 'parser/lib/IValue'
import BinaryExpression, { BinaryOperator } from './BinaryExpression'
import { IAccessible } from './IAccessible'
import Literal from './Literal'

export class VariableDeclarator implements IStatement {
  // public start: number
  // public end: number
  constructor(public id: Identifier, public init: IExpression | null) {
    // this.start = id.start
    // this.end = init?.end || id.end
  }

  public execute(): void {
    const result = this.init?.eval() || UndefinedValue.UNDEFINED
    this.id.define(result)
  }

  public hoisting(kind: string): void {
    Variables.hoisting(this.id.getName(), kind)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.id} = ${this.init}`
  }
}

export class VaraibleDeclaration implements IStatement {
  // public start: number
  // public end: number
  constructor(public declarations: VariableDeclarator[], public kind: string) {
    // this.start = Location.endStatement().getStart()
    // this.end = Location.getPrevToken().getEnd()
  }

  public execute(): void {
    for (const decl of this.declarations) decl.execute()
  }

  public hoisting(): void {
    for (const decl of this.declarations) decl.hoisting(this.kind)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.kind} ${this.declarations}`
  }
}

export default class AssignmentExpression implements IExpression {
  constructor(public operator: BinaryOperator | null, public target: IAccessible, public expression: IExpression) {}

  public eval(): IValue {
    if (this.operator === null) return this.target.set(this.expression.eval())
    return this.target.set(
      new BinaryExpression(this.operator, new Literal(this.target.get()), new Literal(this.expression.eval())).eval(),
    )
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.target} = ${this.expression}`
  }
}
