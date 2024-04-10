import IECMAScriptLanguageType from '../IValue'
import UndefinedType from '../types/UndefinedValue'
import { CompletionRecord, CompletionRecordWithError, List } from './6.2'
import { FunctionEnvironmentRecord, GlobalEnvironmentRecord } from './9.1'
import { ExecutionContext, ExecutionContextStack } from './9.4'
import NullType from '../types/NullValue'
import NumberType from '../types/NumberValue'
import { ObjectType } from '../types/ObjectValue'
import { FunctionObjectType } from '../types/FunctionValue'
import { IFunctionObject, IObject } from './6.1'
import { Assert, Completion, ReturnIfAbrupt } from './5.2'
import { ToObject } from './7.1'
import { DefinePropertyOrThrow, HasOwnProperty, InitializeInstanceElements } from './7.3'
import { NewFunctionEnvironment } from './9.1'
import { PropertyDescriptor, PrivateName, PrivateElement } from './spec'
import { EvaluateFunctionBody } from './15.2'
import { IsCallable, IsConstructor } from './7.2'
import { OrdinaryCreateFromConstructor } from './10.1'

// ECMAScript Function Objects

// 10.2.1 [[Call]] ( thisArgument, argumentsList )
export function Call_10_2_1(
  this: IFunctionObject,
  thisArgument: IECMAScriptLanguageType,
  argumentsList: List,
): CompletionRecordWithError {
  // 1. Let callerContext be the running execution context.
  const collerContext = ExecutionContextStack.runningExecutionContext()
  // 2. Let calleeContext be PrepareForOrdinaryCall(F, undefined).
  const calleeContext = PrepareForOrdinaryCall(this, undefined)
  // 3. Assert: calleeContext is now the running execution context.
  Assert(
    calleeContext === ExecutionContextStack.runningExecutionContext(),
    'calleeContext === ExecutionContextStack.runningExecutionContext()',
  )
  // 4. If F.[[IsClassConstructor]] is true, then
  if (this['[[IsClassConstructor]]'] === true) {
    // a. Let error be a newly created TypeError object.
    const error = new TypeError()
    // b. NOTE: error is created in calleeContext with F's associated Realm Record.
    // c. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
    ExecutionContextStack.pop()
    // d. Return ThrowCompletion(error).
    return CompletionRecord.ThrowCompletion(error)
  }
  // 5. Perform OrdinaryCallBindThis(F, calleeContext, thisArgument).
  OrdinaryCallBindThis(this, calleeContext, thisArgument)
  // 6. Let result be Completion(OrdinaryCallEvaluateBody(F, argumentsList)).
  const result = Completion(OrdinaryCallEvaluateBody(this, argumentsList))
  // 7. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
  ExecutionContextStack.pop()
  // 8. If result is a return completion, return result.[[Value]].
  // if (result instanceof CompletionRecord)
  const a = result['[[Value]]']
  return CompletionRecord.NormalCompletion(a)
  // 9. ReturnIfAbrupt(result).
  // ReturnIfAbrupt(result)
  // // 10. Return undefined.
  // return UndefinedType.UNDEFINED
}

// 10.2.1.1 PrepareForOrdinaryCall ( F, newTarget )
export function PrepareForOrdinaryCall(F: IFunctionObject, newTarget?: IObject) {
  // 1. Let callerContext be the running execution context.
  const collerContext = ExecutionContextStack.runningExecutionContext()
  // 2. Let calleeContext be a new ECMAScript code execution context.
  const calleeContext = new ExecutionContext()
  // 3. Set the Function of calleeContext to F.
  calleeContext.Function = F
  // 4. Let calleeRealm be F.[[Realm]].
  const calleeRealm = F['[[Realm]]']
  // 5. Set the Realm of calleeContext to calleeRealm.
  calleeContext.Realm = calleeRealm
  // 6. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
  calleeContext.ScriptOrModule = F['[[ScriptOrModule]]']
  // 7. Let localEnv be NewFunctionEnvironment(F, newTarget).
  const localEnv = NewFunctionEnvironment(F, newTarget)
  // 8. Set the LexicalEnvironment of calleeContext to localEnv.
  calleeContext.LexicalEnvironment = localEnv
  // 9. Set the VariableEnvironment of calleeContext to localEnv.
  calleeContext.VariableEnvironment = localEnv
  // 10. Set the PrivateEnvironment of calleeContext to F.[[PrivateEnvironment]].
  calleeContext.PrivateEnvironment = F['[[PrivateEnvironment]]']
  // 11. If callerContext is not already suspended, suspend callerContext.
  // 12. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
  ExecutionContextStack.push(calleeContext)
  // 13. NOTE: Any exception objects produced after this point are associated with calleeRealm.
  // 14. Return calleeContext.
  return calleeContext
}

