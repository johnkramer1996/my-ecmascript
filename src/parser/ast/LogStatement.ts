import NumberValue from 'parser/lib/types/NumberValue'
import IExpression from './IExpression'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import BooleanValue from 'parser/lib/types/BooleanValue'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import NullValue from 'parser/lib/types/NullValue'

export default class LogStatement implements IStatement {
  constructor(public expression: IExpression) {}

  public execute(): void {
    const res = this.expression.eval()
    console.info(
      res instanceof NumberValue ||
        res instanceof BooleanValue ||
        res instanceof UndefinedValue ||
        res instanceof NullValue
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
