import IVisitor from './IVisitor'
import { Params } from './Params'
import IStatement from './IStatement'
import IExpression from './IExpression'
import { UserDefinedFunction, FunctionValue } from 'parser/lib/types/FunctionValue'
import { Identifier } from './Identifier'

export default class FunctionExpression implements IExpression {
  constructor(
    public id: Identifier | null = null,
    public name: string,
    public params: Params,
    public body: IStatement,
  ) {}

  public eval(): FunctionValue {
    return new FunctionValue(new UserDefinedFunction(this.body, this.params, this.id, this.name))
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.params.toString() + this.body
  }
}