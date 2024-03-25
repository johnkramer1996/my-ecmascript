import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'
import { Variables } from 'parser/lib/Variables'
import IVisitor from './IVisitor'

export class ThisExpression implements IExpression {
  public eval(): IValue {
    return Variables.getThis()
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return 'this'
  }
}
