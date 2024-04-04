import IECMAScriptLanguageType from 'parser/lib/IValue'
import NumberType from 'parser/lib/types/NumberValue'
import IExpression from './IExpression'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'
import IVisitor from './IVisitor'
import ECMAScriptLanguageTypes from 'parser/lib/types/Types'
import StringType from 'parser/lib/types/StringValue'
import { BooleanType } from 'parser/lib/types/BooleanValue'
import { ObjectType } from 'parser/lib/types/ObjectValue'
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

  public eval(): IECMAScriptLanguageType {
    const value = this.expression.eval()
    switch (this.operator) {
      case Operator.DELETE:
        if (!(this.expression instanceof MemberExpression))
          throw new Error('Delete of an unqualified identifier in strict mode.')
        return this.expression.delete() ? BooleanType.TRUE : BooleanType.FALSE
      case Operator.TYPEOF:
        //TODO: TYPEOF NULL == OBJECT
        return new StringType(value.type())
      case Operator.PLUS:
        return new NumberType(value.asNumber())
      case Operator.NEGATION:
        return new NumberType(-value.asNumber())
      case Operator.LOGICAL_NOT:
        return new NumberType(Boolean(value.asNumber()) ? 1 : 0)
      case Operator.BITWISE_NOT:
        return new NumberType(~value.asNumber())
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