// 10.2.1.2 OrdinaryCallBindThis ( F, calleeContext, thisArgument )
export function OrdinaryCallBindThis(
  F: IFunctionObject,
  calleeContext: ExecutionContext,
  thisArgument: IECMAScriptLanguageType,
): 'UNUSED' {
  // 1. Let thisMode be F.[[ThisMode]].
  const thisMode = F['[[ThisMode]]']
  // 2. If thisMode is LEXICAL, return UNUSED.
  if (thisMode === 'LEXICAL') return 'UNUSED'
  // 3. Let calleeRealm be F.[[Realm]].
  const calleeRealm = F['[[Realm]]']
  // 4. Let localEnv be the LexicalEnvironment of calleeContext.
  const localEnv = calleeContext.LexicalEnvironment
  let thisValue: IECMAScriptLanguageType
  // 5. If thisMode is STRICT, then
  if (thisMode === 'STRICT') {
    // a. Let thisValue be thisArgument.
    thisValue = thisArgument
  }
  // 6. Else,
  else {
    // a. If thisArgument is either undefined or null, then
    if (thisArgument instanceof UndefinedType || thisArgument instanceof NullType) {
      // i. Let globalEnv be calleeRealm.[[GlobalEnv]].
      const globalEnv = calleeRealm['[[GlobalEnv]]']
      // ii. Assert: globalEnv is a Global Environment Record.
      Assert(globalEnv instanceof GlobalEnvironmentRecord)
      // iii. Let thisValue be globalEnv.[[GlobalThisValue]].
      thisValue = (globalEnv as GlobalEnvironmentRecord)['[[GlobalThisValue]]']
    }

    // b. Else
    else {
      // i. Let thisValue be ! ToObject(thisArgument).
      const toObject = ToObject(thisArgument)
      if (toObject['[[Type]]'] === 'THROW') throw toObject['[[Value]]']
      thisValue = toObject['[[Value]]']
      // ii. NOTE: ToObject produces wrapper objects using calleeRealm.
    }
  }
  // 7. Assert: localEnv is a Function Environment Record.
  Assert(localEnv instanceof FunctionEnvironmentRecord)
  // 8. Assert: The next step never returns an abrupt completion because localEnv.[[ThisBindingStatus]] is not INITIALIZED.
  Assert(!(localEnv['[[ThisBindingStatus]]'] === 'INITIALIZED'))
  // 9. Perform ! localEnv.BindThisValue(thisValue).
  localEnv.BindThisValue(thisValue)
  // 10. Return UNUSED
  return 'UNUSED'
}
// 10.2.1.4 OrdinaryCallEvaluateBody ( F, argumentsList )
export function OrdinaryCallEvaluateBody(F: IFunctionObject, argumentsList: IECMAScriptLanguageType[]) {
  return CompletionRecord.NormalCompletion(EvaluateBody(F, argumentsList)['[[Value]]'])
}
// 10.2.1.3 Runtime Semantics: EvaluateBody
function EvaluateBody(
  F: IFunctionObject,
  argumentsList: IECMAScriptLanguageType[],
): CompletionRecord<IECMAScriptLanguageType> {
  return EvaluateFunctionBody(F, argumentsList)
}

