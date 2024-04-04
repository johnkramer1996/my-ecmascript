import IECMAScriptLanguageType from '../IValue'
import UndefinedType from '../types/UndefinedValue'
import {
  CompletionRecord,
  ExecutionContext,
  ExecutionContextStack,
  FunctionEnvironmentRecord,
  GlobalEnvironmentRecord,
  Realm,
} from '../CallStack'
import { BooleanType } from '../types/BooleanValue'
import NullType from '../types/NullValue'
import NumberType from '../types/NumberValue'
import StringType from '../types/StringValue'
import { ObjectType } from '../types/ObjectValue'
import { ConstructorValue, FunctionObjectType } from '../types/FunctionValue'
import SymbolType from '../types/SymbolValue'

class DataProperty {}
class AccessorProperty {}
export class PropertyDescriptor {
  '[[Value]]': IECMAScriptLanguageType = UndefinedType.UNDEFINED
  '[[Writable]]': boolean = false
  '[[Get]]': FunctionObjectType | UndefinedType = UndefinedType.UNDEFINED
  '[[Set]]': FunctionObjectType | UndefinedType = UndefinedType.UNDEFINED
  '[[Enumerable]]': boolean = false
  '[[Configurable]]': boolean = false
  dataProperty = true

  constructor(args: Partial<PropertyDescriptor>) {
    this['[[Value]]'] = args['[[Value]]'] || this['[[Value]]']
    this['[[Writable]]'] = args['[[Writable]]'] || this['[[Writable]]']
    this['[[Get]]'] = args['[[Get]]'] || this['[[Get]]']
    this['[[Set]]'] = args['[[Set]]'] || this['[[Set]]']
    this['[[Enumerable]]'] = args['[[Enumerable]]'] || this['[[Enumerable]]']
    this['[[Configurable]]'] = args['[[Configurable]]'] || this['[[Configurable]]']
  }
}

// 5.2 Algorithm Conventions
export function Assert(expr: boolean) {
  if (expr) return true
  throw new Error('Assert')
}

// 5.2.3.1 Completion ( completionRecord )
export function Completion(completionRecord: unknown): CompletionRecord {
  Assert(completionRecord instanceof CompletionRecord)
  return completionRecord as CompletionRecord
}
// 5.2.3.3 ReturnIfAbrupt
function ReturnIfAbrupt(argument: unknown): CompletionRecord | undefined {
  // 1. Assert: argument is a Completion Record.
  Assert(argument instanceof CompletionRecord)
  const arg = argument as CompletionRecord
  // 2. If argument is an abrupt completion, return Completion(argument).
  if ((arg as CompletionRecord)['[[Type]]'] === 'NORMAL') return Completion(argument)
  // 3. Else, set argument to argument.[[Value]].
  arg['[[Value]]'] = arg
}

// 6.2.6.1 IsAccessorDescriptor ( Desc )
function IsAccessorDescriptor(Desc: PropertyDescriptor | UndefinedType): boolean {
  if (Desc instanceof UndefinedType) return false //   1. If Desc is undefined, return false.
  if (Desc['[[Get]]']) return true //    2. If Desc has a [[Get]] field, return true.
  if (Desc['[[Set]]']) return true //  3. If Desc has a [[Set]] field, return true.
  return false //4. Return false.
}
// 6.2.6.2 IsDataDescriptor ( Desc )
function IsDataDescriptor(Desc: PropertyDescriptor | UndefinedType): boolean {
  if (Desc instanceof UndefinedType) return false //   1. If Desc is undefined, return false.
  if (Desc['[[Value]]']) return true //    2. If Desc has a [[Value]] field, return true.
  if (Desc['[[Writable]]']) return true //  3. If Desc has a [[Writable]] field, return true.
  return false // 4. Return false.
}
// 6.2.6.3 IsGenericDescriptor ( Desc )
function IsGenericDescriptor(Desc: PropertyDescriptor | UndefinedType): boolean {
  if (Desc instanceof UndefinedType) return false //   1. If Desc is undefined, return false.
  if (IsAccessorDescriptor(Desc)) return false
  if (IsDataDescriptor(Desc)) return false
  return true
}

