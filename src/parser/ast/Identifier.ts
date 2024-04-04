import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import { Variables } from 'parser/lib/Variables'
import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'

export class Identifier implements IExpression, IAccessible {
  constructor(public name: string) {}

  public eval(): IECMAScriptLanguageType {
    const result = Variables.get(this.name)
    return result
  }

  public set(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    return Variables.set(this.name, value), value
  }

  public define(value: IECMAScriptLanguageType): void {
    Variables.define(this.name, value)
  }

  public hoisting(kind: string, value?: IECMAScriptLanguageType): void {
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
