import IExpression from './IExpression'
import IStatement from './IStatement'
import IVisitor from './IVisitor'

export default class LogStatement implements IStatement {
  public start: number
  public end: number
  constructor(public expression: IExpression) {
    TODO: this.start = 0
    this.end = 0
    // this.start = Location.endStatement().getStart()
    // this.end = Location.getPrevToken().getEnd()
  }

  public execute(): void {
    console.log(this.expression.eval().asString())
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return 'log ' + this.expression
  }
}