// 10.2.2 [[Construct]] ( argumentsList, newTarget )
function Construct_10_2_2(
  this: IFunctionObject,
  argumentsList: List,
  newTarget: IFunctionObject,
): CompletionRecordWithError<IObject> {
  // 1. Let callerContext be the running execution context.
  const callerContext = ExecutionContextStack.runningExecutionContext()
  // 2. Let kind be F.[[ConstructorKind]].
  const kind = this['[[ConstructorKind]]']
  // 3. If kind is BASE, then
  let thisArgument: IObject | undefined
  if (kind === 'BASE') {
    // a. Let thisArgument be ? OrdinaryCreateFromConstructor(newTarget, "%Object.prototype%").
    thisArgument = OrdinaryCreateFromConstructor(newTarget, '%Object.prototype%')
  }
  // 4. Let calleeContext be PrepareForOrdinaryCall(F, newTarget).
  const calleeContext = PrepareForOrdinaryCall(this, newTarget)
  // 5. Assert: calleeContext is now the running execution context.
  Assert(
    calleeContext === ExecutionContextStack.runningExecutionContext(),
    'calleeContext === ExecutionContextStack.runningExecutionContext()',
  )
  // 6. If kind is BASE, then
  if (kind === 'BASE') {
    // a. Perform OrdinaryCallBindThis(F, calleeContext, thisArgument).
    OrdinaryCallBindThis(this, calleeContext, thisArgument as IObject)
    // b. Let initializeResult be Completion(InitializeInstanceElements(thisArgument, F)).
    const initializeResult = InitializeInstanceElements(thisArgument as IObject, this)
    // c. If initializeResult is an abrupt completion, then
    if (initializeResult['[[Type]]'] === 'THROW') {
      // i. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
      ExecutionContextStack.pop()
      // ii. Return ? initializeResult.
      return initializeResult
    }
  }
  // 7. Let constructorEnv be the LexicalEnvironment of calleeContext.
  const constructorEnv = calleeContext.LexicalEnvironment
  // 8. Let result be Completion(OrdinaryCallEvaluateBody(F, argumentsList)).
  const result = Completion(OrdinaryCallEvaluateBody(this, argumentsList))
  // 9. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
  ExecutionContextStack.pop()
  // 10. If result is a return completion, then
  if (result instanceof CompletionRecord) {
    // a. If result.[[Value]] is an Object, return result.[[Value]].
    if (result['[[Value]]'] instanceof ObjectType) return CompletionRecord.NormalCompletion(result['[[Value]]'])
    // b. If kind is BASE, return thisArgument.
    if (kind === 'BASE') return CompletionRecord.NormalCompletion(thisArgument as IObject)
    // c. If result.[[Value]] is not undefined, throw a TypeError exception.
    if (!(result['[[Value]]'] === undefined)) throw TypeError("!(result['[[Value]]'] === undefined)")
  }
  // 11. Else,
  else {
    // a. ReturnIfAbrupt(result).
    ReturnIfAbrupt(result)
  }
  // 12. Let thisBinding be ? constructorEnv.GetThisBinding().
  const thisBinding = constructorEnv.GetThisBinding()
  // 13. Assert: thisBinding is an Object.
  Assert(thisBinding instanceof ObjectType)
  // 14. Return thisBinding.
  return CompletionRecord.NormalCompletion(thisBinding as ObjectType)
}

// 10.2.5 MakeConstructor ( F [ , writablePrototype [ , prototype ] ] )
export function MakeConstructor(F: IFunctionObject, writablePrototype?: boolean, prototype?: IObject) {
  // 1. If F is an ECMAScript function object, then
  if (IsCallable(F)) {
    // a. Assert: IsConstructor(F) is false.
    Assert(IsConstructor(F) === false)
    // b. Assert: F is an extensible object that does not have a "prototype" own property.
    Assert(F['[[Extensible]]'] === true)
    // c. Set F.[[Construct]] to the definition specified in 10.2.2.
    F['[[Construct]]'] = Construct_10_2_2
  }
  // 2. Else,
  else {
    // a. Set F.[[Construct]] to the definition specified in 10.3.2.
  }
  // 3. Set F.[[ConstructorKind]] to BASE.
  // 4. If writablePrototype is not present, set writablePrototype to true.
  // 5. If prototype is not present, then
  // a. Set prototype to OrdinaryObjectCreate(%Object.prototype%).
  // b. Perform ! DefinePropertyOrThrow(prototype, "constructor", PropertyDescriptor { [[Value]]: F, [[Writable]]: writablePrototype, [[Enumerable]]: false, [[Configurable]]: true }).
  // 6. Perform ! DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: writablePrototype, [[Enumerable]]: false, [[Configurable]]: false }).
  // 7. Return UNUSED.
}

// 10.2.7 MakeMethod ( F, homeObject )
export function MakeMethod(F: IFunctionObject, homeObject: IObject) {
  // 1. Set F.[[HomeObject]] to homeObject.
  F['[[HomeObject]]'] = homeObject
  // 2. Return UNUSED.
  return 'UNUSED'
}

