import IECMAScriptLanguageType from '../IValue'
import { RealmRecord } from './9.3'
import { CompletionRecord } from './6.2'
import { List } from './6.2'
import { ExecutionContext, ExecutionContextStack, GetActiveScriptOrModule } from './9.4'
import NullType from '../types/NullValue'
import { BuiltInFunctionObject, ObjectType } from '../types/ObjectValue'
import { ConstructorValue, FunctionObjectType } from '../types/FunctionValue'
import { IFunctionObject } from './6.1'
import { Call_10_2_1, SetFunctionLength, SetFunctionName } from './10.2'
import { OrdinaryObjectCreate } from './10.1'
import { PrivateName } from './spec'
import { Params } from 'parser/ast/Params'
import IStatement from 'parser/ast/IStatement'
import { EnvironmentRecord, PrivateEnvironmentRecord } from './9.1'
import { IsStrict } from './11.2'
import { EMPTY } from 'main'
import IExpression from 'parser/ast/IExpression'

type ThisMode = 'LEXICAL-THIS' | 'NON-LEXICAL-THIS'

// 10.2.3 OrdinaryFunctionCreate ( functionPrototype, sourceText, ParameterList, Body, thisMode, env, privateEnv )
export function OrdinaryFunctionCreate(
  functionPrototype: ObjectType,
  sourceText: string,
  ParameterList: Params,
  Body: IStatement | IExpression,
  thisMode: ThisMode,
  env: EnvironmentRecord,
  privateEnv: PrivateEnvironmentRecord | null,
): IFunctionObject {
  // 1. Let internalSlotsList be the internal slots listed in Table 30.
  const internalSlotsList = ['[[Environment]]']
  // 2. Let F be OrdinaryObjectCreate(functionPrototype, internalSlotsList).
  const F = OrdinaryObjectCreate(functionPrototype, internalSlotsList) as unknown as IFunctionObject
  // 3. Set F.[[Call]] to the definition specified in 10.2.1.
  F['[[Call]]'] = Call_10_2_1
  // 4. Set F.[[SourceText]] to sourceText.
  F['[[SourceText]]'] = sourceText
  // 5. Set F.[[FormalParameters]] to ParameterList.
  F['[[FormalParameters]]'] = ParameterList
  // 6. Set F.[[ECMAScriptCode]] to Body.
  F['[[ECMAScriptCode]]'] = Body
  // 7. Let Strict be IsStrict(Body).
  const Strict = IsStrict(Body)
  // 8. Set F.[[Strict]] to Strict.
  F['[[Strict]]'] = Strict
  // 9. If thisMode is LEXICAL-THIS, set F.[[ThisMode]] to LEXICAL.
  if (thisMode === 'LEXICAL-THIS') F['[[ThisMode]]'] = 'LEXICAL'
  // 10. Else if Strict is true, set F.[[ThisMode]] to STRICT.
  else if (Strict === true) F['[[ThisMode]]'] = 'STRICT'
  // 11. Else, set F.[[ThisMode]] to GLOBAL.
  else F['[[ThisMode]]'] = 'GLOBAL'
  // 12. Set F.[[IsClassConstructor]] to false.
  F['[[IsClassConstructor]]'] = false
  // 13. Set F.[[Environment]] to env.
  F['[[Environment]]'] = env
  // 14. Set F.[[PrivateEnvironment]] to privateEnv.
  F['[[PrivateEnvironment]]'] = privateEnv
  // 15. Set F.[[ScriptOrModule]] to GetActiveScriptOrModule().
  F['[[ScriptOrModule]]'] = GetActiveScriptOrModule()
  // 16. Set F.[[Realm]] to the current Realm Record.
  F['[[Realm]]'] = ExecutionContextStack.runningExecutionContext().Realm
  // 17. Set F.[[HomeObject]] to undefined.
  F['[[HomeObject]]'] = undefined
  // 18. Set F.[[Fields]] to a new empty List.
  F['[[Fields]]'] = new List()
  // 19. Set F.[[PrivateMethods]] to a new empty List.
  F['[[PrivateMethods]]'] = new List()
  // 20. Set F.[[ClassFieldInitializerName]] to EMPTY.
  F['[[ClassFieldInitializerName]]'] = EMPTY
  // 21. Let len be the ExpectedArgumentCount of ParameterList.
  const len = ExpectedArgumentCount(ParameterList)
  // 22. Perform SetFunctionLength(F, len).
  // @ts-ignore
  SetFunctionLength(F, len)
  // 23. Return F.
  return F
}

