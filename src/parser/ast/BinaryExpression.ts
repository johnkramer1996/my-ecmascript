import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'
import NumberType from 'parser/lib/types/NumberValue'
import IVisitor from './IVisitor'
import TokenType from 'parser/TokenType'
import StringType from 'parser/lib/types/StringValue'
import ConditionalExpression from './ConditionalExpression'

export enum BinaryOperator {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  REMAINDER = '%',
  AND = '&',
  OR = '|',
  XOR = '^',
  LSHIFT = '<<',
  RSHIFT = '>>',
  URSHIFT = '>>>',
}

export default class BinaryExpression implements IExpression {
  public static Operator = BinaryOperator

  constructor(public operator: BinaryOperator, public left: IExpression, public right: IExpression) {}

  public eval(): IECMAScriptLanguageType {
    const leftValue = this.left.eval()
    const rightValue = this.right.eval()

    if (leftValue instanceof StringType || rightValue instanceof StringType) {
      const leftString = leftValue.asString()
      switch (this.operator) {
        case BinaryOperator.ADD:
        default:
          return new StringType(leftString + rightValue.asString())
      }
    }

    // TODO:
    // if (value1 instanceof ArrayValue) {
    //   switch (this.operator) {
    //     case BinaryOperator.LSHIFT:
    //       if (!(value2 instanceof ArrayValue)) throw new TypeException('Cannot merge non array value to array')
    //       return ArrayValue.merge(value1, value2)
    //     case BinaryOperator.PUSH:
    //     default:
    //       return ArrayValue.add(value1, value2)
    //   }
    // }

    const number1 = leftValue.asNumber()
    const number2 = rightValue.asNumber()

    const result = (() => {
      switch (this.operator) {
        case BinaryOperator.ADD:
          return number1 + number2
        case BinaryOperator.SUBTRACT:
          return number1 - number2
        case BinaryOperator.MULTIPLY:
          return number1 * number2
        case BinaryOperator.DIVIDE:
          return number1 / number2
        case BinaryOperator.REMAINDER:
          return number1 % number2
        case BinaryOperator.AND:
          return number1 & number2
        case BinaryOperator.XOR:
          return number1 ^ number2
        case BinaryOperator.OR:
          return number1 | number2
        case BinaryOperator.LSHIFT:
          return number1 << number2
        case BinaryOperator.RSHIFT:
          return number1 >> number2
        case BinaryOperator.URSHIFT:
          return number1 >>> number2
        default:
          throw new OperationIsNotSupportedException('Operation ' + this.operator + ' is not supported')
      }
    })()

    return new NumberType(result)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `${this.left} ${this.operator} ${this.right}`
  }
}

// TODO: MOVE OUT
export const binary = [
  {
    name: 'bitwiseOr',
    list: [{ token: TokenType.BAR, class: BinaryExpression.bind(null, BinaryExpression.Operator.OR) }],
  },
  {
    name: 'bitwiseXor',
    list: [{ token: TokenType.CARET, class: BinaryExpression.bind(null, BinaryExpression.Operator.XOR) }],
  },
  {
    name: 'bitwiseAnd',
    list: [{ token: TokenType.AMP, class: BinaryExpression.bind(null, BinaryExpression.Operator.AND) }],
  },
  {
    name: 'equality',
    list: [
      { token: TokenType.EQEQ, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.EQUALS) },
      {
        token: TokenType.EXCLEQ,
        class: ConditionalExpression.bind(null, ConditionalExpression.Operator.NOT_EQUALS),
      },
      {
        token: TokenType.EQEQEQ,
        class: ConditionalExpression.bind(null, ConditionalExpression.Operator.STRICT_EQUALS),
      },
      {
        token: TokenType.EXCLEQEQ,
        class: ConditionalExpression.bind(null, ConditionalExpression.Operator.STRICT_NOT_EQUALS),
      },
    ],
  },
  {
    name: 'conditional',
    list: [
      { token: TokenType.LT, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.LT) },
      { token: TokenType.LTEQ, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.LTEQ) },
      { token: TokenType.GT, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.GT) },
      { token: TokenType.GTEQ, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.GTEQ) },
    ],
  },
  {
    name: 'shift',
    list: [
      { token: TokenType.LTLT, class: BinaryExpression.bind(null, BinaryExpression.Operator.LSHIFT) },
      { token: TokenType.GTGT, class: BinaryExpression.bind(null, BinaryExpression.Operator.RSHIFT) },
      { token: TokenType.GTGTGT, class: BinaryExpression.bind(null, BinaryExpression.Operator.URSHIFT) },
    ],
  },
  {
    name: 'additive',
    list: [
      { token: TokenType.PLUS, class: BinaryExpression.bind(null, BinaryExpression.Operator.ADD) },
      { token: TokenType.MINUS, class: BinaryExpression.bind(null, BinaryExpression.Operator.SUBTRACT) },
    ],
  },
  {
    name: 'multiplicative',
    list: [
      { token: TokenType.STAR, class: BinaryExpression.bind(null, BinaryExpression.Operator.MULTIPLY) },
      { token: TokenType.SLASH, class: BinaryExpression.bind(null, BinaryExpression.Operator.DIVIDE) },
      { token: TokenType.PERCENT, class: BinaryExpression.bind(null, BinaryExpression.Operator.REMAINDER) },
    ],
  },
]
