import IECMAScriptLanguageType from '../IValue'
import UndefinedType from '../types/UndefinedValue'
import { CompletionRecord, CompletionRecordWithError, List, getNC } from './6.2'
import NullType from '../types/NullValue'
import { ObjectType } from '../types/ObjectValue'
import { Assert } from './5.2'
import { IsAccessorDescriptor, IsDataDescriptor, IsGenericDescriptor } from './6.2'
import { SameValue, IsExtensible, IsPropertyKey } from './7.2'
import { MakeBasicObject, Get, GetFunctionRealm, Call_7_13, HasOwnProperty, CreateDataProperty } from './7.3'
import { PropertyDescriptor } from './spec'
import { IFunctionObject, IObject } from './6.1'

// 10.1 Ordinary Object Internal Methods and Internal Slots

// 10.1.1.1 OrdinaryGetPrototypeOf ( O )
export function OrdinaryGetPrototypeOf(O: ObjectType): ObjectType | NullType {
  // 1. Return O.[[Prototype]].
  return O['[[Prototype]]']
}
// 10.1.2.1 OrdinarySetPrototypeOf ( O, V )
export function OrdinarySetPrototypeOf(O: ObjectType, V: ObjectType | NullType): boolean {
  // 1. Let current be O.[[Prototype]].
  const current = O['[[Prototype]]']
  // 2. If SameValue(V, current) is true, return true.
  if (SameValue(V, current)) return true
  // 3. Let extensible be O.[[Extensible]].
  const extensible = O['[[Extensible]]']
  // 4. If extensible is false, return false.
  if (!extensible) return false
  // 5. Let p be V.
  let p = V
  // 6. Let done be false.
  let done = false
  // 7. Repeat, while done is false,
  while (done === false) {
    // a. If p is null, then
    if (p instanceof NullType)
      // i. Set done to true.
      done = true
    // b. Else if SameValue(p, O) is true, then
    else if (SameValue(p, O))
      // i. Return false.
      return false
    // c. Else,
    else {
      // i. If p.[[GetPrototypeOf]] is not the ordinary object internal method defined in 10.1.1, set done to true.
      if (p['[[GetPrototypeOf]]']() instanceof ObjectType) done = true
      else {
        // ii. Else, set p to p.[[Prototype]].
        p = p['[[Prototype]]']
      }
    }
  }
  // 8. Set O.[[Prototype]] to V.
  O['[[Prototype]]'] = V
  // 9. Return true.
  return true
}
// 10.1.3.1 OrdinaryIsExtensible ( O )
export function OrdinaryIsExtensible(O: ObjectType): boolean {
  // 1. Return O.[[Extensible]].
  return O['[[Extensible]]']
}
// 10.1.4.1 OrdinaryPreventExtensions ( O )
export function OrdinaryPreventExtensions(O: ObjectType): boolean {
  // 1. Set O.[[Extensible]] to false.
  O['[[Extensible]]'] = false
  // 2. Return true.
  return true
}
// 10.1.5.1 OrdinaryGetOwnProperty ( O, P )
export function OrdinaryGetOwnProperty(O: ObjectType, P: PropertyKey): PropertyDescriptor | undefined {
  // 1. If O does not have an own property with key P, return undefined.
  if (!O.has(P)) return undefined
  // 2. Let D be a newly created Property Descriptor with no fields.
  const D = new PropertyDescriptor()
  // 3. Let X be O's own property whose key is P.
  const X = O.get(P) as PropertyDescriptor
  // 4. If X is a data property, then
  if (IsDataDescriptor(X)) {
    // a. Set D.[[Value]] to the value of X's [[Value]] attribute.
    D['[[Value]]'] = X['[[Value]]']
    // b. Set D.[[Writable]] to the value of X's [[Writable]] attribute.
    D['[[Writable]]'] = X['[[Writable]]']
  }
  // 5. Else,
  else {
    // a. Assert: X is an accessor property.
    Assert(IsAccessorDescriptor(X))
    // b. Set D.[[Get]] to the value of X's [[Get]] attribute.
    D['[[Get]]'] = X['[[Get]]']
    // c. Set D.[[Set]] to the value of X's [[Set]] attribute.
    D['[[Set]]'] = X['[[Set]]']
  }
  // 6. Set D.[[Enumerable]] to the value of X's [[Enumerable]] attribute.
  D['[[Enumerable]]'] = X['[[Enumerable]]']
  // 7. Set D.[[Configurable]] to the value of X's [[Configurable]] attribute.
  D['[[Configurable]]'] = X['[[Configurable]]']
  // 8. Return D.
  return D
}
// 10.1.6.1 OrdinaryDefineOwnProperty ( O, P, Desc )
export function OrdinaryDefineOwnProperty(
  O: ObjectType,
  P: PropertyKey,
  Desc: PropertyDescriptor,
): CompletionRecordWithError<boolean> {
  // 1. Let current be ? O.[[GetOwnProperty]](P).
  const current = getNC(O['[[GetOwnProperty]]'](P))['[[Value]]']
  // 2. Let extensible be ? IsExtensible(O).
  const extensible = getNC(IsExtensible(O))['[[Value]]']
  // 3. Return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current).
  return CompletionRecord.NormalCompletion(ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current))
}

