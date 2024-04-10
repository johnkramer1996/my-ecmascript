import { PrivateElement, PrivateName, PropertyDescriptor } from './spec'
import { RealmRecord } from './9.3'
import { ClassFieldDefinitionRecord, CompletionRecord, CompletionRecordWithError, List, getNC } from './6.2'
import { ExecutionContextStack } from './9.4'
import IECMAScriptLanguageType from '../IValue'
import { IFunctionObject, IObject } from './6.1'
import { ObjectType } from '../types/ObjectValue'
import { IsCallable, IsPropertyKey } from './7.2'
import { EMPTY } from 'main'
import { Assert } from './5.2'
import UndefinedType from '../types/UndefinedValue'

// 7.3.1 MakeBasicObject ( internalSlotsList )
export function MakeBasicObject(internalSlotsList: string[]): IObject {
  // 1. Let obj be a newly created object with an internal slot for each name in internalSlotsList.
  const obj = new ObjectType()
  // 2. Set obj's essential internal methods to the default ordinary object definitions specified in 10.1.
  // 3. Assert: If the caller will not be overriding both obj's [[GetPrototypeOf]] and [[SetPrototypeOf]] essential internal methods, then internalSlotsList contains [[Prototype]].
  // 4. Assert: If the caller will not be overriding all of obj's [[SetPrototypeOf]], [[IsExtensible]], and [[PreventExtensions]] essential internal methods, then internalSlotsList contains [[Extensible]].
  // 5. If internalSlotsList contains [[Extensible]], set obj.[[Extensible]] to true.
  if (internalSlotsList.includes('[[Extensible]]')) obj['[[Extensible]]'] = true
  // 6. Return obj.
  return obj
}
// 7.3.2 Get ( O, P )
export function Get(O: IObject, P: PropertyKey): CompletionRecordWithError<IECMAScriptLanguageType> {
  // 1. Return ? O.[[Get]](P, O).
  return O['[[Get]]'](P)
}

// 7.3.5 CreateDataProperty ( O, P, V )
export function CreateDataProperty(
  O: IObject,
  P: PropertyKey,
  V: IECMAScriptLanguageType,
): CompletionRecordWithError<boolean> {
  // 1. Let newDesc be the PropertyDescriptor { [[Value]]: V, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
  const newDesc = new PropertyDescriptor({
    '[[Value]]': V,
    '[[Writable]]': true,
    '[[Enumerable]]': true,
    '[[Configurable]]': true,
  })
  // 2. Return ? O.[[DefineOwnProperty]](P, newDesc).
  return O['[[DefineOwnProperty]]'](P, newDesc)
}

