import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { getNC } from 'parser/lib/spec/6.2'
import { Evalution } from 'parser/lib/spec/13.3'

export class CallExpression implements IExpression {
  constructor(public callee: IExpression, public args: IExpression[]) {}

  public eval(): IECMAScriptLanguageType {
    const result = getNC(Evalution(this.callee, this.args))
    return result['[[Value]]']
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.callee + '(' + this.args.toString() + ')'
  }
}

export class NewExpression implements IExpression {
  constructor(public callee: IExpression, public args: IExpression[]) {}

  public eval(): IECMAScriptLanguageType {
    throw 123
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.callee + '(' + this.args.toString() + ')'
  }
}
