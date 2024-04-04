import { FunctionObjectType, ConstructorValue } from 'parser/lib/types/FunctionValue'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { Identifier } from './Identifier'
import { Params } from './Params'

export class FunctionDeclarationStatement implements IStatement {
  constructor(public name: Identifier, public params: Params, public body: IStatement) {}

  public execute(): void {
    return undefined
  }

  public hoisting() {
    this.name.hoisting('func', new ConstructorValue(this.body))
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `function ${this.name} ${this.params} ${this.body}`
  }
}
