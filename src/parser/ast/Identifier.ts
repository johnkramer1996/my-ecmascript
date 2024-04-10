import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import { ExecutionContextStack, ResolveBinding } from 'parser/lib/spec/9.4'
import { EnvironmentRecord } from 'parser/lib/spec/9.1'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import { ReferenceRecord, getNC } from 'parser/lib/spec/6.2'
import { Assert } from 'parser/lib/spec/5.2'

// 6.2.5.2 IsUnresolvableReference ( V )
function IsUnresolvableReference(V: ReferenceRecord) {
  // 1. If V.[[Base]] is UNRESOLVABLE, return true; otherwise return false.
  return V['[[Base]]'] === 'UNRESOLVABLE' ? true : false
}

// 6.2.5.8 InitializeReferencedBinding ( V, W )
export function InitializeReferencedBinding(V: ReferenceRecord, W: IECMAScriptLanguageType) {
  // 1. Assert: IsUnresolvableReference(V) is false.
  Assert(IsUnresolvableReference(V) === false)
  // 2. Let base be V.[[Base]].
  const base = V['[[Base]]']
  // 3. Assert: base is an Environment Record.
  Assert(base instanceof EnvironmentRecord)
  // 4. Return ? base.InitializeBinding(V.[[ReferencedName]], W).
  return (base as EnvironmentRecord).InitializeBinding(
    (V as ReferenceRecord<EnvironmentRecord>)['[[ReferencedName]]'],
    W,
  )
}

export class Identifier implements IExpression, IAccessible {
  constructor(public name: string) {}

  public eval(): IECMAScriptLanguageType {
    const lhs = ResolveBinding(this.name)['[[Value]]']
    const env = lhs['[[Base]]']
    if (env instanceof EnvironmentRecord) {
      return getNC(env.GetBindingValue(this.name, true))['[[Value]]']
    }
    return UndefinedType.UNDEFINED
  }

  public set(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    // TODO:
    const colleeContext = ExecutionContextStack.runningExecutionContext()
    colleeContext.LexicalEnvironment.SetMutableBinding(this.name, value, true)
    return value
  }

  public define(value: IECMAScriptLanguageType): void {
    console.log('first')
    // const lhs = ResolveBinding(this.name)['[[Value]]']
    // InitializeReferencedBinding(lhs, UndefinedType.UNDEFINED)
    const colleeContext = ExecutionContextStack.runningExecutionContext()
    colleeContext.LexicalEnvironment.InitializeBinding(this.name, value)
  }

  public hoisting(): void {
    const colleeContext = ExecutionContextStack.runningExecutionContext()
    colleeContext.LexicalEnvironment.CreateMutableBinding(this.name, true)
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.name
  }

  public toHtml(): string {
    return `<span class='variable'>${this.name}</span>`
  }
}
