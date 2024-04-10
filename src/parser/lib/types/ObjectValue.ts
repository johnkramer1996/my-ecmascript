import TypeException from 'exceptions/TypeException'
import IECMAScriptLanguageType from '../IValue'
import Value from '../Value'
import UndefinedType from './UndefinedValue'
import NumberType from './NumberValue'
import ECMAScriptLanguageTypes from './Types'
import StringType from './StringValue'
import NullType from './NullValue'
import { RealmRecord } from '../spec/9.3'
import { CompletionRecord, CompletionRecordWithError } from '../spec/6.2'
import { List } from '../spec/6.2'
import { PropertyDescriptor } from '../spec/spec'
import { BuiltinCallOrConstruct } from '../spec/10.3'
import {
  OrdinaryGetPrototypeOf,
  OrdinarySetPrototypeOf,
  OrdinaryIsExtensible,
  OrdinaryPreventExtensions,
  OrdinaryGetOwnProperty,
  OrdinaryDefineOwnProperty,
  OrdinaryHasProperty,
  OrdinaryGet,
  OrdinaryDelete,
  OrdinarySet,
  OrdinaryOwnPropertyKeys,
} from '../spec/10.1'
import { ConstructorValue } from './FunctionValue'
import { IObject } from '../spec/6.1'

export type MyObject = { [index: PropertyKey]: IECMAScriptLanguageType }

export class ObjectType extends Value<MyObject> implements IObject, Iterable<[string, IECMAScriptLanguageType]> {
  static ObjectPrototype = new ObjectType(null)
  static FunctionPrototype = new ObjectType(ObjectType.ObjectPrototype, { bind: new NumberType(123) })
  static NumberPrototype = new ObjectType()
  static StringPrototype = new ObjectType()
  public '[[Prototype]]': ObjectType | NullType = NullType.NULL
  public '[[Extensible]]' = false
  public '[[PrivateElements]]': List
  public propertyDescriptors = new Map<PropertyKey, PropertyDescriptor>()

  constructor(__proto__: IECMAScriptLanguageType | null = ObjectType.ObjectPrototype, value: MyObject = {}) {
    super(value, ECMAScriptLanguageTypes.object)
    // if (__proto__ instanceof ObjectType) this['[[Prototype]]'] = __proto__
  }

  public set(key: PropertyKey, propertyDescriptor: PropertyDescriptor): void {
    this.propertyDescriptors.set(key, propertyDescriptor)
  }

  public get(key: PropertyKey): PropertyDescriptor | undefined {
    return this.propertyDescriptors.get(key)
  }

  public has(key: PropertyKey): boolean {
    return this.propertyDescriptors.has(key)
  }

  '[[GetPrototypeOf]]'(): ObjectType | NullType {
    return OrdinaryGetPrototypeOf(this)
  }

  '[[SetPrototypeOf]]'(V: ObjectType | NullType): CompletionRecordWithError<boolean> {
    return CompletionRecord.NormalCompletion(OrdinarySetPrototypeOf(this, V))
  }

  '[[IsExtensible]]'(): CompletionRecordWithError<boolean> {
    return CompletionRecord.NormalCompletion(OrdinaryIsExtensible(this))
  }

  '[[PreventExtensions]]'(): CompletionRecordWithError<boolean> {
    return CompletionRecord.NormalCompletion(OrdinaryPreventExtensions(this))
  }

  '[[GetOwnProperty]]'(propertyKey: PropertyKey): CompletionRecordWithError<PropertyDescriptor | undefined> {
    // If the Type of the return value is Property Descriptor, the return value must be a fully populated Property Descriptor.

    return CompletionRecord.NormalCompletion(OrdinaryGetOwnProperty(this, propertyKey))
  }

  '[[DefineOwnProperty]]'(
    propertyKey: PropertyKey,
    propertyDescriptor: PropertyDescriptor,
  ): CompletionRecordWithError<boolean> {
    return OrdinaryDefineOwnProperty(this, propertyKey, propertyDescriptor)
  }