// 7.3.6 CreateDataPropertyOrThrow ( O, P, V )
function CreateDataPropertyOrThrow(
  O: IObject,
  P: PropertyKey,
  V: IECMAScriptLanguageType,
): CompletionRecordWithError<any> {
  // 1. Let success be ? CreateDataProperty(O, P, V).
  const success = getNC(CreateDataProperty(O, P, V))['[[Value]]']
  // 2. If success is false, throw a TypeError exception.
  if (success === false) throw TypeError('success ===false')
  // 3. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}

// 7.3.8 DefinePropertyOrThrow ( O, P, desc )
export function DefinePropertyOrThrow(O: IObject, P: PropertyKey, Desc: PropertyDescriptor): CompletionRecord {
  // Let success be ? O.[[DefineOwnProperty]](P, desc).
  const success = O['[[DefineOwnProperty]]'](P, Desc)
  // 2. If success is false, throw a TypeError exception.
  if (success['[[Value]]'] === false) CompletionRecord.ThrowCompletion(new TypeError('DefinePropertyOrThrow'))
  // 3. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}

// 7.3.12 HasOwnProperty ( O, P )
export function HasOwnProperty(O: IObject, P: PropertyKey) {
  // 1. Let desc be ? O.[[GetOwnProperty]](P).
  const desc = getNC(O['[[GetOwnProperty]]'](P))['[[Value]]']
  // 2. If desc is undefined, return false.
  if (desc === undefined) return false
  // 3. Return true.
  return true
}

// 7.3.13 Call ( F, V [ , argumentsList ] )
export function Call_7_13(
  F: IObject,
  V: IECMAScriptLanguageType,
  argumentsList?: IECMAScriptLanguageType[],
): CompletionRecordWithError<IECMAScriptLanguageType> {
  // 1. If argumentsList is not present, set argumentsList to a new empty List.
  argumentsList = argumentsList ?? new List()
  // 2. If IsCallable(F) is false, throw a TypeError exception.
  if (!IsCallable(F)) return CompletionRecord.ThrowCompletion(new Error('Is not Callable'))
  // 3. Return ? F.[[Call]](V, argumentsList).
  return F['[[Call]]'](V, argumentsList)
}

// 7.3.14 Construct ( F [ , argumentsList [ , newTarget ] ] )
export function Construct_7_14(
  F: IFunctionObject,
  argumentsList: List,
  newTarget?: IFunctionObject,
): CompletionRecordWithError<IObject> {
  // 1. If newTarget is not present, set newTarget to F.
  if (newTarget === undefined) newTarget = F
  // 2. If argumentsList is not present, set argumentsList to a new empty List.
  // 3. Return ? F.[[Construct]](argumentsList, newTarget).
  return F['[[Construct]]'](argumentsList, newTarget)
}

// 7.3.24 GetFunctionRealm ( obj )
export function GetFunctionRealm(obj: IFunctionObject): RealmRecord {
  // 1. If obj has a [[Realm]] internal slot, then
  if (obj['[[Realm]]'])
    // a. Return obj.[[Realm]].
    return obj['[[Realm]]']
  // 2. If obj is a bound function exotic object, then
  if (obj) {
    // a. Let boundTargetFunction be obj.[[BoundTargetFunction]].
    // const boundTargetFunction = obj['[[BoundTargetFunction]]']
  }
  // b. Return ? GetFunctionRealm(boundTargetFunction).
  // 3. If obj is a Proxy exotic object, then
  // a. Perform ? ValidateNonRevokedProxy(obj).
  // b. Let proxyTarget be obj.[[ProxyTarget]].
  // c. Return ? GetFunctionRealm(proxyTarget).
  // 4. Return the current Realm Record.
  return ExecutionContextStack.pop().Realm
}

// 7.3.26 PrivateElementFind ( O, P )
function PrivateElementFind(O: IObject, P: PrivateName): typeof EMPTY | PrivateElement {
  //   1. If O.[[PrivateElements]] contains a PrivateElement pe such that pe.[[Key]] is P, then
  if (O['[[PrivateElements]]'].includes(P))
    // a. Return pe.
    return O['[[PrivateElements]]'].find((v) => v === P) ?? EMPTY
  // 2. Return EMPTY.
  return EMPTY
}

// 7.3.27 PrivateFieldAdd ( O, P, value )
function PrivateFieldAdd(O: IObject, P: PrivateName, value: IECMAScriptLanguageType): CompletionRecordWithError<any> {
  // TODO:
  // 1. If the host is a web browser, then
  // a. Perform ? HostEnsureCanAddPrivateElement(O).
  // 2. Let entry be PrivateElementFind(O, P).
  const entry = PrivateElementFind(O, P)
  // 3. If entry is not EMPTY, throw a TypeError exception.
  if (!(entry === EMPTY)) throw TypeError('!(entry===EMPTY)')
  // 4. Append PrivateElement { [[Key]]: P, [[Kind]]: FIELD, [[Value]]: value } to O.[[PrivateElements]].
  O['[[PrivateElements]]'].push(new PrivateElement({ '[[Key]]': P, '[[Kind]]': 'FIELD', '[[Value]]': value }))
  // 5. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}

// 7.3.28 PrivateMethodOrAccessorAdd ( O, method )
function PrivateMethodOrAccessorAdd(O: IObject, method: PrivateElement): CompletionRecordWithError<any> {
  // 1. Assert: method.[[Kind]] is either METHOD or ACCESSOR.
  Assert(method['[[Kind]]'] === 'METHOD' || method['[[Kind]]'] === 'ACCESSOR')
  // TODO:
  // 2. If the host is a web browser, then
  // if(host) {
  //   // a. Perform ? HostEnsureCanAddPrivateElement(O).
  // }
  // 3. Let entry be PrivateElementFind(O, method.[[Key]]).
  const entry = PrivateElementFind(O, method['[[Key]]'])
  // 4. If entry is not EMPTY, throw a TypeError exception.
  if (!(entry === EMPTY)) throw TypeError('!(entry===EMPTY)')
  // 5. Append method to O.[[PrivateElements]].
  O['[[PrivateElements]]'].push(method)
  // 6. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}

// 7.3.30 PrivateGet ( O, P )
export function PrivateGet(O: ObjectType, P: PrivateName) {
  // 1. Let entry be PrivateElementFind(O, P).
  const entry = PrivateElementFind(O, P)
  // 2. If entry is EMPTY, throw a TypeError exception.
  if (entry === EMPTY) throw TypeError('(entry===EMPTY)')
  // 3. If entry.[[Kind]] is either FIELD or METHOD, then
  if (entry['[[Kind]]'] === 'FIELD' || entry['[[Kind]]'] === 'METHOD') {
    // a. Return entry.[[Value]].
    return entry['[[Value]]']
  }
  // 4. Assert: entry.[[Kind]] is ACCESSOR.
  Assert(entry['[[Kind]]'] === 'ACCESSOR', "entry['[[Kind]]']==='ACCESSOR'")
  // 5. If entry.[[Get]] is undefined, throw a TypeError exception.
  if (entry['[[Get]]'] === undefined) throw TypeError("entry['[[Key]]'] === undefined")
  // 6. Let getter be entry.[[Get]].
  const getter = entry['[[Get]]']
  // 7. Return ? Call(getter, O).
  return Call_7_13(getter, O)
}

// 7.3.31 PrivateSet ( O, P, value )
export function PrivateSet(O: ObjectType, P: PrivateName, value: IECMAScriptLanguageType) {
  // 1. Let entry be PrivateElementFind(O, P).
  const entry = PrivateElementFind(O, P)
  // 2. If entry is EMPTY, throw a TypeError exception.
  if (entry === EMPTY) throw TypeError('(entry===EMPTY)')
  // 3. If entry.[[Kind]] is FIELD, then
  if (entry['[[Kind]]'] === 'FIELD') {
    // a. Set entry.[[Value]] to value.
    entry['[[Value]]'] = value
  }
  // 4. Else if entry.[[Kind]] is METHOD, then
  else if (entry['[[Kind]]'] === 'METHOD') {
    // a. Throw a TypeError exception.
    throw TypeError("entry['[[Kind]]'] === 'METHOD'")
  }
  // 5. Else,
  else {
    // a. Assert: entry.[[Kind]] is ACCESSOR.
    Assert(entry['[[Kind]]'] === 'ACCESSOR', "entry['[[Kind]]']==='ACCESSOR'")
    // b. If entry.[[Set]] is undefined, throw a TypeError exception.
    if (entry['[[Set]]'] === undefined) throw TypeError("entry['[[Set]]'] === undefined")
    // c. Let setter be entry.[[Set]].
    const setter = entry['[[Set]]']
    // d. Perform ? Call(setter, O, « value »).
    return Call_7_13(setter, O, [value])
  }
}

// 7.3.32 DefineField ( receiver, fieldRecord )
function DefineField(receiver: IObject, fieldRecord: ClassFieldDefinitionRecord): CompletionRecordWithError<any> {
  // 1. Let fieldName be fieldRecord.[[Name]].
  const fieldName = fieldRecord['[[Name]]']
  // 2. Let initializer be fieldRecord.[[Initializer]].
  const initializer = fieldRecord['[[Initializer]]']
  // 3. If initializer is not EMPTY, then
  const initValue = !(initializer === EMPTY)
    ? // a. Let initValue be ? Call(initializer, receiver).
      getNC(Call_7_13(initializer, receiver))['[[Value]]']
    : // 4. Else,
      // a. Let initValue be undefined.
      UndefinedType.UNDEFINED
  // 5. If fieldName is a Private Name, then
  if (fieldName instanceof PrivateName) {
    // a. Perform ? PrivateFieldAdd(receiver, fieldName, initValue).
    PrivateFieldAdd(receiver, fieldName, initValue)
  }
  // 6. Else,
  else {
    // a. Assert: IsPropertyKey(fieldName) is true.
    Assert(IsPropertyKey(fieldName) === true, 'IsPropertyKey(fieldName)===true')
    // b. Perform ? CreateDataPropertyOrThrow(receiver, fieldName, initValue).
    CreateDataPropertyOrThrow(receiver, fieldName, initValue)
  }
  // 7. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}

// 7.3.33 InitializeInstanceElements ( O, constructor )
export function InitializeInstanceElements(O: IObject, constructor: IFunctionObject): CompletionRecordWithError<any> {
  // 1. Let methods be the value of constructor.[[PrivateMethods]].
  const methods = constructor['[[PrivateMethods]]']
  // 2. For each PrivateElement method of methods, do
  for (const method of methods) {
    // a. Perform ? PrivateMethodOrAccessorAdd(O, method).
    PrivateMethodOrAccessorAdd(O, method)
  }
  // 3. Let fields be the value of constructor.[[Fields]].
  const fields = constructor['[[Fields]]']
  // 4. For each element fieldRecord of fields, do
  for (const fieldRecord of fields) {
    // a. Perform ? DefineField(O, fieldRecord).
    DefineField(O, fieldRecord)
  }
  // 5. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}
