import IVisitor from './IVisitor'
import { Params } from './Params'
import IStatement from './IStatement'
import IExpression from './IExpression'
import { FunctionObjectType } from 'parser/lib/types/FunctionValue'
import { Identifier } from './Identifier'

export default class FunctionExpression implements IExpression {
  constructor(
    public id: Identifier | null = null,
    public name: Identifier | null = null,
    public params: Params,
    public body: IStatement,
  ) {}

  public eval(): FunctionObjectType {
    return new FunctionObjectType(this.body)
    // return new FunctionObjectType(new UserDefinedFunction(this.body, this.params, this.id, this.name?.toString() ?? ''))
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.params.toString() + this.body
  }
}
