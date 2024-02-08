import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'
import OperationIsNotSupportedException from 'exceptions/OperationIsNotSupportedException'
import NumberValue from 'parser/lib/types/NumberValue'
import IVisitor from './IVisitor'
import TokenType from 'parser/TokenType'

export enum BinaryOperator {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  REMAINDER = '%',
  PUSH = '::',
  AND = '&',
  OR = '|',
  XOR = '^',
  LSHIFT = '<<',
  RSHIFT = '>>',
  URSHIFT = '>>>',
}

export default class BinaryExpression implements IExpression {
  // public start: number
  // public end: number
  public static Operator = BinaryOperator

  constructor(public operator: BinaryOperator, public left: IExpression, public right: IExpression) {
    // this.start = left.start
    // this.end = right.end
  }

  public eval(): IValue {
    const value1 = this.left.eval()
    const value2 = this.right.eval()

    // if (value1 instanceof StringValue || value2 instanceof StringValue) {
    //   const string1 = value1.asString()
    //   switch (this.operator) {
    //     case BinaryOperator.MULTIPLY: {
    //       return new StringValue(string1.repeat(value2.asNumber()))
    //     }
    //     case BinaryOperator.ADD:
    //     default:
    //       return new StringValue(string1 + value2.asString())
    //   }
    // }

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

    const number1 = value1.asNumber() || 0
    const number2 = value2.asNumber() || 0

    console.log('hear')

    const result = (() => {
      console.log(this.operator, number1, number2)
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

    return new NumberValue(result)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `${this.left} ${this.operator} ${this.right}`
  }
}

export const binary = [
  // {
  //   name: 'bitwiseOr',
  //   list: [{ token: TokenType.BAR, class: BinaryExpression.bind(null, BinaryExpression.Operator.OR) }],
  // },
  // {
  //   name: 'bitwiseXor',
  //   list: [{ token: TokenType.CARET, class: BinaryExpression.bind(null, BinaryExpression.Operator.XOR) }],
  // },
  // {
  //   name: 'bitwiseAnd',
  //   list: [{ token: TokenType.AMP, class: BinaryExpression.bind(null, BinaryExpression.Operator.AND) }],
  // },
  // {
  //   name: 'equality',
  //   list: [
  //     { token: TokenType.EQEQ, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.EQUALS) },
  //     {
  //       token: TokenType.EXCLEQ,
  //       class: ConditionalExpression.bind(null, ConditionalExpression.Operator.NOT_EQUALS),
  //     },
  //   ],
  // },
  // {
  //   name: 'conditional',
  //   list: [
  //     { token: TokenType.LT, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.LT) },
  //     { token: TokenType.LTEQ, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.LTEQ) },
  //     { token: TokenType.GT, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.GT) },
  //     { token: TokenType.GTEQ, class: ConditionalExpression.bind(null, ConditionalExpression.Operator.GTEQ) },
  //   ],
  // },
  // {
  //   name: 'shift',
  //   list: [
  //     { token: TokenType.LTLT, class: BinaryExpression.bind(null, BinaryExpression.Operator.LSHIFT) },
  //     { token: TokenType.GTGT, class: BinaryExpression.bind(null, BinaryExpression.Operator.RSHIFT) },
  //     { token: TokenType.GTGTGT, class: BinaryExpression.bind(null, BinaryExpression.Operator.URSHIFT) },
  //   ],
  // },
  {
    name: 'additive',
    list: [
      { token: TokenType.PLUS, class: BinaryExpression.bind(null, BinaryExpression.Operator.ADD) },
      { token: TokenType.MINUS, class: BinaryExpression.bind(null, BinaryExpression.Operator.SUBTRACT) },
      { token: TokenType.COLONCOLON, class: BinaryExpression.bind(null, BinaryExpression.Operator.PUSH) },
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
