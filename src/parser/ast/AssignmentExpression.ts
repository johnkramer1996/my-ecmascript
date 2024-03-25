import IExpression from './IExpression'
import { Identifier } from './Identifier'
import IVisitor from './IVisitor'
import IValue from 'parser/lib/IValue'
import BinaryExpression, { BinaryOperator } from './BinaryExpression'
import { IAccessible } from './IAccessible'
import Literal from './Literal'

export enum AssignmentOperator {
  ASSIGNMENT = '=',
  ADDITION_ASSIGNMENT = '+=',
  SUBSTRACTION_ASSIGNMENT = '-=',
  MULTIPLICATION_ASSIGNMENT = '*=',
  DIVISION_ASSIGNMENT = '/=',
  REMAINDER_ASSIGNMENT = '%=',
  EXPONENTIATION_ASSIGNMENT = '**=',
  LEFTSHIFT_ASSIGNMENT = '<<=',
  RIGHTSHIFT_ASSIGNMENT = '>>=',
  UnsignedrightshiftASSIGNMENT = '>>>=',
  BitwiseAND_ASSIGNMENT = '&=',
  BitwiseXOR_ASSIGNMENT = '^=',
  BitwiseOR_ASSIGNMENT = '|=',
  LogicalAND_ASSIGNMENT = '&&=',
  LogicalOR_ASSIGNMENT = '||=',
  Nullishcoalescing_ASSIGNMENT = '??=',
}

export default class AssignmentExpression implements IExpression {
  public static Operator = AssignmentOperator

  private static binaryOperator = new Map<AssignmentOperator, BinaryOperator>([
    [AssignmentOperator.ADDITION_ASSIGNMENT, BinaryExpression.Operator.ADD],
    [AssignmentOperator.SUBSTRACTION_ASSIGNMENT, BinaryExpression.Operator.SUBTRACT],
    [AssignmentOperator.MULTIPLICATION_ASSIGNMENT, BinaryExpression.Operator.MULTIPLY],
    [AssignmentOperator.DIVISION_ASSIGNMENT, BinaryExpression.Operator.DIVIDE],
  ])

  constructor(public operator: AssignmentOperator, public target: IAccessible, public expression: IExpression) {}

  public eval(): IValue {
    const result = this.expression.eval()
    const binary = AssignmentExpression.binaryOperator.get(this.operator)
    const value = binary
      ? new BinaryExpression(binary, new Literal(this.target.get()), new Literal(result)).eval()
      : result

    return this.target.set(value)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString() {
    return `${this.target} = ${this.expression}`
  }
}