// 10.2.8 DefineMethodProperty ( homeObject, key, closure, enumerable )
export function DefineMethodProperty(
  homeObject: IObject,
  key: PropertyKey | PrivateName,
  closure: IFunctionObject,
  enumerable: boolean,
) {
  // 1. Assert: homeObject is an ordinary, extensible object.
  Assert(homeObject instanceof ObjectType)
  // 2. If key is a Private Name, then
  if (key instanceof PrivateName) {
    // a. Return PrivateElement { [[Key]]: key, [[Kind]]: METHOD, [[Value]]: closure }.
    return new PrivateElement({ '[[Key]]': key, '[[Kind]]': 'METHOD', '[[Value]]': closure })
  }
  // 3. Else,
  else {
    // a. Let desc be the PropertyDescriptor { [[Value]]: closure, [[Writable]]: true, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new PropertyDescriptor({
      '[[Value]]': closure,
      '[[Writable]]': true,
      '[[Enumerable]]': enumerable,
      '[[Configurable]]': true,
    })
    // b. Perform ? DefinePropertyOrThrow(homeObject, key, desc).
    DefinePropertyOrThrow(homeObject, key, desc)
    // c. NOTE: DefinePropertyOrThrow only returns an abrupt completion when attempting to define a class static method whose key is "prototype".
    // d. Return UNUSED.
    return 'UNUSED'
  }
}

// 10.2.9 SetFunctionName ( F, name [ , prefix ] )
export function SetFunctionName(F: IFunctionObject, name: PropertyKey | PrivateName, prefix?: string): 'UNUSED' {
  // 1. Assert: F is an extensible object that does not have a "name" own property.
  // 2. If name is a Symbol, then
  // a. Let description be name's [[Description]] value.
  // b. If description is undefined, set name to the empty String.
  // c. Else, set name to the string-concatenation of "[", description, and "]".
  // 3. Else if name is a Private Name, then
  // a. Set name to name.[[Description]].
  // 4. If F has an [[InitialName]] internal slot, then
  // a. Set F.[[InitialName]] to name.
  // 5. If prefix is present, then
  // a. Set name to the string-concatenation of prefix, the code unit 0x0020 (SPACE), and name.
  // b. If F has an [[InitialName]] internal slot, then
  // i. Optionally, set F.[[InitialName]] to name.
  // 6. Perform ! DefinePropertyOrThrow(F, "name", PropertyDescriptor { [[Value]]: name, [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: true }).
  // 7. Return UNUSED.
  return 'UNUSED'
}
// 10.2.10 SetFunctionLength ( F, length )
export function SetFunctionLength(F: IFunctionObject, length: number): 'UNUSED' {
  // 1. Assert: F is an extensible object that does not have a "length" own property.
  Assert(F['[[Extensible]]'] === true && HasOwnProperty(F, 'length') === false, 'SetFunctionLength')
  // 2. Perform ! DefinePropertyOrThrow(F, "length", PropertyDescriptor { [[Value]]: 𝔽(length), [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: true }).
  DefinePropertyOrThrow(
    F,
    'length',
    new PropertyDescriptor({
      '[[Value]]': new NumberType(length),
      '[[Writable]]': false,
      '[[Enumerable]]': false,
    }),
  )
  // 3. Return UNUSED.
  return 'UNUSED'
}
// 10.2.11 FunctionDeclarationInstantiation ( func, argumentsList )
export function FunctionDeclarationInstantiation(
  func: IFunctionObject,
  argumentsList: IECMAScriptLanguageType[],
): CompletionRecord {
  // 1. Let calleeContext be the running execution context.
  const calleeContext = ExecutionContextStack.runningExecutionContext()
  // 2. Let code be func.[[ECMAScriptCode]].
  const code = func['[[ECMAScriptCode]]']
  // 3. Let strict be func.[[Strict]].
  const strict = func['[[Strict]]']
  // 4. Let formals be func.[[FormalParameters]].
  const formals = func['[[FormalParameters]]']
  for (const param of formals) param.hoisting('var')
  formals.values.forEach((arg, i) => arg.define(argumentsList[i] ?? UndefinedType.UNDEFINED))
  // 5. Let parameterNames be the BoundNames of formals.
  // 6. If parameterNames has any duplicate entries, let hasDuplicates be true. Otherwise, let hasDuplicates be false.
  // 7. Let simpleParameterList be IsSimpleParameterList of formals.
  // 8. Let hasParameterExpressions be ContainsExpression of formals.
  // 9. Let varNames be the VarDeclaredNames of code.
  // 10. Let varDeclarations be the VarScopedDeclarations of code.
  // 11. Let lexicalNames be the LexicallyDeclaredNames of code.
  // const lexicalNames =
  // 12. Let functionNames be a new empty List.
  const functionNames = new List()
  // 13. Let functionsToInitialize be a new empty List.
  const functionsToInitialize = new List()
  return CompletionRecord.NormalCompletion('UNUSED')
}
