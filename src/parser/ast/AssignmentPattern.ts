import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IECMAScriptLanguageType from 'parser/lib/IValue'
import { Variables } from 'parser/lib/Variables'
import UndefinedType from 'parser/lib/types/UndefinedValue'

export class AssignmentPattern implements IExpression, IAccessible {
  constructor(public identifier: IAccessible, public valueExpr: IExpression) {}

  public eval(): IECMAScriptLanguageType {
    return this.get()
  }

  public get(): IECMAScriptLanguageType {
    return this.identifier.eval()
  }

  public set(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    return this.define(value), value
  }

  public define(value: IECMAScriptLanguageType): void {
    this.identifier.define(value === UndefinedType.UNDEFINED ? this.getValueExpr().eval() : value)
  }

  public hoisting(kind: string): void {
    this.identifier.hoisting(kind)
  }

  public getValueExpr(): IExpression {
    return this.valueExpr
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.identifier + (this.valueExpr == null ? '' : ' = ' + this.valueExpr)
  }
}