// 10.1.6.2 IsCompatiblePropertyDescriptor ( Extensible, Desc, Current )
export function IsCompatiblePropertyDescriptor(
  Extensible: boolean,
  Desc: PropertyDescriptor,
  Current: PropertyDescriptor | undefined,
): CompletionRecord<boolean> {
  // 1. Return ValidateAndApplyPropertyDescriptor(undefined, "", Extensible, Desc, Current).
  return CompletionRecord.NormalCompletion(ValidateAndApplyPropertyDescriptor(undefined, '', Extensible, Desc, Current))
}

// 10.1.6.3 ValidateAndApplyPropertyDescriptor ( O, P, extensible, Desc, current )
function ValidateAndApplyPropertyDescriptor(
  O: ObjectType | undefined,
  P: PropertyKey,
  extensible: boolean,
  Desc: PropertyDescriptor,
  current: PropertyDescriptor | undefined,
): boolean {
  // 1. Assert: IsPropertyKey(P) is true.
  Assert(IsPropertyKey(P) === true)
  // 2. If current is undefined, then
  if (current === undefined) {
    // a. If extensible is false, return false.
    if (extensible === false) return false
    // b. If O is undefined, return true.
    if (O === undefined) return true
    // c. If IsAccessorDescriptor(Desc) is true, then
    if (IsAccessorDescriptor(Desc)) {
      // i. Create an own accessor property named P of object O whose [[Get]], [[Set]], [[Enumerable]], and [[Configurable]] attributes are set to the value of the corresponding field in Desc if Desc has that field, or to the attribute's default value otherwise.

      O.propertyDescriptors.set(
        P,
        new PropertyDescriptor({
          '[[Get]]': Desc['[[Get]]'],
          '[[Set]]': Desc['[[Set]]'],
          '[[Enumerable]]': Desc['[[Enumerable]]'],
          '[[Configurable]]': Desc['[[Configurable]]'],
        }),
      )
    }
    // d. Else,
    else {
      // i. Create an own data property named P of object O whose [[Value]], [[Writable]], [[Enumerable]], and [[Configurable]] attributes are set to the value of the corresponding field in Desc if Desc has that field, or to the attribute's default value otherwise.
      O.propertyDescriptors.set(
        P,
        new PropertyDescriptor({
          '[[Value]]': Desc['[[Value]]'],
          '[[Writable]]': Desc['[[Writable]]'],
          '[[Enumerable]]': Desc['[[Enumerable]]'],
          '[[Configurable]]': Desc['[[Configurable]]'],
        }),
      )
    }
    // e. Return true.
    return true
  }
  // 3. Assert: current is a fully populated Property Descriptor.
  Assert(IsAccessorDescriptor(current) || IsDataDescriptor(current))
  // 4. If Desc does not have any fields, return true.
  if (
    !(
      Desc['[[Configurable]]'] ||
      Desc['[[Enumerable]]'] ||
      Desc['[[Writable]]'] ||
      Desc['[[Value]]'] ||
      Desc['[[Set]]'] ||
      Desc['[[Get]]']
    )
  )
    return true
  // 5. If current.[[Configurable]] is false, then
  if (current['[[Configurable]]'] === false) {
    // a. If Desc has a [[Configurable]] field and Desc.[[Configurable]] is true, return false.
    if (Desc['[[Configurable]]'] && Desc['[[Configurable]]'] === true) return false
    // b. If Desc has an [[Enumerable]] field and Desc.[[Enumerable]] is not current.[[Enumerable]], return false.
    if (Desc['[[Enumerable]]'] && !(Desc['[[Enumerable]]'] === current['[[Enumerable]]'])) return false
    // c. If IsGenericDescriptor(Desc) is false and IsAccessorDescriptor(Desc) is not IsAccessorDescriptor(current), return false.
    if (IsGenericDescriptor(Desc) === false && !(IsAccessorDescriptor(Desc) === IsAccessorDescriptor(current)))
      return false
    // d. If IsAccessorDescriptor(current) is true, then
    if (IsAccessorDescriptor(current)) {
      // i. If Desc has a [[Get]] field and SameValue(Desc.[[Get]], current.[[Get]]) is false, return false.
      if (Desc['[[Get]]'] && SameValue(Desc['[[Get]]'], current['[[Get]]']) === false) return false
      // ii. If Desc has a [[Set]] field and SameValue(Desc.[[Set]], current.[[Set]]) is false, return false.
      if (Desc['[[Set]]'] && SameValue(Desc['[[Set]]'], current['[[Set]]']) === false) return false
      // e. Else if current.[[Writable]] is false, then
    } else if (current['[[Writable]]'] === false) {
      // i. If Desc has a [[Writable]] field and Desc.[[Writable]] is true, return false.
      if (Desc['[[Writable]]'] && Desc['[[Writable]]'] === true) return false
      // ii. If Desc has a [[Value]] field and SameValue(Desc.[[Value]], current.[[Value]]) is false, return false.
      if (Desc['[[Value]]'] && SameValue(Desc['[[Value]]'], current['[[Value]]']) === false) return false
    }
  }
  // 6. If O is not undefined, then
  if (!(O === undefined)) {
    // a. If IsDataDescriptor(current) is true and IsAccessorDescriptor(Desc) is true, then
    if (IsDataDescriptor(current) && IsAccessorDescriptor(Desc)) {
      // i. If Desc has a [[Configurable]] field, let configurable be Desc.[[Configurable]]; else let configurable be current.[[Configurable]].
      const configurable = Desc['[[Configurable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      // ii. If Desc has a [[Enumerable]] field, let enumerable be Desc.[[Enumerable]]; else let enumerable be current.[[Enumerable]].
      const enumerable = Desc['[[Enumerable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      // iii. Replace the property named P of object O with an accessor property whose [[Configurable]] and [[Enumerable]] attributes are set to configurable and enumerable, respectively, and whose [[Get]] and [[Set]] attributes are set to the value of the corresponding field in Desc if Desc has that field, or to the attribute's default value otherwise.
      O.propertyDescriptors.set(
        P,
        new PropertyDescriptor({
          '[[Configurable]]': configurable,
          '[[Enumerable]]': enumerable,
          '[[Get]]': Desc['[[Get]]'],
          '[[Set]]': Desc['[[Set]]'],
        }),
      )
      // b. Else if IsAccessorDescriptor(current) is true and IsDataDescriptor(Desc) is true, then
    } else if (IsAccessorDescriptor(current) && IsDataDescriptor(Desc)) {
      // i. If Desc has a [[Configurable]] field, let configurable be Desc.[[Configurable]]; else let configurable be current.[[Configurable]].
      const configurable = Desc['[[Configurable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      // ii. If Desc has a [[Enumerable]] field, let enumerable be Desc.[[Enumerable]]; else let enumerable be current.[[Enumerable]].
      const Enumerable = Desc['[[Enumerable]]'] ? Desc['[[Configurable]]'] : current['[[Configurable]]']
      // iii. Replace the property named P of object O with a data property whose [[Configurable]] and [[Enumerable]] attributes are set to configurable and enumerable, respectively, and whose [[Value]] and [[Writable]] attributes are set to the value of the corresponding field in Desc if Desc has that field, or to the attribute's default value otherwise.
      O.propertyDescriptors.set(
        P,
        new PropertyDescriptor({
          '[[Configurable]]': configurable,
          '[[Enumerable]]': Enumerable,
          '[[Value]]': Desc['[[Value]]'],
          '[[Writable]]': Desc['[[Writable]]'],
        }),
      )
      // c. Else,
    } else {
      // i. For each field of Desc, set the corresponding attribute of the property named P of object O to the value of the field.
      O.propertyDescriptors.set(P, Desc)
    }
  }

  // 7. Return true.
  return true
}
// 10.1.7.1 OrdinaryHasProperty ( O, P )
export function OrdinaryHasProperty(O: ObjectType, P: PropertyKey): CompletionRecordWithError<boolean> {
  // 1. Let hasOwn be ? O.[[GetOwnProperty]](P).
  const hasOwn = O['[[GetOwnProperty]]'](P)
  // 2. If hasOwn is not undefined, return true.
  if (!(hasOwn instanceof UndefinedType)) return CompletionRecord.NormalCompletion(true)
  // 3. Let parent be ? O.[[GetPrototypeOf]]().
  const parent = O['[[GetPrototypeOf]]']()
  // 4. If parent is not null, then
  if (!(parent instanceof NullType))
    // a. Return ? parent.[[HasProperty]](P).
    return parent['[[HasProperty]]'](P)
  // 5. Return false.
  return CompletionRecord.NormalCompletion(false)
}

// 10.1.8.1 OrdinaryGet ( O, P, Receiver )
export function OrdinaryGet(
  O: ObjectType,
  P: PropertyKey,
  Receiver: IECMAScriptLanguageType,
): CompletionRecordWithError<IECMAScriptLanguageType> {
  // 1. Let desc be ? O.[[GetOwnProperty]](P).
  const desc = getNC(O['[[GetOwnProperty]]'](P))['[[Value]]']
  // 2. If desc is undefined, then
  if (desc === undefined) {
    // a. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = O['[[GetPrototypeOf]]']()
    // b. If parent is null, return undefined.
    if (parent instanceof NullType) return CompletionRecord.NormalCompletion(UndefinedType.UNDEFINED)
    // c. Return ? parent.[[Get]](P, Receiver).
    return parent['[[Get]]'](P, Receiver)
  }
  // 3. If IsDataDescriptor(desc) is true, return desc.[[Value]].
  if (IsDataDescriptor(desc) === true) return CompletionRecord.NormalCompletion(desc['[[Value]]'])
  // 4. Assert: IsAccessorDescriptor(desc) is true.
  Assert(IsAccessorDescriptor(desc), 'OrdinaryGet->IsAccessorDescriptor')
  // 5. Let getter be desc.[[Get]].
  const getter = desc['[[Get]]']
  // 6. If getter is undefined, return undefined.
  if (getter instanceof UndefinedType) return CompletionRecord.NormalCompletion(UndefinedType.UNDEFINED)
  // 7. Return ? Call(getter, Receiver).
  return Call_7_13(getter, Receiver)
}

// 10.1.9.1 OrdinarySet ( O, P, V, Receiver )
export function OrdinarySet(
  O: ObjectType,
  P: PropertyKey,
  V: IECMAScriptLanguageType,
  Receiver: IECMAScriptLanguageType,
): CompletionRecordWithError<boolean> {
  //  1. Let ownDesc be ? O.[[GetOwnProperty]](P).
  const ownDesc = getNC(O['[[GetOwnProperty]]'](P))['[[Value]]']
  // 2. Return ? OrdinarySetWithOwnDescriptor(O, P, V, Receiver, ownDesc).
  return OrdinarySetWithOwnDescriptor(O, P, V, Receiver, ownDesc)
}

// 10.1.9.2 OrdinarySetWithOwnDescriptor ( O, P, V, Receiver, ownDesc )
function OrdinarySetWithOwnDescriptor(
  O: ObjectType,
  P: PropertyKey,
  V: IECMAScriptLanguageType,
  Receiver: IECMAScriptLanguageType,
  ownDesc?: PropertyDescriptor,
): CompletionRecordWithError<boolean> {
  // 1. If ownDesc is undefined, then
  if (ownDesc === undefined) {
    // a. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = O['[[GetPrototypeOf]]']()
    // b. If parent is not null, then
    if (!(parent instanceof NullType)) {
      // i. Return ? parent.[[Set]](P, V, Receiver).
      return parent['[[Set]]'](P, V, Receiver)
    }
    // c. Else,
    else {
      // i. Set ownDesc to the PropertyDescriptor { [[Value]]: undefined, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
      ownDesc = new PropertyDescriptor({
        '[[Value]]': undefined,
        '[[Writable]]': true,
        '[[Enumerable]]': true,
        '[[Configurable]]': true,
      })
    }
  }
  // 2. If IsDataDescriptor(ownDesc) is true, then
  if (IsDataDescriptor(ownDesc) === true) {
    // a. If ownDesc.[[Writable]] is false, return false.
    if (ownDesc['[[Writable]]'] === false) return CompletionRecord.NormalCompletion(false)
    // b. If Receiver is not an Object, return false.
    if (!(Receiver instanceof ObjectType)) return CompletionRecord.NormalCompletion(false)
    // c. Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
    const existingDescriptor = getNC(Receiver['[[GetOwnProperty]]'](P))['[[Value]]']
    // d. If existingDescriptor is not undefined, then
    if (!(existingDescriptor === undefined)) {
      // i. If IsAccessorDescriptor(existingDescriptor) is true, return false.
      if (IsAccessorDescriptor(existingDescriptor)) return CompletionRecord.NormalCompletion(false)
      // ii. If existingDescriptor.[[Writable]] is false, return false.
      if (existingDescriptor['[[Writable]]'] === false) return CompletionRecord.NormalCompletion(false)
      // iii. Let valueDesc be the PropertyDescriptor { [[Value]]: V }.
      const valueDesc = new PropertyDescriptor({ '[[Value]]': V })
      // iv. Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
      return Receiver['[[DefineOwnProperty]]'](P, valueDesc)
    }
    // e. Else,
    else {
      // i. Assert: Receiver does not currently have a property P.
      Assert(HasOwnProperty(O, P) === false, 'HasOwnProperty(O, P)===false')
      // ii. Return ? CreateDataProperty(Receiver, P, V).
      return CreateDataProperty(Receiver, P, V)
    }
  }

  // 3. Assert: IsAccessorDescriptor(ownDesc) is true.
  Assert(IsAccessorDescriptor(ownDesc) === true, 'IsAccessorDescriptor(ownDesc) === true')
  // 4. Let setter be ownDesc.[[Set]].
  const setter = ownDesc['[[Set]]']
  // 5. If setter is undefined, return false.
  if (setter instanceof UndefinedType) return CompletionRecord.NormalCompletion(false)
  // 6. Perform ? Call(setter, Receiver, « V »).
  Call_7_13(setter, Receiver, [V])
  // 7. Return true.
  return CompletionRecord.NormalCompletion(true)
}
// 10.1.10.1 OrdinaryDelete ( O, P )
export function OrdinaryDelete(O: ObjectType, P: PropertyKey) {
  // 1. Let desc be ? O.[[GetOwnProperty]](P).
  const desc = getNC(O['[[GetOwnProperty]]'](P))['[[Value]]']
  // 2. If desc is undefined, return true.
  if (desc === undefined) return true
  // 3. If desc.[[Configurable]] is true, then
  if (desc['[[Configurable]]'] === true) {
    // a. Remove the own property with name P from O.
    O.propertyDescriptors.delete(P)
    // b. Return true.
    return true
  }
  return false
  // 4. Return false.
}

// 10.1.11.1 OrdinaryOwnPropertyKeys ( O )
export function OrdinaryOwnPropertyKeys(O: ObjectType): List<IECMAScriptLanguageType> {
  // 1. Let keys be a new empty List.
  const keys = new List()
  // 2. For each own property key P of O such that P is an array index, in ascending numeric index order, do
  for (const [propertyKey, value] of O.propertyDescriptors.entries()) {
    if (!(typeof propertyKey === 'number')) continue
    // a. Append P to keys.
    keys.push(value)
  }
  // 3. For each own property key P of O such that P is a String and P is not an array index, in ascending chronological order of property creation, do
  for (const [propertyKey, value] of O.propertyDescriptors.entries()) {
    if (!(typeof propertyKey === 'string')) continue
    // a. Append P to keys.
    keys.push(value)
  }
  // 4. For each own property key P of O such that P is a Symbol, in ascending chronological order of property creation, do
  for (const [propertyKey, value] of O.propertyDescriptors.entries()) {
    if (!(typeof propertyKey === 'symbol')) continue
    // a. Append P to keys.
    keys.push(value)
  }
  // 5. Return keys.
  return keys
}

// 10.1.12 OrdinaryObjectCreate ( proto [ , additionalInternalSlotsList ] )
export function OrdinaryObjectCreate(proto: ObjectType, additionalInternalSlotsList: string[]): IObject {
  // 1. Let internalSlotsList be « [[Prototype]], [[Extensible]] ».
  const internalSlotsList = ['[[Prototype]]', '[[Extensible]]']
  // 2. If additionalInternalSlotsList is present, set internalSlotsList to the list-concatenation of internalSlotsList and additionalInternalSlotsList.
  if (additionalInternalSlotsList.length) additionalInternalSlotsList.forEach((v) => internalSlotsList.push(v))
  // 3. Let O be MakeBasicObject(internalSlotsList).
  const O = MakeBasicObject(internalSlotsList)
  // 4. Set O.[[Prototype]] to proto.
  O['[[Prototype]]'] = proto
  // 5. Return O.
  return O
}

// 10.1.13 OrdinaryCreateFromConstructor ( constructor, intrinsicDefaultProto [ , internalSlotsList ] )
export function OrdinaryCreateFromConstructor(
  constructor: IFunctionObject,
  intrinsicDefaultProto: string,
  ...internalSlotsList: string[]
) {
  // 1. Assert: intrinsicDefaultProto is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
  // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
  const proto = getNC(GetPrototypeFromConstructor(constructor, intrinsicDefaultProto))
  // 3. If internalSlotsList is present, let slotsList be internalSlotsList.
  // 4. Else, let slotsList be a new empty List.
  const slotsList = internalSlotsList.length ? internalSlotsList : new List<string>()
  // 5. Return OrdinaryObjectCreate(proto, slotsList).
  return OrdinaryObjectCreate(proto['[[Value]]'], slotsList)
}
// 10.1.14 GetPrototypeFromConstructor ( constructor, intrinsicDefaultProto )
function GetPrototypeFromConstructor(
  constructor: IFunctionObject,
  intrinsicDefaultProto: string,
): CompletionRecordWithError<ObjectType> {
  // 1. Assert: intrinsicDefaultProto is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
  // 2. Let proto be ? Get(constructor, "prototype").
  let proto = getNC(Get(constructor, 'prototype'))['[[Value]]']
  // 3. If proto is not an Object, then
  if (!(proto instanceof ObjectType)) {
    // a. Let realm be ? GetFunctionRealm(constructor).
    const realm = GetFunctionRealm(constructor)
    // b. Set proto to realm's intrinsic object named intrinsicDefaultProto.
    proto = (realm as any)[intrinsicDefaultProto] as ObjectType
  }
  // 4. Return proto.
  return CompletionRecord.NormalCompletion(proto as ObjectType)
}
