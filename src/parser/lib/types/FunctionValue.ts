import IStatement from 'parser/ast/IStatement'
import TypeException from 'exceptions/TypeException'
import { ObjectType } from './ObjectValue'
import IECMAScriptLanguageType from '../IValue'
import { Scope, This, Variables } from '../Variables'
import UndefinedType from './UndefinedValue'
import {
  CallStack,
  CompletionRecord,
  EnvironmentRecord,
  ExecutionContextStack,
  PrivateEnvironmentRecord,
  Realm,
} from '../CallStack'
import { Params } from 'parser/ast/Params'
import { Identifier } from 'parser/ast/Identifier'
import { Assert } from '../spec/spec'
import Function from '../Function'
import ArrayValue from './ArrayValue'
import { EMPTY } from 'main'
import {
  ClassFieldDefinitionRecord,
  PrivateElements,
  PrivateName,
  PrepareForOrdinaryCall,
  OrdinaryCallBindThis,
  Completion,
  OrdinaryCallEvaluateBody,
} from '../spec/spec'

// export class UserDefinedFunction implements Function {
//   constructor(
//     public body: IStatement,
//     public params = new Params(),
//     public id: Identifier | null,
//     public name: string,
//   ) {}

//   public call(...values: IECMAScriptLanguageType[]): IECMAScriptLanguageType {
//     this.hoisting()
//     this.setArguments(values)
//     this.body.execute()
//     return CallStack.getReturn()
//   }

//   private hoisting(): void {
//     for (const param of this.getParams()) param.hoisting('var')
//     this.id && this.id.hoisting('var')
//   }

//   private setArguments(values: IECMAScriptLanguageType[]) {
//     this.getParams().forEach((arg, i) => arg.define(values[i] ?? UndefinedType.UNDEFINED))
//     this.id?.define(new FunctionObjectType(this))
//   }

//   private getParams() {
//     return this.params.values
//   }

//   public toString(): string {
//     return `[function ${this.name}]`
//   }
// }

export class FunctionObjectType extends ObjectType implements IECMAScriptLanguageType {
  protected scope: Scope
  F: FunctionObjectType
  '[[Environment]]': EnvironmentRecord
  '[[PrivateEnvironment]]': PrivateEnvironmentRecord
  '[[FormalParameters]]': Params
  '[[ECMAScriptCode]]': IStatement
  '[[ConstructorKind]]': 'BASE' | 'DERIVED'
  '[[Realm]]' = new Realm()
  '[[ScriptOrModule]]': any
  '[[ThisMode]]': 'LEXICAL' | 'STRICT' | 'GLOBAL' = 'STRICT'
  '[[Strict]]': boolean
  '[[HomeObject]]': ObjectType
  '[[SourceText]]': string
  '[[Fields]]': ClassFieldDefinitionRecord[]
  '[[PrivateMethods]]': PrivateElements[]
  '[[ClassFieldInitializerName]]': string | symbol | PrivateName | typeof EMPTY
  '[[IsClassConstructor]]': boolean

  constructor(
    body?: IStatement,
    prototype = new ObjectType(),
    __proto__: IECMAScriptLanguageType | null = ObjectType.FunctionPrototype,
  ) {
    super(__proto__)
    prototype['[[Set]]']('constructor', this)
    this['[[Set]]']('prototype', prototype)
    this.scope = Variables.scope
    this.F = this
    this['[[ECMAScriptCode]]'] = body ?? {
      execute() {
        return UndefinedType.UNDEFINED
      },
      accept(visitor) {},
    }
  }

  public getScope(): Scope {
    return this.scope
  }

  // 10.2.1 [[Call]] ( thisArgument, argumentsList )
  public '[[Call]]'(thisArgument: IECMAScriptLanguageType, argumentsList: IECMAScriptLanguageType[]): CompletionRecord {
    // 1. Let callerContext be the running execution context.
    const collerContext = ExecutionContextStack.runningExecutionContext()
    // 2. Let calleeContext be PrepareForOrdinaryCall(F, undefined).
    const calleeContext = PrepareForOrdinaryCall(this.F, undefined)
    // 3. Assert: calleeContext is now the running execution context.
    Assert(ExecutionContextStack.runningExecutionContext() === calleeContext)
    // 4. If F.[[IsClassConstructor]] is true, then
    if (this.F['[[IsClassConstructor]]'] === true) {
      // a. Let error be a newly created TypeError object.
      const error = new TypeError()
      // b. NOTE: error is created in calleeContext with F's associated Realm Record.
      // c. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
      ExecutionContextStack.pop()
      // d. Return ThrowCompletion(error).
      return CompletionRecord.ThrowCompletion(error)
    }
    // 5. Perform OrdinaryCallBindThis(F, calleeContext, thisArgument).
    OrdinaryCallBindThis(this.F, calleeContext, thisArgument)
    // 6. Let result be Completion(OrdinaryCallEvaluateBody(F, argumentsList)).
    const result = Completion(OrdinaryCallEvaluateBody(this.F, argumentsList))
    // 7. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
    ExecutionContextStack.pop()
    // 8. If result is a return completion, return result.[[Value]].
    // if (result instanceof CompletionRecord)
    return CompletionRecord.NormalCompletion(result['[[Value]]'])
    // 9. ReturnIfAbrupt(result).
    // ReturnIfAbrupt(result)
    // // 10. Return undefined.
    // return UndefinedType.UNDEFINED
  }

  // public getName(): string {
  //   return this.func.name ?? ''
  // }

  public asNumber(): number {
    throw new TypeException('Cannot cast function to number')
  }

  public asString(): string {
    return `[function name]`
  }
}

export class ConstructorValue extends FunctionObjectType implements IECMAScriptLanguageType {
  public '[[construct]]'(this_: ObjectType, values: IECMAScriptLanguageType[]): CompletionRecord {
    return this['[[Call]]'](this, values)
    // Variables.bindThis(this_)
    // const result = this.func.call(...values)
    // const isObject = result instanceof ObjectType || result instanceof ArrayValue
    // return isObject ? result : this_
  }
}
