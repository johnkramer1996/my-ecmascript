import TypeException from 'exceptions/TypeException'
import IValue from '../IValue'
import Value from '../Value'
import UndefinedValue from './UndefinedValue'
import NumberValue from './NumberValue'
import Types from './Types'
import StringValue from './StringValue'

export type MyObject = { [index: string]: IValue }

export default class ObjectValue extends Value<MyObject> implements Iterable<[string, IValue]> {
  static ObjectPrototype = new ObjectValue(null)
  private __proto__: ObjectValue | null = null

  constructor(__proto__: IValue | null = ObjectValue.ObjectPrototype, value: MyObject = {}) {
    super(value, Types.OBJECT)
    if (__proto__ instanceof ObjectValue) this.__proto__ = __proto__
  }

  public size(): number {
    return Object.keys(this.value).length
  }

  public get(property: string): IValue {
    if (this.hasOwnProperty(property)) return this.value[property] as IValue
    if (!this.__proto__) return UndefinedValue.UNDEFINED
    if (property === '__proto__') return this.__proto__
    return this.__proto__.get(property)
  }

  private hasOwnProperty(key: string) {
    return this.value.hasOwnProperty(key)
  }

  public set(key: string, value: IValue): void {
    if (key === '__proto__') {
      if (!(value instanceof ObjectValue)) return
      this.__proto__ = value
      return
    }
    this.value[key] = value
  }

  public compareTo(o: IValue): number {
    if (o instanceof ObjectValue) return this.size() >= o.size() ? this.size() - o.size() : o.size() - this.size()
    return this.asString().localeCompare(o.asString())
  }

  public [Symbol.iterator](): Iterator<[string, IValue]> {
    // return this.value.entries()
    const entries = Object.entries(this.value)
    const length = entries.length
    let index = 0
    return {
      next(): IteratorResult<[string, IValue]> {
        return index < length ? { value: entries[index++], done: false } : { value: entries[index], done: true }
      },
    }
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof ObjectValue)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    throw new TypeException('Cannot cast array to number')
  }

  public asString(): string {
    const entries = Object.entries(this.value)
      .map(([key, value]) => {
        const primitive =
          value instanceof NumberValue
            ? value.asNumber()
            : value instanceof StringValue
            ? `"${value}"`
            : value instanceof ObjectValue && value === this
            ? '[Circular *1]'
            : value.asString()
        return `"${key}": ${primitive}`
      })
      .join(', ')
    return `{${entries}}`
  }
}
