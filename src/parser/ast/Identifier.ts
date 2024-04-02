import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import { Variables } from 'parser/lib/Variables'
import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'

export class Identifier implements IExpression, IAccessible {
  constructor(public name: string) {}

  public eval(): IValue {
    return Variables.get(this.name)
  }

  public set(value: IValue): IValue {
    return Variables.set(this.name, value), value
  }

  public define(value: IValue): void {
    Variables.define(this.name, value)
  }

  public hoisting(kind: string, value?: IValue): void {
    Variables.hoisting(this.name, kind, value)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.name
  }

  public toHtml(): string {
    return `<span class='variable'>${this.name}</span>`
  }
}
