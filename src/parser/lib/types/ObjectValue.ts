import TypeException from 'exceptions/TypeException'
import IECMAScriptLanguageType from '../IValue'
import Value from '../Value'
import UndefinedType from './UndefinedValue'
import NumberType from './NumberValue'
import ECMAScriptLanguageTypes from './Types'
import StringType from './StringValue'
import NullType from './NullValue'
import { CompletionRecord } from '../CallStack'
import {
  PropertyDescriptor,
  OrdinaryGetPrototypeOf,
  OrdinarySetPrototypeOf,
  OrdinaryIsExtensible,
  OrdinaryPreventExtensions,
  OrdinaryGetOwnProperty,
  OrdinaryDefineOwnProperty,
  OrdinaryHasProperty,
  OrdinaryGet,
} from '../spec/spec'

export type MyObject = { [index: string | symbol]: IECMAScriptLanguageType }

export class ObjectType extends Value<MyObject> implements Iterable<[string, IECMAScriptLanguageType]> {
  static ObjectPrototype = new ObjectType(null)
  static FunctionPrototype = new ObjectType(ObjectType.ObjectPrototype, { bind: new NumberType(123) })
  static NumberPrototype = new ObjectType()
  static StringPrototype = new ObjectType()
  private '[[prototype]]': ObjectType | NullType = NullType.NULL
  private '[[Extensible]]' = false
  public propertyDescriptors: { [key: string]: PropertyDescriptor } = {}

  constructor(__proto__: IECMAScriptLanguageType | null = ObjectType.ObjectPrototype, value: MyObject = {}) {
    super(value, ECMAScriptLanguageTypes.object)
    // if (__proto__ instanceof ObjectType) this['[[prototype]]'] = __proto__
  }

  '[[GetPrototypeOf]]'(): ObjectType | NullType {
    return OrdinaryGetPrototypeOf(this)
  }

  '[[SetPrototypeOf]]'(V: ObjectType | NullType): boolean {
    return OrdinarySetPrototypeOf(this, V)
  }

  '[[IsExtensible]]'(): boolean {
    return OrdinaryIsExtensible(this)
  }

  '[[PreventExtensions]]'(): boolean {
    return OrdinaryPreventExtensions(this)
  }

  '[[GetOwnProperty]]'(propertyKey: string): PropertyDescriptor | UndefinedType {
    // If the Type of the return value is Property Descriptor, the return value must be a fully populated Property Descriptor.

    return OrdinaryGetOwnProperty(this, propertyKey)
  }

  '[[DefineOwnProperty]]'(propertyKey: string, propertyDescriptor: PropertyDescriptor): boolean {
    return OrdinaryDefineOwnProperty(this, propertyKey, propertyDescriptor)
  }

  '[[HasProperty]]'(propertyKey: string): boolean {
    return OrdinaryHasProperty(this, propertyKey)
  }

  // 10.1.8 [[Get]] ( P, Receiver )
  '[[Get]]'(propertyKey: string, Receiver?: any): CompletionRecord {
    return OrdinaryGet(this, propertyKey, Receiver)
  }

  '[[Set]]'(propertyKey: string, value: IECMAScriptLanguageType, Receiver?: any): boolean {
    const propertyDescriptor = this.propertyDescriptors[propertyKey]
    if (propertyDescriptor?.['[[Writable]]'] === false) return propertyDescriptor['[[Value]]'] === value
    // if (propertyDescriptor?.['[[Set]]'] === UndefinedValue.UNDEFINED) return false
    const newProp = new PropertyDescriptor({ '[[Value]]': value, '[[Writable]]': true, '[[Configurable]]': true })
    this.propertyDescriptors[propertyKey] = newProp

    return true
  }

  '[[Delete]]'(propertyKey: string): boolean {
    const propertyDescriptor = this.propertyDescriptors[propertyKey]
    if (!propertyDescriptor) return false
    if (propertyDescriptor['[[Writable]]'] === false) return false
    // if (propertyDescriptor['[[Set]]'] === UndefinedValue.UNDEFINED) return false
    delete this.propertyDescriptors[propertyKey]
    return true
  }

  '[[OwnPropertyKeys]]'(): boolean {
    return true
  }

  // public get(propertyKey: string): IValue {
  //   if (!(this['[[GetOwnProperty]]'](propertyKey) instanceof UndefinedValue)) return this['[[Get]]'](propertyKey)
  //   if (this['[[prototype]]'] instanceof NullValue) return UndefinedValue.UNDEFINED
  //   if (propertyKey === '__proto__') return this['[[prototype]]']
  //   return this['[[prototype]]'].get(propertyKey)
  // }

  // public set(propertyKey: string, value: IECMAScriptLanguageType): boolean {
  //   if (propertyKey === '__proto__') {
  //     if (!(value instanceof ObjectType)) return false
  //     this['[[prototype]]'] = value
  //     return true
  //   }
  //   return this['[[Set]]'](propertyKey, value)
  // }

  public delete(propertyKey: string): boolean {
    return this['[[Delete]]'](propertyKey)
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
    console.log(this.propertyDescriptors)
    const entries = Object.entries(this.propertyDescriptors)
      .map(([key, descriptor]) => {
        const value = descriptor['[[Value]]']
        const primitive =
          value instanceof NumberType
            ? value.asNumber()
            : value instanceof StringType
            ? `"${value}"`
            : value instanceof ObjectType && (value === this || Object.values(value.raw()).some((v) => v === this))
            ? '[Circular *1]'
            : value.asString()
        return `"${key}": ${primitive}`
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
