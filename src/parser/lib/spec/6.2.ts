import { PrivateName, PropertyDescriptor } from './spec'

import UndefinedType from '../types/UndefinedValue'
import IECMAScriptLanguageType from '../IValue'
import { EMPTY } from 'main'
import { BindingInitialized, EnvironmentRecord, PrivateEnvironmentRecord } from './9.1'
import { ToObject } from './7.1'
import { Assert } from './5.2'
import { PrivateGet } from './7.3'
import { ObjectType } from '../types/ObjectValue'
import { IFunctionObject } from './6.1'
import { ExecutionContextStack } from './9.4'
import { ResolvePrivateIdentifier } from './9.2'

// 6.2.1 The Enum Specification Type
export class Enum {}

// 6.2.2 The List and Record Specification Types
export class List<T = IECMAScriptLanguageType> extends Array {
  [index: number]: T

  public [Symbol.iterator](): IterableIterator<T> {
    return this[Symbol.iterator]()
  }
}
export class Record {
  [index: string]: IECMAScriptLanguageType
}

export const getNC = <T>(completionRecordWithError: CompletionRecordWithError<T>) => {
  if (!(completionRecordWithError['[[Type]]'] === 'NORMAL')) throw completionRecordWithError['[[Value]]']
  return completionRecordWithError
}

export type CompletionRecordWithError<V = IECMAScriptLanguageType> =
  | CompletionRecord<V, 'NORMAL'>
  | CompletionRecord<Error, 'THROW'>

// 6.2.4 The Completion Record Specification Type
export class CompletionRecord<V = any, T extends 'NORMAL' | 'BREAK' | 'CONTINUE' | 'RETURN' | 'THROW' = 'NORMAL'> {
  '[[Type]]': T
  '[[Value]]': V
  '[[Target]]': string | typeof EMPTY

  constructor(args: CompletionRecord<V, T>) {
    this['[[Type]]'] = args['[[Type]]']
    this['[[Value]]'] = args['[[Value]]']
    this['[[Target]]'] = args['[[Target]]']
  }

  static NormalCompletion<V>(value: V): CompletionRecord<V> {
    return new CompletionRecord({ '[[Type]]': 'NORMAL', '[[Value]]': value, '[[Target]]': EMPTY })
  }

