import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { LexicalDeclaration } from './VariableDeclarator'
import { FunctionDeclarationStatement } from './FunctionDeclarationStatement'
import { InitializeHostDefinedRealm } from 'parser/lib/spec/9.6'

export default class Program implements IStatement {
  constructor(public body: IStatement[]) {}

  public execute(): void {
    InitializeHostDefinedRealm()
    this.hosting()
    for (const statement of this.body) {
      try {
        statement.execute()
      } catch (e) {
        console.warn('[Program]', e)
      }
    }
  }

  private hosting() {
    for (const statement of this.body) {
      if (statement instanceof LexicalDeclaration || statement instanceof FunctionDeclarationStatement) {
        statement.hoisting()
      }
    }
  }

  public add(statement: IStatement) {
    this.body.push(statement)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    const result: string[] = []
    for (const statement of this.body) {
      result.push(statement.toString() + '\n')
    }
    return result.join('')
  }
}
