import IValue from 'parser/lib/IValue'
import BooleanValue from 'parser/lib/types/BooleanValue'
import NumberValue from 'parser/lib/types/NumberValue'
import IExpression from './IExpression'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'
import IVisitor from './IVisitor'

enum ConditionOperator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  LT = '<',
  LTEQ = '<=',
  GT = '>',
  GTEQ = '>=',
  AND = '&&',
  OR = '||',
}

export default class ConditionalExpression implements IExpression {
  public static Operator = ConditionOperator

  constructor(public operator: ConditionOperator, public left: IExpression, public right: IExpression) {}

  public eval(): IValue {
    const leftValue = this.left.eval()
    const rightValue = this.right.eval()

    const isBoolean = leftValue instanceof BooleanValue || rightValue instanceof BooleanValue
    const isNumber = leftValue instanceof NumberValue || rightValue instanceof NumberValue
    const compareString = isNumber ? 0 : leftValue.asString().localeCompare(rightValue.asString())
    const number1 = isBoolean || isNumber ? leftValue.asNumber() : compareString
    const number2 = isBoolean || isNumber ? rightValue.asNumber() : 0

    const result = (() => {
      switch (this.operator) {
        case ConditionOperator.EQUALS:
          return number1 === number2
        case ConditionOperator.NOT_EQUALS:
          return number1 !== number2
        case ConditionOperator.LT:
          return number1 < number2
        case ConditionOperator.LTEQ:
          return number1 <= number2
        case ConditionOperator.GT:
          return number1 > number2
        case ConditionOperator.GTEQ:
          return number1 >= number2
        case ConditionOperator.AND:
          return number1 !== 0 && number2 !== 0
        case ConditionOperator.OR:
          return number1 !== 0 || number2 !== 0
        default:
          throw new OperationIsNotSupportedException('Operation ' + this.operator + ' is not supported')
      }
    })()

    return BooleanValue[result ? 'TRUE' : 'FALSE']
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `${this.left} ${this.operator} ${this.right}`
  }
}