// 7.1.2 ToBoolean ( argument )
function ToBoolean(argument: IECMAScriptLanguageType): BooleanType {
  // 1. If argument is a Boolean, return argument.
  if (argument instanceof BooleanType) return argument
  // 2. If argument is one of undefined, null, +0𝔽, -0𝔽, NaN, 0ℤ, or the empty String, return false.
  if (argument instanceof NullType) return BooleanType.FALSE
  if (argument instanceof UndefinedType) return BooleanType.FALSE
  if (argument instanceof NumberType && argument.asNumber() === 0) return BooleanType.FALSE
  if (argument instanceof NumberType && argument === NumberType.NaN) return BooleanType.FALSE
  if (argument instanceof NumberType && argument.asNumber() === -0) return BooleanType.FALSE
  if (argument instanceof StringType && argument.asString() === '') return BooleanType.FALSE
  // 3. NOTE: This step is replaced in section B.3.6.1.
  // 4. Return true.
  return BooleanType.TRUE
}
// 7.1.18 ToObject ( argument )
function ToObject(argument: IECMAScriptLanguageType): CompletionRecord {
  if (argument instanceof UndefinedType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof NullType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  // if (argument instanceof BooleanType) BooleanConstructor_.raw.call(argument)
  if (argument instanceof NumberType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof StringType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof SymbolType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof ObjectType) return CompletionRecord.NormalCompletion(argument)
  return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
}

// 7.2.7 IsPropertyKey ( argument )
function IsPropertyKey(argument: any): boolean {
  if (typeof argument === 'string') return true
  if (typeof argument === 'symbol') return true
  return false
}
function IsExtensible(O: ObjectType) {
  return O['[[IsExtensible]]']()
}

// 7.2.10 SameValue ( x, y )
function SameValue(a: IECMAScriptLanguageType, b: IECMAScriptLanguageType) {
  if (!(a.type() === b.type())) return false
  if (a instanceof NumberType && b instanceof NumberType) return NumberSameValue(a, b)
  return SameValueNonNumber(a, b)
}

function NumberSameValue(x: NumberType, y: NumberType) {
  if (x === NumberType.NaN && y === NumberType.NaN) return true
  if (x.raw() === +0 && y.raw() === -0) return false
  if (x.raw() === -0 && y.raw() === +0) return false
  if (x === y) return true
  return false
}

// 7.2.12 SameValueNonNumber ( x, y )
function SameValueNonNumber(x: IECMAScriptLanguageType, y: IECMAScriptLanguageType) {
  // 1. Assert: Type(x) is Type(y).
  Assert(x.type() === x.type())
  // 2. If x is either null or undefined, return true.
  if (x instanceof UndefinedType || x instanceof NullType) return true
  // 3. If x is a BigInt, then
  // a. Return BigInt::equal(x, y).
  // 4. If x is a String, then
  if (x instanceof StringType) {
    // a. If x and y have the same length and the same code units in the same positions, return true; otherwise, return false.
    if (x.raw() === y.raw()) return true
  }
  // 5. If x is a Boolean, then
  if (x instanceof BooleanType) {
    // a. If x and y are both true or both false, return true; otherwise, return false.
    return x.raw() === y.raw()
  }
  // 6. NOTE: All other ECMAScript language values are compared by identity.
  // 7. If x is y, return true; otherwise, return false.
  return x === y
}

// 7.2.3 IsCallable ( argument )
function IsCallable(argument: any): argument is FunctionObjectType {
  if (!(argument instanceof ObjectType)) return false
  if (argument instanceof FunctionObjectType) return true
  return false
}
// 7.2.4 IsConstructor ( argument )
function IsConstructor(argument: any): argument is FunctionObjectType {
  if (!(argument instanceof ObjectType)) return false
  if (argument instanceof ConstructorValue) return true
  return false
}

// 7.3.1 MakeBasicObject ( internalSlotsList )
function MakeBasicObject(internalSlotsList: string[]) {
  // 1. Let obj be a newly created object with an internal slot for each name in internalSlotsList.
  // 2. Set obj's essential internal methods to the default ordinary object definitions specified in 10.1.
  // 3. Assert: If the caller will not be overriding both obj's [[GetPrototypeOf]] and [[SetPrototypeOf]] essential internal methods, then internalSlotsList contains [[Prototype]].
  // 4. Assert: If the caller will not be overriding all of obj's [[SetPrototypeOf]], [[IsExtensible]], and [[PreventExtensions]] essential internal methods, then internalSlotsList contains [[Extensible]].
  // 5. If internalSlotsList contains [[Extensible]], set obj.[[Extensible]] to true.
  // 6. Return obj.
  return new ObjectType()
}

// 7.3.2 Get ( O, P )
function Get(O: ObjectType, P: string): CompletionRecord {
  // 1. Return ? O.[[Get]](P, O).
  return O['[[Get]]'](P)
}
// 7.3.13 Call ( F, V [ , argumentsList ] )
function Call(F: ObjectType, V: IECMAScriptLanguageType, argumentsList?: IECMAScriptLanguageType[]): CompletionRecord {
  argumentsList = argumentsList ?? []
  if (!IsCallable(F)) throw new Error('Is not Callable')
  return F['[[Call]]'](V, argumentsList)
}

// 7.3.24 GetFunctionRealm ( obj )
function GetFunctionRealm(obj: FunctionObjectType): Realm {
  // 1. If obj has a [[Realm]] internal slot, then
  if (obj['[[Realm]]'])
    // a. Return obj.[[Realm]].
    return obj['[[Realm]]']
  // 2. If obj is a bound function exotic object, then
  // a. Let boundTargetFunction be obj.[[BoundTargetFunction]].
  // b. Return ? GetFunctionRealm(boundTargetFunction).
  // 3. If obj is a Proxy exotic object, then
  // a. Perform ? ValidateNonRevokedProxy(obj).
  // b. Let proxyTarget be obj.[[ProxyTarget]].
  // c. Return ? GetFunctionRealm(proxyTarget).
  // 4. Return the current Realm Record.
  return ExecutionContextStack.pop().Realm
}

// 9.1.2.4 NewFunctionEnvironment ( F, newTarget )
function NewFunctionEnvironment(F: FunctionObjectType, newTarget?: ObjectType): FunctionEnvironmentRecord {
  const env = new FunctionEnvironmentRecord()
  env['[[FunctionObject]]'] = F
  if (F['[[ThisMode]]'] === 'LEXICAL') env['[[ThisBindingStatus]]'] = 'LEXICAL'
  else env['[[ThisBindingStatus]]'] = 'UNINITIALIZED'
  env['[[NewTarget]]'] = newTarget ?? null
  env['[[OuterEnv]]'] = F['[[Environment]]']
  return env
}

// 10.1.12 OrdinaryObjectCreate ( proto [ , additionalInternalSlotsList ] )
function OrdinaryObjectCreate(proto: ObjectType, additionalInternalSlotsList: string[]): ObjectType {
  // 1. Let internalSlotsList be « [[Prototype]], [[Extensible]] ».
  // 2. If additionalInternalSlotsList is present, set internalSlotsList to the list-concatenation of internalSlotsList and additionalInternalSlotsList.
  const internalSlotsList = ['[[Prototype]]', '[[Extensible]]'].concat(additionalInternalSlotsList)
  // 3. Let O be MakeBasicObject(internalSlotsList).
  const O = MakeBasicObject(internalSlotsList)
  // 4. Set O.[[Prototype]] to proto.
  O['[[prototype]]'] = proto
  // 5. Return O.
  return O
}
// 10.1.13 OrdinaryCreateFromConstructor ( constructor, intrinsicDefaultProto [ , internalSlotsList ] )
function OrdinaryCreateFromConstructor(
  constructor: FunctionObjectType,
  intrinsicDefaultProto: string,
  ...internalSlotsList: string[]
) {
  // 1. Assert: intrinsicDefaultProto is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
  // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
  const proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto)
  // 3. If internalSlotsList is present, let slotsList be internalSlotsList.
  // 4. Else, let slotsList be a new empty List.
  const slotsList = internalSlotsList.length ? internalSlotsList : []
  // 5. Return OrdinaryObjectCreate(proto, slotsList).
  return OrdinaryObjectCreate(proto['[[Value]]'], slotsList)
}
// 10.1.14 GetPrototypeFromConstructor ( constructor, intrinsicDefaultProto )
function GetPrototypeFromConstructor(constructor: FunctionObjectType, intrinsicDefaultProto: string): CompletionRecord {
  // 1. Assert: intrinsicDefaultProto is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
  // 2. Let proto be ? Get(constructor, "prototype").
  let proto = Get(constructor, 'prototype')
  // 3. If proto is not an Object, then
  if (!(proto instanceof ObjectType)) {
    // a. Let realm be ? GetFunctionRealm(constructor).
    const realm = GetFunctionRealm(constructor)
    // b. Set proto to realm's intrinsic object named intrinsicDefaultProto.
    // @ts-ignore
    proto = realm[intrinsicDefaultProto]
  }
  // 4. Return proto.
  return proto
}

