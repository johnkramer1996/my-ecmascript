import IVisitor from './IVisitor'
import { IAccessible, instanceOfIAccessible } from './IAccessible'
import IExpression from './IExpression'
import NumberType from 'parser/lib/types/NumberValue'
import IECMAScriptLanguageType from 'parser/lib/IValue'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'

enum Operator {
  INCREMENT = '++',
  DECREMENT = '--',
}

export default class UpdateExpression implements IExpression {
  public static Operator = Operator

  constructor(public operator: Operator, public expression: IAccessible, public prefix: boolean = true) {}

  public eval(): IECMAScriptLanguageType {
    const value = this.expression.eval()
    let result
    switch (this.operator) {
      case Operator.INCREMENT: {
        result = new NumberType(value.asNumber() + 1)
        break
      }
      case Operator.DECREMENT: {
        result = new NumberType(value.asNumber() - 1)
        break
      }
      default:
        throw new OperationIsNotSupportedException('Operation ' + this.operator + ' is not supported')
    }

    return this.expression.set(result), this.prefix ? result : value
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `${this.prefix ? this.operator : ''}${this.expression}${!this.prefix ? this.operator : ''}`
  }
}
