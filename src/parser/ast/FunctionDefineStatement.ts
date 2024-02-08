import FunctionValue from 'parser/lib/types/FunctionValue'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { Identifier } from './Identifier'
import { Params } from './Params'
import Variables from 'parser/lib/Variables'

export default class FunctionDeclaration implements IStatement {
  constructor(public name: Identifier, public params: Params, private body: IStatement) {}

  public execute(): void {
    this.name.set(new FunctionValue(this.body, this.params))
  }

  public hoisting() {
    Variables.hoisting(this.name.getName(), 'func', new FunctionValue(this.body, this.params))
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `function ${this.name} ${this.body}`
  }
}