  static BreakCompletion(value: any): CompletionRecord<any, 'BREAK'> {
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

// 6.2.5 The Reference Record Specification Type
export class ReferenceRecord<T = IECMAScriptLanguageType | EnvironmentRecord | 'UNRESOLVABLE'> {
  '[[Base]]': T
  '[[ReferencedName]]': string | (T extends EnvironmentRecord ? never : PrivateName | symbol)
  '[[Strict]]': boolean
  '[[ThisValue]]': IECMAScriptLanguageType | typeof EMPTY

  constructor(referenceRecord: ReferenceRecord<T>) {
    this['[[Base]]'] = referenceRecord['[[Base]]']
    this['[[ReferencedName]]'] = referenceRecord['[[ReferencedName]]']
    this['[[Strict]]'] = referenceRecord['[[Strict]]']
    this['[[ThisValue]]'] = referenceRecord['[[ThisValue]]']
  }
}

// 6.2.5.1 IsPropertyReference ( V )
export function IsPropertyReference(V: ReferenceRecord): V is ReferenceRecord<IECMAScriptLanguageType> {
  // 1. If V.[[Base]] is UNRESOLVABLE, return false.
  if (V['[[Base]]'] === 'UNRESOLVABLE') return false
  // 2. If V.[[Base]] is an Environment Record, return false; otherwise return true.
  return V['[[Base]]'] instanceof EnvironmentRecord ? false : true
}

// 6.2.5.2 IsUnresolvableReference ( V )
export function IsUnresolvableReference(V: ReferenceRecord): V is ReferenceRecord<'UNRESOLVABLE'> {
  // 1. If V.[[Base]] is UNRESOLVABLE, return true; otherwise return false.
  return V['[[Base]]'] === 'UNRESOLVABLE' ? true : false
}

// 6.2.5.3 IsSuperReference ( V )
function IsSuperReference(V: ReferenceRecord) {
  // 1. If V.[[ThisValue]] is not EMPTY, return true; otherwise return false.
  return !(V['[[ThisValue]]'] === EMPTY) ? true : false
}

// 6.2.5.4 IsPrivateReference ( V )
function IsPrivateReference(V: ReferenceRecord) {
  // 1. If V.[[ReferencedName]] is a Private Name, return true; otherwise return false.
  return V['[[ReferencedName]]'] instanceof PrivateName ? true : false
}

// 6.2.5.5 GetValue ( V )
export function GetValue(
  V: ReferenceRecord | IECMAScriptLanguageType,
): CompletionRecordWithError<IECMAScriptLanguageType> {
  // 1. If V is not a Reference Record, return V.
  if (!(V instanceof ReferenceRecord)) return CompletionRecord.NormalCompletion(V)
  // 2. If IsUnresolvableReference(V) is true, throw a ReferenceError exception.
  if (IsUnresolvableReference(V)) throw ReferenceError('exception')
  // 3. If IsPropertyReference(V) is true, then
  if (IsPropertyReference(V)) {
    // a. Let baseObj be ? ToObject(V.[[Base]]).
    const baseObj = getNC(ToObject(V['[[Base]]']))['[[Value]]']
    // b. If IsPrivateReference(V) is true, then
    // if (IsPrivateReference(V)) {
    //   // i. Return ? PrivateGet(baseObj, V.[[ReferencedName]]).
    //   return PrivateGet(baseObj, V['[[ReferencedName]]'] as PrivateName)
    // }
    // c. Return ? baseObj.[[Get]](V.[[ReferencedName]], GetThisValue(V)).
    return baseObj['[[Get]]'](V['[[ReferencedName]]'] as string | symbol, GetThisValue(V))
  }
  // 4. Else,
  else {
    // a. Let base be V.[[Base]].
    const base = (V as ReferenceRecord<EnvironmentRecord>)['[[Base]]']
    // b. Assert: base is an Environment Record.
    Assert(base instanceof EnvironmentRecord, 'GetValue')
    // c. Return ? base.GetBindingValue(V.[[ReferencedName]], V.[[Strict]]) (see 9.1).
    return base.GetBindingValue((V as ReferenceRecord<EnvironmentRecord>)['[[ReferencedName]]'], V['[[Strict]]'])
  }
}
// 6.2.5.7 GetThisValue ( V )
export function GetThisValue(V: ReferenceRecord): IECMAScriptLanguageType {
  // 1. Assert: IsPropertyReference(V) is true.
  Assert(IsPropertyReference(V))
  // 2. If IsSuperReference(V) is true, return V.[[ThisValue]]; otherwise return V.[[Base]].
  return IsSuperReference(V) === true
    ? (V['[[ThisValue]]'] as IECMAScriptLanguageType)
    : (V['[[Base]]'] as IECMAScriptLanguageType)
}

// 6.2.5.9 MakePrivateReference ( baseValue, privateIdentifier )
function MakePrivateReference(baseValue: IECMAScriptLanguageType, privateIdentifier: string) {
  // 1. Let privEnv be the running execution context's PrivateEnvironment.
  const privEnv = ExecutionContextStack.runningExecutionContext().PrivateEnvironment
  // 2. Assert: privEnv is not null.
  Assert(!(privEnv === null))
  // 3. Let privateName be ResolvePrivateIdentifier(privEnv, privateIdentifier).
  const privateName = ResolvePrivateIdentifier(privEnv as PrivateEnvironmentRecord, privateIdentifier)
  // 4. Return the Reference Record { [[Base]]: baseValue, [[ReferencedName]]: privateName, [[Strict]]: true, [[ThisValue]]: EMPTY }.
  return CompletionRecord.NormalCompletion(
    new ReferenceRecord({
      '[[Base]]': baseValue,
      '[[ReferencedName]]': privateName,
      '[[Strict]]': true,
      '[[ThisValue]]': EMPTY,
    }),
  )
}

// 6.2.6.1 IsAccessorDescriptor ( Desc )
export function IsAccessorDescriptor(Desc: PropertyDescriptor | undefined): boolean {
  // 1. If Desc is undefined, return false.
  if (Desc === undefined) return false
  // 2. If Desc has a [[Get]] field, return true.
  if (!(Desc['[[Get]]'] instanceof UndefinedType)) return true
  // 3. If Desc has a [[Set]] field, return true.
  if (!(Desc['[[Set]]'] instanceof UndefinedType)) return true
  // 4. Return false.
  return false
}
// 6.2.6.2 IsDataDescriptor ( Desc )
export function IsDataDescriptor(Desc: PropertyDescriptor | undefined): boolean {
  // 1. If Desc is undefined, return false.
  if (Desc === undefined) return false
  // 2. If Desc has a [[Value]] field, return true.
  if (Desc['[[Value]]']) return true
  // 3. If Desc has a [[Writable]] field, return true.
  if (Desc['[[Writable]]']) return true
  // 4. Return false.
  return false
}
// 6.2.6.3 IsGenericDescriptor ( Desc )
export function IsGenericDescriptor(Desc: PropertyDescriptor | undefined): boolean {
  // 1. If Desc is undefined, return false.
  if (Desc === undefined) return false
  // 2. If IsAccessorDescriptor(Desc) is true, return false.
  if (IsAccessorDescriptor(Desc) === true) return false
  // 3. If IsDataDescriptor(Desc) is true, return false.
  if (IsDataDescriptor(Desc) === true) return false
  // 4. Return true.
  return true
}

// 6.2.11 The ClassFieldDefinition Record Specification Type
export class ClassFieldDefinitionRecord {
  '[[Name]]': PropertyKey | PrivateName
  '[[Initializer]]': IFunctionObject | typeof EMPTY

  constructor(args: ClassFieldDefinitionRecord) {
    this['[[Name]]'] = args['[[Name]]']
    this['[[Initializer]]'] = args['[[Initializer]]']
  }
}
