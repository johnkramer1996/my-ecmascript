import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { ObjectType } from 'parser/lib/types/ObjectValue'
import { IAccessible } from './IAccessible'
import { OrdinaryObjectCreate } from 'parser/lib/spec/10.1'

export default class ObjectExpression implements IExpression {
  constructor(public elements: Map<IAccessible, IExpression>) {}

  public eval(): IECMAScriptLanguageType {
    const object = OrdinaryObjectCreate(ObjectType.ObjectPrototype, [])
    for (const [key, valueExpr] of this.elements.entries()) {
      object['[[Set]]'](key.toString(), valueExpr.eval(), object)
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
