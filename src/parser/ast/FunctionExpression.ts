import IVisitor from './IVisitor'
import { Params } from './Params'
import IStatement from './IStatement'
import IExpression from './IExpression'
import { Identifier } from './Identifier'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import IECMAScriptLanguageType from 'parser/lib/IValue'

export default class FunctionExpression implements IExpression {
  constructor(
    public id: Identifier | null = null,
    public name: Identifier | null = null,
    public params: Params,
    public body: IStatement,
  ) {}

  public eval(): IECMAScriptLanguageType {
    return UndefinedType.UNDEFINED
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.params.toString() + this.body
  }
}