// 15.1.5 Static Semantics: ExpectedArgumentCount
function ExpectedArgumentCount(ParameterList: Params) {
  return ParameterList.values.length
}

// 10.3.3 BuiltinCallOrConstruct ( F, thisArgument, argumentsList, newTarget )
export function BuiltinCallOrConstruct(
  F: BuiltInFunctionObject,
  thisArgument: IECMAScriptLanguageType | 'UNINITIALIZED',
  argumentsList: List,
  newTarget: ConstructorValue | undefined,
): CompletionRecord {
  // 1. Let callerContext be the running execution context.
  const callerContext = ExecutionContextStack.runningExecutionContext()
  // 2. If callerContext is not already suspended, suspend callerContext.
  // 3. Let calleeContext be a new execution context.
  const calleeContext = new ExecutionContext()
  // 4. Set the Function of calleeContext to F.
  // TODO:
  // calleeContext.Function = F
  // 5. Let calleeRealm be F.[[Realm]].
  const calleeRealm = F['[[Realm]]']
  // 6. Set the Realm of calleeContext to calleeRealm.
  calleeContext.Realm = calleeRealm
  // 7. Set the ScriptOrModule of calleeContext to null.
  calleeContext.ScriptOrModule = null
  // 8. Perform any necessary implementation-defined initialization of calleeContext.
  // 9. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
  ExecutionContextStack.push(calleeContext)
  // 10. Let result be the Completion Record that is the result of evaluating F in a manner that conforms to the specification of F.
  // If thisArgument is UNINITIALIZED, the this value is uninitialized; otherwise, thisArgument provides the this value. argumentsList provides the named parameters. newTarget provides the NewTarget value.
  const result = CompletionRecord.NormalCompletion(F.execute())
  // 11. NOTE: If F is defined in this document, “the specification of F” is the behaviour specified for it via algorithm steps or other means.
  // 12. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
  ExecutionContextStack.pop()
  // 13. Return ? result.
  return result
}
// 10.3.4 CreateBuiltinFunction ( behaviour, length, name, additionalInternalSlotsList [ , realm [ , prototype [ , prefix ] ] ] )
export function CreateBuiltinFunction(
  behaviour: any,
  length: number,
  name: PropertyKey | PrivateName,
  additionalInternalSlotsList: List<string>,
  realm?: RealmRecord,
  prototype?: ObjectType | NullType,
  prefix?: string,
): FunctionObjectType {
  // 1. If realm is not present, set realm to the current Realm Record.
  if (realm === undefined) realm = ExecutionContextStack.runningExecutionContext().Realm
  // 2. If prototype is not present, set prototype to realm.[[Intrinsics]].[[%Function.prototype%]].
  if (prototype === undefined) prototype = realm['[[Intrinsics]]']['[[Function.prototype]]'] as ObjectType
  // 3. Let internalSlotsList be a List containing the names of all the internal slots that 10.3 requires for the built-in function object that is about to be created.
  // 4. Append to internalSlotsList the elements of additionalInternalSlotsList.
  const internalSlotsList = ([] as string[]).concat([...additionalInternalSlotsList])
  // 5. Let func be a new built-in function object that, when called, performs the action described by behaviour using the provided arguments as the values of the corresponding parameters specified by behaviour.
  // The new function object has internal slots whose names are the elements of internalSlotsList, and an [[InitialName]] internal slot.
  const func = new ObjectType() as unknown as IFunctionObject
  // 6. Set func.[[Prototype]] to prototype.
  func['[[Prototype]]'] = prototype
  // 7. Set func.[[Extensible]] to true.
  func['[[Extensible]]'] = true
  // 8. Set func.[[Realm]] to realm.
  func['[[Realm]]'] = realm
  // 9. Set func.[[InitialName]] to null.
  // @ts-ignore
  func['[[InitialName]]'] = null
  // 10. Perform SetFunctionLength(func, length).
  SetFunctionLength(func, length)
  // 11. If prefix is not present, then
  if (prefix === undefined) {
    // a. Perform SetFunctionName(func, name).
    SetFunctionName(func, name)
  } else {
    // 12. Else,
    // a. Perform SetFunctionName(func, name, prefix).
    SetFunctionName(func, name, prefix)
  }
  // 13. Return func.
  return func as unknown as FunctionObjectType
}
