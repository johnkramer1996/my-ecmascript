import { ObjectType } from '../types/ObjectValue'
import { FunctionObjectType } from '../types/FunctionValue'
import { IFunctionObject, IObject } from './6.1'
import { CompletionRecord, CompletionRecordWithError, List, ReferenceRecord } from './6.2'
import IECMAScriptLanguageType from '../IValue'
import StringType from '../types/StringValue'
import { Assert } from './5.2'
import { ExecutionContextStack } from './9.4'
import { EMPTY } from 'main'

const uninitialized = 'uninitialized'
const initialized = 'initialized'

export type BindingUninitialized = {
  value: undefined
  status: 'uninitialized'
}

export type BindingInitialized = {
  value: IECMAScriptLanguageType
  status: 'initialized'
}

type Binding = {
  mutable: boolean
  delete: boolean
  strict: boolean
  // value: IECMAScriptLanguageType | undefined
  // status: 'uninitialized' | 'initialized'
} & (BindingUninitialized | BindingInitialized)

// 9.1 Environment Records

export abstract class EnvironmentRecord {
  '[[OuterEnv]]': EnvironmentRecord | null
  public envRec: Map<String, Binding> = new Map()

  public abstract HasBinding(N: string): boolean

  public abstract InitializeBinding(N: string, V: IECMAScriptLanguageType): CompletionRecordWithError

  public abstract GetBindingValue(N: string | symbol, S: boolean): CompletionRecordWithError<IECMAScriptLanguageType>

  public abstract WithBaseObject(): undefined
}

export class DeclarativeEnvironmentRecord extends EnvironmentRecord {
  setEnvValueAndInit(binding: Binding, value: IECMAScriptLanguageType) {}

  // 9.1.1.1.1 HasBinding ( N )
  public HasBinding(N: string): boolean {
    // 1. If envRec has a binding for N, return true.
    if (this.envRec.has(N)) return true
    // 2. Return false.
    return false
  }

  // 9.1.1.1.2 CreateMutableBinding ( N, D )
  public CreateMutableBinding(N: string, D: boolean): CompletionRecordWithError<any> {
    // 1. Assert: envRec does not already have a binding for N.
    Assert(!this.HasBinding(N), `CreateMutableBinding ${N}`)
    // 2. Create a mutable binding in envRec for N and record that it is uninitialized. If D is true, record that the newly created binding may be deleted by a subsequent DeleteBinding call.
    this.envRec.set(N, { value: undefined, mutable: true, delete: D, strict: false, status: 'uninitialized' })
    // 3. Return UNUSED.
    return CompletionRecord.NormalCompletion('UNUSED')
  }

  // 9.1.1.1.3 CreateImmutableBinding ( N, S )
  public CreateImmutableBinding(N: string, S: boolean): CompletionRecord {
    // 1. Assert: envRec does not already have a binding for N.
    Assert(this.HasBinding(N), `CreateImmutableBinding ${N}`)
    // 2. Create an immutable binding in envRec for N and record that it is uninitialized. If S is true, record that the newly created binding is a strict binding.
    this.envRec.set(N, { value: undefined, mutable: false, delete: false, strict: S, status: 'uninitialized' })
    // 3. Return UNUSED.
    return CompletionRecord.NormalCompletion('UNUSED')
  }

  // 9.1.1.1.4 InitializeBinding ( N, V )
  public InitializeBinding(N: string, V: IECMAScriptLanguageType): CompletionRecordWithError<any> {
    const binding = this.envRec.get(N) as Binding
    // 1. Assert: envRec must have an uninitialized binding for N.
    Assert(binding?.status === uninitialized, `InitializeBinding ${N}`)
    // 2. Set the bound value for N in envRec to V.
    binding.status = 'initialized'
    binding.value = V
    // 3. Record that the binding for N in envRec has been initialized.
    Assert(binding.status === 'initialized', `InitializeBinding ${N}`)
    // 4. Return UNUSED.
    return CompletionRecord.NormalCompletion('UNUSED')
  }

