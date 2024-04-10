import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { Identifier } from './Identifier'
import { Params } from './Params'
import { OrdinaryFunctionCreate } from 'parser/lib/spec/10.3'
import { ObjectType } from 'parser/lib/types/ObjectValue'
import { ExecutionContextStack } from 'parser/lib/spec/9.4'
import IECMAScriptLanguageType from 'parser/lib/IValue'

export class FunctionDeclarationStatement implements IStatement {
  constructor(public bindingIdentifier: Identifier, public formalParameters: Params, public functionBody: IStatement) {}

  public execute(): void {
    return undefined
  }

  // 10.2.11 FunctionDeclarationInstantiation ( func, argumentsList )
  public hoisting() {
    // 1. Let calleeContext be the running execution context.
    const calleeContext = ExecutionContextStack.runningExecutionContext()
    // 2. Let code be func.[[ECMAScriptCode]].
    // 3. Let strict be func.[[Strict]].
    const strict = true
    // 4. Let formals be func.[[FormalParameters]].
    // 5. Let parameterNames be the BoundNames of formals.
    // 6. If parameterNames has any duplicate entries, let hasDuplicates be true. Otherwise, let hasDuplicates be false.
    // 7. Let simpleParameterList be IsSimpleParameterList of formals.
    // 8. Let hasParameterExpressions be ContainsExpression of formals.
    // 9. Let varNames be the VarDeclaredNames of code.
    // 10. Let varDeclarations be the VarScopedDeclarations of code.

    // 19. If strict is true or hasParameterExpressions is false, then
    if (strict) {
      // a. NOTE: Only a single Environment Record is needed for the parameters, since calls to eval in strict mode code cannot create new bindings which are visible outside of the eval.
      // b. Let env be the LexicalEnvironment of calleeContext.
      const env = calleeContext.LexicalEnvironment
    }

    // 10.2.3 OrdinaryFunctionCreate ( functionPrototype, sourceText, ParameterList, Body, thisMode, env, privateEnv )
    const env = calleeContext.LexicalEnvironment
    const privateEnv = calleeContext.PrivateEnvironment
    const fo = OrdinaryFunctionCreate(
      ObjectType.FunctionPrototype,
      this.bindingIdentifier.name,
      this.formalParameters,
      this.functionBody,
      'NON-LEXICAL-THIS',
      env,
      privateEnv,
    )
    // c. Perform ! varEnv.SetMutableBinding(fn, fo, false).
    calleeContext.LexicalEnvironment.SetMutableBinding(
      this.bindingIdentifier.name,
      fo as unknown as IECMAScriptLanguageType,
      false,
    )
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return `function ${this.bindingIdentifier} ${this.formalParameters} ${this.functionBody}`
  }
}
