import IVisitor from './IVisitor'
import { instanceOfIAccessible } from './IAccessible'
import IExpression from './IExpression'
import NumberValue from 'parser/lib/types/NumberValue'
import IValue from 'parser/lib/IValue'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'

enum Operator {
  INCREMENT = '++',
  DECREMENT = '--',
}

export default class UpdateExpression implements IExpression {
  public static Operator = Operator

  constructor(public operator: Operator, public expression: IExpression, public prefix: boolean = true) {}

  public eval(): IValue {
    const value = this.expression.eval()
    switch (this.operator) {
      case Operator.INCREMENT: {
        const result = new NumberValue(value.asNumber() + 1)
        return instanceOfIAccessible(this.expression)
          ? (this.expression.set(result), this.prefix ? result : value)
          : // TODO: this.prefix ? result : value
            result
      }
      case Operator.DECREMENT: {
        const result = new NumberValue(value.asNumber() - 1)
        return instanceOfIAccessible(this.expression)
          ? (this.expression.set(result), this.prefix ? result : value)
          : result
      }
      default:
        throw new OperationIsNotSupportedException('Operation ' + this.operator + ' is not supported')
    }
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `${this.operator}${this.expression}`
  }
}