  // 9.1.1.1.5 SetMutableBinding ( N, V, S )
  public SetMutableBinding(N: string, V: IECMAScriptLanguageType, S: boolean): CompletionRecordWithError<any> {
    const binding = this.envRec.get(N)
    // 1. If envRec does not have a binding for N, then
    if (binding === undefined) {
      // a. If S is true, throw a ReferenceError exception.
      if (S === true) return CompletionRecord.ThrowCompletion(new ReferenceError('SetMutableBinding'))
      // b. Perform ! envRec.CreateMutableBinding(N, true).
      this.CreateMutableBinding(N, true)
      // c. Perform ! envRec.InitializeBinding(N, V).
      this.InitializeBinding(N, V)
      // d. Return UNUSED.
      return CompletionRecord.NormalCompletion('UNUSED')
    }
    // 2. If the binding for N in envRec is a strict binding, set S to true.
    if (binding?.strict) S = true
    // 3. If the binding for N in envRec has not yet been initialized, then
    if (!(binding?.status === initialized))
      // a. Throw a ReferenceError exception.
      return CompletionRecord.ThrowCompletion(new ReferenceError('SetMutableBinding'))
    // 4. Else if the binding for N in envRec is a mutable binding, then
    else if (binding.mutable)
      // a. Change its bound value to V.
      binding.value = V
    // 5. Else,
    else {
      // a. Assert: This is an attempt to change the value of an immutable binding.
      // b. If S is true, throw a TypeError exception.
      if (S) return CompletionRecord.ThrowCompletion(new ReferenceError('SetMutableBinding'))
    }
    // 6. Return UNUSED
    return CompletionRecord.NormalCompletion('UNUSED')
  }

  // 9.1.1.1.6 GetBindingValue ( N, S )
  public GetBindingValue(N: string, S: boolean): CompletionRecordWithError {
    // 1. Assert: envRec has a binding for N.
    Assert(this.HasBinding(N), new ReferenceError(`${N} is not defined`))
    // 2. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.
    const binding = this.envRec.get(N) as Binding
    if (binding.status === uninitialized)
      return CompletionRecord.ThrowCompletion(new ReferenceError(`Cannot access '${N}' before init`))
    // 3. Return the value currently bound to N in envRec.
    return CompletionRecord.NormalCompletion(binding.value)
  }

  // 9.1.1.1.7 DeleteBinding ( N )

  public DeleteBinding(N: string): CompletionRecord {
    // 1. Assert: envRec has a binding for N.
    Assert(this.HasBinding(N), `DeleteBinding ${N}`)
    // 2. If the binding for N in envRec cannot be deleted, return false.
    if (this.envRec.get(N)?.delete === false) return CompletionRecord.NormalCompletion(false)
    // 3. Remove the binding for N from envRec.
    this.envRec.delete(N)
    // 4. Return true.
    return CompletionRecord.NormalCompletion(true)
  }

  // 9.1.1.1.8 HasThisBinding ( )
  public HasThisBinding() {
    return false
  }

  // 9.1.1.1.9 HasSuperBinding ( )
  public HasSuperBinding() {
    return false
  }

  // 9.1.1.1.10 WithBaseObject ( )
  public WithBaseObject(): undefined {
    return undefined
  }
}

export class FunctionEnvironmentRecord extends DeclarativeEnvironmentRecord {
  '[[ThisValue]]': IECMAScriptLanguageType
  '[[ThisBindingStatus]]': 'LEXICAL' | 'INITIALIZED' | typeof uninitialized = uninitialized
  '[[FunctionObject]]': IFunctionObject
  '[[NewTarget]]': IObject | undefined

  // 9.1.1.3.1 BindThisValue ( V )
  public BindThisValue(V: IECMAScriptLanguageType): CompletionRecord {
    // 1. Assert: envRec.[[ThisBindingStatus]] is not LEXICAL.
    Assert(!(this['[[ThisBindingStatus]]'] === 'LEXICAL'))
    // 2. If envRec.[[ThisBindingStatus]] is INITIALIZED, throw a ReferenceError exception.
    if (this['[[ThisBindingStatus]]'] === 'INITIALIZED')
      CompletionRecord.ThrowCompletion(new ReferenceError('ThisBindingStatus'))
    // 3. Set envRec.[[ThisValue]] to V.
    this['[[ThisValue]]'] = V
    // 4. Set envRec.[[ThisBindingStatus]] to INITIALIZED.
    this['[[ThisBindingStatus]]'] = 'INITIALIZED'
    // 5. Return V.
    return CompletionRecord.NormalCompletion(V)
  }

