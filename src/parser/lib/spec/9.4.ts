// 9.4 Execution Contexts
import { RealmRecord } from './9.3'
import { CompletionRecord, List, Record, ReferenceRecord } from './6.2'
import { EnvironmentRecord, FunctionEnvironmentRecord, GetIdentifierReference, PrivateEnvironmentRecord } from './9.1'
import { IFunctionObject } from './6.1'
import IStatement from 'parser/ast/IStatement'
import { EMPTY } from 'main'
import { Assert } from './5.2'
import { IsStrict } from './11.2'

const findLast = <T>(array: T[], func: (item: T) => boolean): T | undefined => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (func(array[i])) return array[i]
  }
  return undefined
}

export class ExecutionContextStack {
  static stack: ExecutionContext[] = []

  static isEmpty() {
    return this.stack.length === 0
  }

  static push(context: ExecutionContext): void {
    this.stack.push(context)
  }
  static pop(): ExecutionContext {
    return this.stack.pop() as ExecutionContext
  }

  static runningExecutionContext(): ExecutionContext {
    return this.stack[this.stack.length - 1]
  }

  static topmostECScriptOrModule(): ExecutionContext | null {
    return findLast(this.stack, (e) => !(e.ScriptOrModule === null)) ?? null
  }
}
// type FunctionObject = {
//   '[[Call]]': (thisArgument: any, list: List) => any
// }
// Table 25: State Components for All Execution Contexts
// Table 26: Additional State Components for ECMAScript Code Execution Contexts

export class ExecutionContext {
  codeEvaluationState: any
  Function: IFunctionObject | null = null
  Realm: RealmRecord = new RealmRecord()
  ScriptOrModule: null = null
  LexicalEnvironment: FunctionEnvironmentRecord = new FunctionEnvironmentRecord()
  VariableEnvironment: FunctionEnvironmentRecord = new FunctionEnvironmentRecord()
  PrivateEnvironment: PrivateEnvironmentRecord | null = new PrivateEnvironmentRecord()
}

// 9.4.1 GetActiveScriptOrModule ( )
export function GetActiveScriptOrModule() {
  // 1. If the execution context stack is empty, return null.
  if (ExecutionContextStack.isEmpty()) return null
  // 2. Let ec be the topmost execution context on the execution context stack whose ScriptOrModule component is not null.
  const ec = ExecutionContextStack.topmostECScriptOrModule()
  // 3. If no such execution context exists, return null. Otherwise, return ec's ScriptOrModule.
  return ec ? ec : null
}

// 9.4.2 ResolveBinding ( name [ , env ] )
export function ResolveBinding(name: string, env?: EnvironmentRecord): CompletionRecord<ReferenceRecord> {
  // 1. If env is not present or env is undefined, then
  if (env === undefined) {
    // a. Set env to the running execution context's LexicalEnvironment.
    env = ExecutionContextStack.runningExecutionContext().LexicalEnvironment
  }
  // 2. Assert: env is an Environment Record.
  Assert(env instanceof EnvironmentRecord, 'env instanceof EnvironmentRecord')
  // 3. Let strict be IsStrict(the syntactic production that is being evaluated).
  const strict = IsStrict()
  // 4. Return ? GetIdentifierReference(env, name, strict).
  return GetIdentifierReference(env, name, strict)
}

// 16.1.4 Script Records
export class ScriptRecord {
  '[[Realm]]': RealmRecord
  '[[ECMAScriptCode]]': IStatement
  '[[LoadedModules]]': List<Record>
  '[[HostDefined]]': any | typeof EMPTY = EMPTY
}
