import NumberType from 'parser/lib/types/NumberValue'
import IExpression from './IExpression'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { BooleanType } from 'parser/lib/types/BooleanValue'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import NullType from 'parser/lib/types/NullValue'

export default class LogStatement implements IStatement {
  constructor(public expression: IExpression) {}

  public execute(): void {
    const res = this.expression.eval()

    console.info(
      res instanceof NumberType || res instanceof BooleanType || res instanceof UndefinedType || res instanceof NullType
        ? res.raw()
        : res.asString(),
    )
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return 'log ' + this.expression
  }
}