  // 9.1.1.3.2 HasThisBinding ( )
  public HasThisBinding() {
    // 1. If envRec.[[ThisBindingStatus]] is LEXICAL, return false; otherwise, return true.
    return !(this['[[ThisBindingStatus]]'] === 'LEXICAL')
  }

  // 9.1.1.3.3 HasSuperBinding ( )
  public HasSuperBinding() {
    // 1. If envRec.[[ThisBindingStatus]] is LEXICAL, return false.
    if (this['[[ThisBindingStatus]]'] === 'LEXICAL') return false
    // 2. If envRec.[[FunctionObject]].[[HomeObject]] is undefined, return false; otherwise, return true.
    return !(this['[[FunctionObject]]']['[[HomeObject]]'] === undefined)
  }

  // 9.1.1.3.4 GetThisBinding ( )
  public GetThisBinding() {
    // 1. Assert: envRec.[[ThisBindingStatus]] is not LEXICAL.
    if (this['[[ThisBindingStatus]]'] === 'LEXICAL') throw ReferenceError('GetThisBinding1') // 2. If envRec.[[ThisBindingStatus]] is INITIALIZED, throw a ReferenceError exception.
    // 2. If envRec.[[ThisBindingStatus]] is UNINITIALIZED, throw a ReferenceError exception.
    if (this['[[ThisBindingStatus]]'] === uninitialized) throw ReferenceError('GetThisBinding2')
    // 3. Return envRec.[[ThisValue]].
    return this['[[ThisValue]]']
  }

  // 9.1.1.3.5 GetSuperBase ( )
  public GetSuperBase() {
    // 1. Let home be envRec.[[FunctionObject]].[[HomeObject]].
    const home = this['[[FunctionObject]]']['[[HomeObject]]']
    // 2. If home is undefined, return undefined.
    if (home === undefined) return undefined
    // 3. Assert: home is an Object.
    if (!(home instanceof ObjectType)) throw ReferenceError('GetSuperBase')
    // 4. Return ? home.[[GetPrototypeOf]]().
    return home['[[GetPrototypeOf]]']()
  }
}

export class ObjectEnvironmentRecord extends EnvironmentRecord {
  public InitializeBinding(N: string, V: IECMAScriptLanguageType): CompletionRecordWithError {
    throw new Error('Method not implemented.')
  }
  '[[BindingObject]]': IObject
  '[[IsWithEnvironment]]': boolean

  public WithBaseObject(): undefined {
    throw new Error('Method not implemented.')
  }
  public GetBindingValue(N: string, S: boolean): CompletionRecordWithError<IECMAScriptLanguageType> {
    throw new Error('Method not implemented.')
  }
  public HasBinding(N: string): boolean {
    throw new Error('Method not implemented.')
  }
} // WithStatement

export class GlobalEnvironmentRecord extends EnvironmentRecord {
  public InitializeBinding(N: string, V: IECMAScriptLanguageType): CompletionRecordWithError {
    throw new Error('Method not implemented.')
  }
  '[[ObjectRecord]]': ObjectEnvironmentRecord
  '[[GlobalThisValue]]': IObject
  '[[DeclarativeRecord]]': DeclarativeEnvironmentRecord
  '[[VarNames]]': List<string>

  public WithBaseObject(): undefined {
    throw new Error('Method not implemented.')
  }
  public GetBindingValue(N: string, S: boolean): CompletionRecordWithError<IECMAScriptLanguageType> {
    throw new Error('Method not implemented.')
  }

  public HasBinding(N: string): boolean {
    throw new Error('Method not implemented.')
  }
}

export class PrivateEnvironmentRecord {
  '[[OuterPrivateEnvironment]]': PrivateEnvironmentRecord | null
  '[[Names]]': any[]
}

