import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { ObjectValue } from 'parser/lib/types/ObjectValue'
import { IAccessible } from './IAccessible'

export default class ObjectExpression implements IExpression {
  constructor(public elements: Map<IAccessible, IExpression>) {}

  public eval(): IValue {
    const object = new ObjectValue()
    for (const [key, valueExpr] of this.elements.entries()) {
      object.set(key.toString(), valueExpr.eval())
    }
    return object
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.elements.toString()
  }
}
