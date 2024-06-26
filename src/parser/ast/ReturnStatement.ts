import IStatement from './IStatement'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { CallStack } from 'parser/lib/CallStack'

export default class ReturnStatement implements IStatement {
  constructor(public expression: IExpression) {}

  public execute(): void {
    CallStack.setReturn(this.expression.eval())
  }

  // public getResult(): IValue {
  //   return this.result || BooleanValue.FALSE
  // }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return 'return ' + this.expression
  }
}