// 9.1.2.1 GetIdentifierReference ( env, name, strict )
export function GetIdentifierReference(
  env: EnvironmentRecord | null,
  name: string,
  strict: boolean,
): CompletionRecord<ReferenceRecord, 'NORMAL'> {
  // 1. If env is null, then
  if (env === null) {
    // a. Return the Reference Record { [[Base]]: UNRESOLVABLE, [[ReferencedName]]: name, [[Strict]]: strict, [[ThisValue]]: EMPTY }.
    return CompletionRecord.NormalCompletion(
      new ReferenceRecord({
        '[[Base]]': 'UNRESOLVABLE',
        '[[ReferencedName]]': name,
        '[[Strict]]': strict,
        '[[ThisValue]]': EMPTY,
      }),
    )
  }
  // 2. Let exists be ? env.HasBinding(name).
  const exists = env.HasBinding(name)
  // 3. If exists is true, then
  if (exists) {
    // a. Return the Reference Record { [[Base]]: env, [[ReferencedName]]: name, [[Strict]]: strict, [[ThisValue]]: EMPTY }.
    return CompletionRecord.NormalCompletion(
      new ReferenceRecord({
        '[[Base]]': env,
        '[[ReferencedName]]': name,
        '[[Strict]]': strict,
        '[[ThisValue]]': EMPTY,
      }),
    )
  }
  // 4. Else,
  else {
    // a. Let outer be env.[[OuterEnv]].
    const outer = env['[[OuterEnv]]']
    // b. Return ? GetIdentifierReference(outer, name, strict).
    return GetIdentifierReference(outer, name, strict)
  }
}

// 9.1.2.2 NewDeclarativeEnvironment ( E )
function NewDeclarativeEnvironment(E: EnvironmentRecord | null): DeclarativeEnvironmentRecord {
  // 1. Let env be a new Declarative Environment Record containing no bindings.
  const env = new DeclarativeEnvironmentRecord()
  // 2. Set env.[[OuterEnv]] to E.
  env['[[OuterEnv]]'] = E
  // 3. Return env.
  return env
}

// 9.1.2.3 NewObjectEnvironment ( O, W, E )
function NewObjectEnvironment(O: IObject, W: boolean, E: EnvironmentRecord | null): ObjectEnvironmentRecord {
  // 1. Let env be a new Object Environment Record.
  const env = new ObjectEnvironmentRecord()
  // 2. Set env.[[BindingObject]] to O.
  env['[[BindingObject]]'] = O
  // 3. Set env.[[IsWithEnvironment]] to W.
  env['[[IsWithEnvironment]]'] = W
  // 4. Set env.[[OuterEnv]] to E.
  env['[[OuterEnv]]'] = E
  // 5. Return env.
  return env
}

// 9.1.2.4 NewFunctionEnvironment ( F, newTarget )
export function NewFunctionEnvironment(F: IFunctionObject, newTarget?: IObject): FunctionEnvironmentRecord {
  // 1. Let env be a new Function Environment Record containing no bindings.
  const env = new FunctionEnvironmentRecord()
  // 2. Set env.[[FunctionObject]] to F.
  env['[[FunctionObject]]'] = F
  // 3. If F.[[ThisMode]] is LEXICAL, set env.[[ThisBindingStatus]] to LEXICAL.
  if (F['[[ThisMode]]'] === 'LEXICAL') env['[[ThisBindingStatus]]'] = 'LEXICAL'
  // 4. Else, set env.[[ThisBindingStatus]] to UNINITIALIZED.
  else env['[[ThisBindingStatus]]'] = uninitialized
  // 5. Set env.[[NewTarget]] to newTarget.
  env['[[NewTarget]]'] = newTarget
  // 6. Set env.[[OuterEnv]] to F.[[Environment]].
  env['[[OuterEnv]]'] = F['[[Environment]]']
  // 7. Return env.
  return env
}

// 9.1.2.5 NewGlobalEnvironment ( G, thisValue )
export function NewGlobalEnvironment(G: IObject, thisValue: IObject): GlobalEnvironmentRecord {
  // 1. Let objRec be NewObjectEnvironment(G, false, null).
  const objRec = NewObjectEnvironment(G, false, null)
  // 2. Let dclRec be NewDeclarativeEnvironment(null).
  const dclRec = NewDeclarativeEnvironment(null)
  // 3. Let env be a new Global Environment Record.
  const env = new GlobalEnvironmentRecord()
  // 4. Set env.[[ObjectRecord]] to objRec.
  env['[[ObjectRecord]]'] = objRec
  // 5. Set env.[[GlobalThisValue]] to thisValue.
  env['[[GlobalThisValue]]'] = thisValue
  // 6. Set env.[[DeclarativeRecord]] to dclRec.
  env['[[DeclarativeRecord]]'] = dclRec
  // 7. Set env.[[VarNames]] to a new empty List.
  env['[[VarNames]]'] = new List()
  // 8. Set env.[[OuterEnv]] to null.
  env['[[OuterEnv]]'] = null
  // 9. Return env.
  return env
}

// 9.1.2.6 NewModuleEnvironment ( E )
