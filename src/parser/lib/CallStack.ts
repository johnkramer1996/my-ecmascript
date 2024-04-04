import { EMPTY } from 'main'
import IECMAScriptLanguageType from './IValue'
import { FunctionObjectType } from './types/FunctionValue'
import { ObjectType } from './types/ObjectValue'
import StringType from './types/StringValue'
import UndefinedType from './types/UndefinedValue'
import { This } from './Variables'
import ECMAScriptLanguageTypes from './types/Types'

export class CallInfo {
  // constructor(public name: string, public func: Function) {}
  constructor(public name: string) {}

  public toString(): string {
    return `${this.name}`
  }
}

export class CallStack {
  private static calls: CallInfo[] = []
  private static return: IECMAScriptLanguageType = UndefinedType.UNDEFINED

  public static enter(name: string): void {
    this.calls.push(new CallInfo(name))
  }

  public static exit(): void {
    this.calls.pop()
  }

  public static getCalls() {
    return this.calls.reverse()
  }

  public static setReturn(value: IECMAScriptLanguageType) {
    this.return = value
  }

  public static getReturn(): IECMAScriptLanguageType {
    const result = this.return
    this.return = UndefinedType.UNDEFINED
    return result
  }
}
export class Realm {
  '[[GlobalEnv]]': GlobalEnvironmentRecord
}

export class ExecutionContextStack {
  static stack: ExecutionContext[] = []

  static push(context: ExecutionContext): void {
    this.stack.push(context)
  }
  static pop(): ExecutionContext {
    return this.stack.pop() as ExecutionContext
  }

  static runningExecutionContext(): ExecutionContext {
    return this.stack[this.stack.length - 1]
  }
}

export class ExecutionContext {
  codeEvaluationState: any
  Function: FunctionObjectType | null = null
  Realm: Realm = new Realm()
  ScriptOrModule: null = null
  LexicalEnvironment = new FunctionEnvironmentRecord()
  VariableEnvironment = new FunctionEnvironmentRecord()
  PrivateEnvironment = new PrivateEnvironmentRecord()
}

export class CompletionRecord {
  '[[Type]]': 'NORMAL' | 'BREAK' | 'CONTINUE' | 'RETURN' | 'THROW'
  '[[Value]]': any
  '[[Target]]': string | typeof EMPTY

  constructor(args: CompletionRecord) {
    this['[[Type]]'] = args['[[Type]]']
    this['[[Value]]'] = args['[[Value]]']
    this['[[Target]]'] = args['[[Target]]']
  }