  '[[HasProperty]]'(propertyKey: PropertyKey): CompletionRecordWithError<boolean> {
    return OrdinaryHasProperty(this, propertyKey)
  }

  // 10.1.8 [[Get]] ( P, Receiver )
  '[[Get]]'(propertyKey: PropertyKey, Receiver?: any): CompletionRecordWithError<IECMAScriptLanguageType> {
    return OrdinaryGet(this, propertyKey, Receiver)
  }

  '[[Set]]'(
    propertyKey: PropertyKey,
    value: IECMAScriptLanguageType,
    Receiver?: any,
  ): CompletionRecordWithError<boolean> {
    return OrdinarySet(this, propertyKey, value, Receiver)
  }

  '[[Delete]]'(propertyKey: PropertyKey): CompletionRecordWithError<boolean> {
    return CompletionRecord.NormalCompletion(OrdinaryDelete(this, propertyKey))
  }

  // 10.1.11 [[OwnPropertyKeys]] ( )
  '[[OwnPropertyKeys]]'(): CompletionRecordWithError<List<IECMAScriptLanguageType>> {
    // Return OrdinaryOwnPropertyKeys(O).
    return CompletionRecord.NormalCompletion(OrdinaryOwnPropertyKeys(this))
  }

  public size(): number {
    return Object.keys(this.value).length
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    if (o instanceof ObjectType) return this.size() >= o.size() ? this.size() - o.size() : o.size() - this.size()
    return this.asString().localeCompare(o.asString())
  }

  public [Symbol.iterator](): Iterator<[string, IECMAScriptLanguageType]> {
    // return this.value.entries()
    const entries = Object.entries(this.value)
    const length = entries.length
    let index = 0
    return {
      next(): IteratorResult<[string, IECMAScriptLanguageType]> {
        return index < length ? { value: entries[index++], done: false } : { value: entries[index], done: true }
      },
    }
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof ObjectType)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    throw new TypeException('Cannot cast array to number')
  }

  public asString(): string {
    const entries = [...this.propertyDescriptors.entries()]
      .map(([key, descriptor]) => {
        const value = descriptor['[[Value]]'] ?? UndefinedType.UNDEFINED
        const primitive =
          value instanceof NumberType
            ? value.asNumber()
            : value instanceof StringType
            ? `"${value}"`
            : value instanceof ObjectType && (value === this || Object.values(value.raw()).some((v) => v === this))
            ? '[Circular *1]'
            : value.asString()
        return `"${String(key)}": ${primitive}`
      })
      .join(', ')
    return `{${entries}}`
  }
}

export class ClassInstance extends ObjectType {
  constructor(
    __proto__: IECMAScriptLanguageType | null = ObjectType.ObjectPrototype,
    value: MyObject = {},
    private className: string,
  ) {
    super(__proto__, value)
  }

  public asString() {
    return `${this.className} ${super.asString()}`
  }
}

// 10.3 Built-in Function Objects
export class BuiltInFunctionObject extends ObjectType {
  '[[Realm]]' = new RealmRecord()
  '[[InitialName]]': string

  constructor() {
    // %Function.prototype%,
    super()
  }

  execute() {}

  // 10.3.1 [[Call]] ( thisArgument, argumentsList )
  '[[Call]]'(thisArgument: IECMAScriptLanguageType, argumentsList: List): any {
    // 1. Return ? BuiltinCallOrConstruct(F, thisArgument, argumentsList, undefined).
    return BuiltinCallOrConstruct(this, thisArgument, argumentsList, undefined)
  }

  // 10.3.2 [[Construct]] ( argumentsList, newTarget )
  '[[Construct]]'(argumentsList: List, newTarget: ConstructorValue): any {
    // 1. Return ? BuiltinCallOrConstruct(F, UNINITIALIZED, argumentsList, newTarget).
    return BuiltinCallOrConstruct(this, 'UNINITIALIZED', argumentsList, newTarget)
  }
}
