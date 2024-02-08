import CallStack from 'parser/lib/CallStack'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { VaraibleDeclaration } from './AssignmentExpression'
import FunctionDeclaration from './FunctionDefineStatement'
import Variables from 'parser/lib/Variables'
import StringValue from 'parser/lib/types/StringValue'

export default class Program implements IStatement {
  public start: number
  public end: number
  constructor(public body: IStatement[]) {
    this.start = 0
    // TODO:
    // this.end = Location.getPrevToken().getEnd()
    this.end = 0
  }

  // Phase execute
  public execute(): void {
    this.creation()
    for (const statement of this.body) {
      try {
        statement.execute()
      } catch (e) {
        console.log(e)
        if (e instanceof Error) {
          console.error(`${e.name}: ${e.message}`, 0, 0)
        }
      }
    }
  }

  // Phase creation
  public creation() {
    // TODO:
    CallStack.enter('GLOBAL')
    this.globalExecuteContext()
    this.hosting()
    this.bindThis()
  }

  private globalExecuteContext() {}

  private hosting() {
    // TODO:
    for (const statement of this.body) {
      if (statement instanceof VaraibleDeclaration || statement instanceof FunctionDeclaration) {
        statement.hoisting()
      }
    }
  }

  private bindThis() {
    Variables.scope.variables.set('this', { value: new StringValue('window'), kind: 'const' })
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