  static NormalCompletion(value: any) {
    return new CompletionRecord({ '[[Type]]': 'NORMAL', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static BreakCompletion(value: any) {
    return new CompletionRecord({ '[[Type]]': 'BREAK', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static ContinueCompletion(value: any) {
    return new CompletionRecord({ '[[Type]]': 'CONTINUE', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static ReturnCompletion(value: any) {
    return new CompletionRecord({ '[[Type]]': 'RETURN', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static ThrowCompletion(value: any) {
    return new CompletionRecord({ '[[Type]]': 'THROW', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static AbruptCompletion(value: any) {
    return new CompletionRecord({ '[[Type]]': 'NORMAL', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static UpdateEmpty(completionRecord: CompletionRecord, value: any): CompletionRecord {
    if (!(completionRecord['[[Type]]'] === 'NORMAL' || completionRecord['[[Type]]'] === 'THROW'))
      throw new Error('UpdateEmpty')
    const val = completionRecord['[[Value]]']

    // if (!(val !== EMPTY)) return completionRecord
    return new CompletionRecord({
      '[[Type]]': completionRecord['[[Type]]'],
      '[[Value]]': value,
      '[[Target]]': completionRecord['[[Target]]'],
    })
  }
}

export abstract class EnvironmentRecord {
  '[[OuterEnv]]': EnvironmentRecord | null
  public envRec: Map<String, IECMAScriptLanguageType> = new Map()
}

export class DeclarativeEnvironmentRecord extends EnvironmentRecord {
  public HasBinding(N: string) {
    return this.envRec.has(N)
  }

  public CreateMutableBinding(N: string, D: boolean) {
    if (this.HasBinding(N)) throw new ReferenceError('CreateMutableBinding + ' + N)

    this.envRec.set(N, new StringType('uninitialized'))
    return 'UNUSED'
  }

  public CreateImmutableBinding(N: string, S: boolean) {
    if (this.HasBinding(N)) throw new Error('CreateImmutableBinding + ' + N)

    this.envRec.set(N, new StringType('uninitialized'))
    return 'UNUSED'
  }

  public InitializeBinding(N: string, V: IECMAScriptLanguageType) {
    if (!this.envRec.get(N)?.compareTo(new StringType('uninitialized')))
      throw new ReferenceError('InitializeBinding + ' + N)
    this.envRec.set(N, V)
    return 'UNUSED'
  }

  public SetMutableBinding(N: string, V: IECMAScriptLanguageType, S: boolean) {
    const binding = this.envRec.get(N)
    if (!binding) {
      if (S) throw new ReferenceError('SetMutableBinding + ')
      this.CreateMutableBinding(N, true)
      this.InitializeBinding(N, V)
    }
    // @ts-ignore
    if (binding === 'strict') S = true

    const binding2 = this.envRec.get(N)
    if (!binding2?.compareTo(new StringType('uninitialized'))) throw new ReferenceError('SetMutableBinding + ')
    // @ts-ignore
    else if (binding === 'mutable ') this.envRec.set(N, V)
    else {
      if (S) throw new ReferenceError('SetMutableBinding + ')
    }
    return 'UNUSED'
  }

  public GetBindingValue(N: string, B: boolean) {
    const binding = this.envRec.get(N)
    if (!binding) throw new ReferenceError('GetBindingValue1 ')
    if (!binding?.compareTo(new StringType('uninitialized'))) throw new ReferenceError('GetBindingValue2 ')
    return binding
  }

  public DeleteBinding(N: string) {
    const binding = this.envRec.get(N)
    if (!binding) throw new ReferenceError('DeleteBinding 1 ')
    // 2. If the binding for N in envRec cannot be deleted, return false.
    // 3. Remove the binding for N from envRec.
    return true // 4. Return true.
  }

  public HasThisBinding() {
    return false
  }

  public HasSuperBinding() {
    return false
  }

  public WithBaseObject() {
    return undefined
  }
}
export class FunctionEnvironmentRecord extends DeclarativeEnvironmentRecord {
  '[[ThisValue]]': IECMAScriptLanguageType
  '[[ThisBindingStatus]]': 'LEXICAL' | 'INITIALIZED' | 'UNINITIALIZED' = 'UNINITIALIZED'
  '[[FunctionObject]]': FunctionObjectType
  '[[NewTarget]]': ObjectType | null

  BindThisValue(V: IECMAScriptLanguageType) {
    // 1. Assert: envRec.[[ThisBindingStatus]] is not LEXICAL.
    if (this['[[ThisBindingStatus]]'] === 'INITIALIZED') throw ReferenceError('ThisBindingStatus') // 2. If envRec.[[ThisBindingStatus]] is INITIALIZED, throw a ReferenceError exception.
    // 3. Set envRec.[[ThisValue]] to V.
    this['[[ThisValue]]'] = V
    // 4. Set envRec.[[ThisBindingStatus]] to INITIALIZED.
    this['[[ThisBindingStatus]]'] = 'INITIALIZED'
    return V // 5. Return V.
  }

  HasThisBinding() {
    return !(this['[[ThisBindingStatus]]'] === 'LEXICAL') // 1. If envRec.[[ThisBindingStatus]] is LEXICAL, return false; otherwise, return true.
  }

  HasSuperBinding() {
    if (this['[[ThisBindingStatus]]'] === 'LEXICAL') return false // 1. If envRec.[[ThisBindingStatus]] is LEXICAL, return false.
    return !(this['[[FunctionObject]]']['[[HomeObject]]'] === undefined) // 2. If envRec.[[FunctionObject]].[[HomeObject]] is undefined, return false; otherwise, return true.
  }

  GetThisBinding() {
    if (this['[[ThisBindingStatus]]'] === 'LEXICAL') throw ReferenceError('GetThisBinding1') // 2. If envRec.[[ThisBindingStatus]] is INITIALIZED, throw a ReferenceError exception.
    if ((this['[[ThisBindingStatus]]'] = 'UNINITIALIZED')) throw ReferenceError('GetThisBinding2')
    return this['[[ThisValue]]']
  }

  GetSuperBase() {
    const home = this['[[FunctionObject]]']['[[HomeObject]]']
    if (home === undefined) return undefined
    if (!(home instanceof ObjectType)) throw ReferenceError('GetSuperBase')
    // @ts-ignore
    return home.get('[[GetPrototypeOf]]')?.call()
  }
}

export class ObjectEnvironmentRecord extends EnvironmentRecord {} // WithStatement

export class GlobalEnvironmentRecord extends EnvironmentRecord {
  '[[GlobalThisValue]]': ObjectType
}

export class PrivateEnvironmentRecord {
  '[[OuterPrivateEnvironment]]': PrivateEnvironmentRecord | null
  '[[Names]]': any[]
}

// var Scope = function Scope(flags) {
//   this.flags = flags;
//   this.var = [];
//   this.lexical = [];
//   this.functions = [];
//   this.inClassFieldInit = false;
//   pp$3.enterScope = function(flags) {
//     this.scopeStack.push(new Scope(flags));
//   };

//   pp$3.exitScope = function() {
//     this.scopeStack.pop();
//   };

// };
