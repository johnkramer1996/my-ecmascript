import IValue from 'parser/lib/IValue'
import NumberValue from 'parser/lib/types/NumberValue'
import IExpression from './IExpression'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'
import IVisitor from './IVisitor'
import Types from 'parser/lib/types/Types'
import StringValue from 'parser/lib/types/StringValue'
import BooleanValue from 'parser/lib/types/BooleanValue'
import { ObjectValue } from 'parser/lib/types/ObjectValue'
import MemberExpression from './MemberExpression'

enum Operator {
  DELETE = 'delete',
  VOID = 'void',
  TYPEOF = 'typeof',
  PLUS = '+',
  NEGATION = '-',
  BITWISE_NOT = '~',
  LOGICAL_NOT = '!',
  AWAIT = 'await',
}

export default class UnaryExpression implements IExpression {
  public static Operator = Operator

  constructor(public operator: Operator, public expression: IExpression) {}

  public eval(): IValue {
    const value = this.expression.eval()
    switch (this.operator) {
      case Operator.DELETE:
        if (!(this.expression instanceof MemberExpression))
          throw new Error('Delete of an unqualified identifier in strict mode.')
        return this.expression.delete() ? BooleanValue.TRUE : BooleanValue.FALSE
      case Operator.TYPEOF:
        //TODO: TYPEOF NULL == OBJECT
        return new StringValue(value.type())
      case Operator.PLUS:
        return new NumberValue(value.asNumber())
      case Operator.NEGATION:
        return new NumberValue(-value.asNumber())
      case Operator.LOGICAL_NOT:
        return new NumberValue(Boolean(value.asNumber()) ? 1 : 0)
      case Operator.BITWISE_NOT:
        return new NumberValue(~value.asNumber())
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