// 10.1.1.1 OrdinaryGetPrototypeOf ( O )
export function OrdinaryGetPrototypeOf(O: ObjectType): ObjectType | NullType {
  return O['[[prototype]]']
}

// 10.1.2.1 OrdinarySetPrototypeOf ( O, V )
export function OrdinarySetPrototypeOf(O: ObjectType, V: ObjectType | NullType): boolean {
  const current = O['[[prototype]]']
  if (SameValue(V, current)) return true
  const extensible = O['[[Extensible]]']
  if (!extensible) return false
  let p = V
  let done = false
  while (done === false) {
    if (p instanceof NullType) done = true
    else if (SameValue(p, O)) return false
    else {
      if (p['[[GetPrototypeOf]]']()) {
        done = true
      } else {
        p = p['[[prototype]]']
      }
    }
  }
  O['[[prototype]]'] = V
  return true
}

// 10.1.3.1 OrdinaryIsExtensible ( O )
export function OrdinaryIsExtensible(O: ObjectType): boolean {
  return O['[[Extensible]]']
}

// 10.1.4.1 OrdinaryPreventExtensions ( O )
export function OrdinaryPreventExtensions(O: ObjectType): boolean {
  O['[[Extensible]]'] = false
  return true
}

// 10.1.5.1 OrdinaryGetOwnProperty ( O, P )
export function OrdinaryGetOwnProperty(O: ObjectType, P: string): PropertyDescriptor | UndefinedType {
  const property = O.propertyDescriptors[P]
  if (!property) return UndefinedType.UNDEFINED
  const D = new PropertyDescriptor({})
  const X = property
  if (X.dataProperty) {
    D['[[Value]]'] = X['[[Value]]']
    D['[[Writable]]'] = X['[[Writable]]']
  } else {
    // a. Assert: X is an accessor property.
    D['[[Get]]'] = X['[[Get]]']
    D['[[Set]]'] = X['[[Set]]']
  }
  D['[[Enumerable]]'] = X['[[Enumerable]]']
  D['[[Configurable]]'] = X['[[Configurable]]']
  return D
}

