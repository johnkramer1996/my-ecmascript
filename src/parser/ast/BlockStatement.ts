import { Scope } from 'parser/lib/Variables'
import { VaraibleDeclaration } from './VariableDeclarator'
import { FunctionDeclarationStatement } from './FunctionDeclarationStatement'
import IStatement from './IStatement'
import IVisitor from './IVisitor'

export class BlockStatement implements IStatement {
  public scope!: Scope

  constructor(public body: IStatement[]) {}

  public execute(): void {
    // TODO: add new scope
    for (const statement of this.body) {
      if (statement instanceof VaraibleDeclaration || statement instanceof FunctionDeclarationStatement) {
        statement.hoisting()
      }
    }
    for (const statement of this.body) statement.execute()
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    const result: string[] = ['{\n']
    for (const statement of this.body) {
      result.push('\t' + statement.toString())
      result.push('\n')
    }
    result.push('}')
    return result.join('')
  }
}
