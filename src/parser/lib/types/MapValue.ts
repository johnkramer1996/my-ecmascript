import TypeException from 'exceptions/TypeException'
import IValue from '../IValue'
import Value from '../Value'
import UndefinedValue from './UndefinedValue'
import NumberValue from './NumberValue'
import Types from './Types'

export type Object = { [index: string]: IValue }

export default class MapValue extends Value<Object> implements Iterable<[string, IValue]> {
  public static EMPTY: MapValue = new MapValue()

  constructor(value: IValue[])
  constructor(value?: Object)
  constructor(value: Object | IValue[] = {}) {
    const obj = Array.isArray(value) ? value.reduce((prev, val, i) => ((prev[i] = val), prev), {} as any) : value
    super(obj, Types.OBJECT)
  }

  public size(): number {
    return Object.keys(this.value).length
  }

  public containsKey(key: string): boolean {
    return key in this.value
  }

  public get(key: string): IValue {
    if (!this.value[key]) return UndefinedValue.UNDEFINED
    return this.value[key]
  }

  public set(key: string, value: IValue) {
    this.value[key] = value
  }

  public compareTo(o: IValue): number {
    if (o instanceof MapValue) return this.size() >= o.size() ? this.size() - o.size() : o.size() - this.size()
    return this.asString().localeCompare(o.asString())
  }

  public [Symbol.iterator](): Iterator<[string, IValue]> {
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
    if (!(value instanceof MapValue)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    throw new TypeException('Cannot cast array to number')
  }

  public asString(): string {
    return String(
      `{${Object.entries(this.value).map(([key, value]) => {
        const primitive = value instanceof NumberValue ? value.asNumber() : `"${value.asString()}"`
        return `"${key}": ${primitive}`
      })}}`,
    )
  }
}