// 10.1.6.1 OrdinaryDefineOwnProperty ( O, P, Desc )
export function OrdinaryDefineOwnProperty(O: ObjectType, P: string, Desc: PropertyDescriptor): boolean {
  const current = O['[[GetOwnProperty]]'](P)
  const extensible = IsExtensible(O)

  return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current)
}
// 10.1.6.2 IsCompatiblePropertyDescriptor ( Extensible, Desc, Current )

// 10.1.6.3 ValidateAndApplyPropertyDescriptor ( O, P, extensible, Desc, current )
function ValidateAndApplyPropertyDescriptor(
  O: ObjectType | UndefinedType,
  P: string,
  extensible: boolean,
  Desc: PropertyDescriptor,
  current: UndefinedType | PropertyDescriptor,
): boolean {
  Assert(IsPropertyKey(P))
  if (current instanceof UndefinedType) {
    if (extensible === false) return false
    if (O instanceof UndefinedType) return true
    if (IsAccessorDescriptor(Desc)) {
      O.propertyDescriptors[P] = new PropertyDescriptor({
        '[[Get]]': Desc['[[Get]]'],
        '[[Set]]': Desc['[[Set]]'],
        '[[Enumerable]]': Desc['[[Enumerable]]'],
        '[[Configurable]]': Desc['[[Configurable]]'],
      })
    } else {
      O.propertyDescriptors[P] = new PropertyDescriptor({
        '[[Value]]': Desc['[[Value]]'],
        '[[Writable]]': Desc['[[Writable]]'],
        '[[Enumerable]]': Desc['[[Enumerable]]'],
        '[[Configurable]]': Desc['[[Configurable]]'],
      })
    }
    return true
  }
  Assert(IsAccessorDescriptor(current) || IsDataDescriptor(current))
  // 4. If Desc does not have any fields, return true.
  if (current['[[Configurable]]'] === false) {
    // 5. If current.[[Configurable]] is false, then
    if (Desc['[[Configurable]]'] && Desc['[[Configurable]]'] === true) return false
    if (Desc['[[Enumerable]]'] && !(Desc['[[Enumerable]]'] === current['[[Enumerable]]'])) return false
    if (IsGenericDescriptor(Desc) === false && !(IsAccessorDescriptor(Desc) === IsAccessorDescriptor(current)))
      return false
    if (IsAccessorDescriptor(current)) {
      if (Desc['[[Get]]'] && SameValue(Desc['[[Get]]'], current['[[Get]]']) === false) return false
      if (Desc['[[Set]]'] && SameValue(Desc['[[Set]]'], current['[[Set]]']) === false) return false
    } else if (current['[[Writable]]'] === false) {
      if (Desc['[[Writable]]'] && Desc['[[Writable]]'] === true) return false
      if (Desc['[[Value]]'] && SameValue(Desc['[[Value]]'], current['[[Value]]']) === false) return false
    }
  }

  if (!(O instanceof UndefinedType)) {
    if (IsDataDescriptor(current) && IsAccessorDescriptor(Desc)) {
      const configurable = Desc['[[Configurable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      const Enumerable = Desc['[[Enumerable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      O.propertyDescriptors[P] = new PropertyDescriptor({
        '[[Configurable]]': configurable,
        '[[Enumerable]]': Enumerable,
        '[[Get]]': Desc['[[Get]]'],
        '[[Set]]': Desc['[[Set]]'],
      })
    } else if (IsAccessorDescriptor(current) && IsDataDescriptor(Desc)) {
      const configurable = Desc['[[Configurable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      const Enumerable = Desc['[[Enumerable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      O.propertyDescriptors[P] = new PropertyDescriptor({
        '[[Configurable]]': configurable,
        '[[Enumerable]]': Enumerable,
        '[[Value]]': Desc['[[Value]]'],
        '[[Writable]]': Desc['[[Writable]]'],
      })
    } else {
      const configurable = Desc['[[Configurable]]']
      const Enumerable = Desc['[[Enumerable]]']
      O.propertyDescriptors[P] = new PropertyDescriptor({
        '[[Configurable]]': configurable,
        '[[Enumerable]]': Enumerable,
        '[[Value]]': Desc['[[Value]]'],
        '[[Writable]]': Desc['[[Writable]]'],
        '[[Get]]': Desc['[[Get]]'],
        '[[Set]]': Desc['[[Set]]'],
      })
    }
  }

  return true
}

// 10.1.7.1 OrdinaryHasProperty ( O, P )
export function OrdinaryHasProperty(O: ObjectType, P: string) {
  const hasOwn = O['[[GetOwnProperty]]'](P)
  if (!(hasOwn instanceof UndefinedType)) return true
  const parent = O['[[GetPrototypeOf]]']()
  if (!(parent instanceof NullType)) return parent['[[HasProperty]]'](P)
  return false
}

// 10.1.8.1 OrdinaryGet ( O, P, Receiver )
export function OrdinaryGet(O: ObjectType, P: string, Receiver: IECMAScriptLanguageType): CompletionRecord {
  const desc = O['[[GetOwnProperty]]'](P)
  if (desc instanceof UndefinedType) {
    const parent = O['[[GetPrototypeOf]]']()
    if (parent instanceof NullType) return CompletionRecord.NormalCompletion(UndefinedType.UNDEFINED)
    return parent['[[Get]]'](P, Receiver)
  }
  if (IsDataDescriptor(desc) === true) return CompletionRecord.NormalCompletion(desc['[[Value]]'])
  Assert(IsAccessorDescriptor(desc))
  const getter = desc['[[Get]]']
  if (getter instanceof UndefinedType) return CompletionRecord.NormalCompletion(UndefinedType.UNDEFINED)
  return Call(getter, Receiver)
}

// 10.2.1.1 PrepareForOrdinaryCall ( F, newTarget )
export function PrepareForOrdinaryCall(F: FunctionObjectType, newTarget?: ObjectType) {
  const calleeContext = new ExecutionContext()
  calleeContext.Function = F
  // 4. Let calleeRealm be F.[[Realm]].
  const calleeRealm = F['[[Realm]]']
  calleeContext.Realm = calleeRealm
  calleeContext.ScriptOrModule = F['[[ScriptOrModule]]']
  const localEnv = NewFunctionEnvironment(F, newTarget)
  calleeContext.LexicalEnvironment = localEnv
  calleeContext.VariableEnvironment = localEnv
  calleeContext.PrivateEnvironment = F['[[PrivateEnvironment]]']
  // 11. If callerContext is not already suspended, suspend callerContext.
  ExecutionContextStack.push(calleeContext)
  // 13. NOTE: Any exception objects produced after this point are associated with calleeRealm.
  return calleeContext
}

// 10.2.1.2 OrdinaryCallBindThis ( F, calleeContext, thisArgument )
export function OrdinaryCallBindThis(
  F: FunctionObjectType,
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
      thisValue = globalEnv['[[GlobalThisValue]]']
    }

    // b. Else
    else {
      // i. Let thisValue be ! ToObject(thisArgument).
      thisValue = ToObject(thisArgument)['[[Value]]']
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
export function OrdinaryCallEvaluateBody(
  F: FunctionObjectType,
  argumentsList: IECMAScriptLanguageType[],
): CompletionRecord {
  return EvaluateBody(F, argumentsList)
}
// 10.2.1.3 Runtime Semantics: EvaluateBody
function EvaluateBody(F: FunctionObjectType, argumentsList: IECMAScriptLanguageType[]): CompletionRecord {
  return EvaluateFunctionBody(F, argumentsList)
}

// 10.2.11 FunctionDeclarationInstantiation ( func, argumentsList )
function FunctionDeclarationInstantiation(
  functionObject: FunctionObjectType,
  argumentsList: IECMAScriptLanguageType[],
) {
  console.log('first')
  functionObject['[[ECMAScriptCode]]'].execute()
  return UndefinedType.UNDEFINED
}

export class ClassFieldDefinitionRecord {}
export class PrivateElements {
  '[[Key]]': PrivateName
  '[[Kind]]': 'FIELD' | 'METHOD' | 'ACCESSOR'
  '[[Value]]': IECMAScriptLanguageType
}
export class PrivateName {
  '[[Description]]': string
}

// 15.2.3 Runtime Semantics: EvaluateFunctionBody
function EvaluateFunctionBody(functionObject: FunctionObjectType, argumentsList: IECMAScriptLanguageType[]) {
  return CompletionRecord.NormalCompletion(FunctionDeclarationInstantiation(functionObject, argumentsList))
}
