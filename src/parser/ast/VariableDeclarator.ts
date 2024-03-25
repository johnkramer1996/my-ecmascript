import { Variables } from 'parser/lib/Variables'
import IExpression from './IExpression'
import IStatement from './IStatement'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'

export class VariableDeclarator implements IStatement {
  constructor(public id: IAccessible, public init: IExpression | null) {}

  public execute(): void {
    this.id.define(this.init?.eval() || UndefinedValue.UNDEFINED)
  }

  public hoisting(kind: string): void {
    this.id.hoisting(kind)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.id} = ${this.init}`
  }
}

export class VaraibleDeclaration implements IStatement {
  constructor(public declarations: VariableDeclarator[], public kind: string) {}

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
