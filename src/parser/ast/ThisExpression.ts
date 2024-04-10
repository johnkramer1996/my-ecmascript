import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { ExecutionContextStack } from 'parser/lib/spec/9.4'

export class ThisExpression implements IExpression {
  public eval(): IECMAScriptLanguageType {
    return ExecutionContextStack.runningExecutionContext().LexicalEnvironment.GetThisBinding()
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return 'this'
  }
}
