import IExpression from './IExpression'
import IStatement from './IStatement'
import IVisitor from './IVisitor'

export default class ExpressionStatement implements IStatement {
  constructor(public expr: IExpression) {}

  public execute(): void {
    this.expr.eval()
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.expr.toString()
  }
}
