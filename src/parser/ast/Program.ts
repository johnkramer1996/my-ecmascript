import ECStack from 'parser/lib/CallStack'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { VaraibleDeclaration } from './VariableDeclarator'
import { FunctionDeclarationStatement } from './FunctionDeclarationStatement'
import { Variables } from 'parser/lib/Variables'

export default class Program implements IStatement {
  constructor(public body: IStatement[]) {}

  public execute(): void {
    this.creation()
    for (const statement of this.body) {
      try {
        statement.execute()
      } catch (e) {
        console.warn('[Program]', e)
      }
    }
  }

  public creation() {
    ECStack.enter('GLOBAL')
    this.globalExecuteContext()
    this.hosting()
  }

  private globalExecuteContext() {
    Variables.init()
  }

  private hosting() {
    for (const statement of this.body) {
      if (statement instanceof VaraibleDeclaration || statement instanceof FunctionDeclarationStatement) {
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
