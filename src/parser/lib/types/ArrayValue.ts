import TypeException from 'exceptions/TypeException'
import IValue from '../IValue'
import Types from './Types'
import Value from '../Value'
import UndefinedValue from './UndefinedValue'

export class MyArray<T extends IValue> extends Array<T> implements Iterable<IValue> {
  toString() {
    return this.join(', ')
  }
}

export default class ArrayValue extends Value<MyArray<IValue>> {
  public static add(array: ArrayValue, value: IValue): ArrayValue {
    return new ArrayValue([...array, value])
  }

  public static merge(array1: ArrayValue, array2: ArrayValue): ArrayValue {
    return new ArrayValue([...array1, ...array2])
  }

  constructor(value: number)
  constructor(size: IValue[])
  constructor(value: number | IValue[]) {
    super(typeof value === 'number' ? new MyArray(value) : MyArray.from([...value]), Types.ARRAY)
  }

  public size(): number {
    return this.value.length
  }

  public get(property: string): IValue {
    return this.value[Number(property)] ?? UndefinedValue.UNDEFINED
  }

  public set(index: number | string, value: IValue) {
    this.value[Number(index)] = value
  }

  public getCopyElements(): IValue[] {
    return [...new ArrayValue([...this.value]).value]
  }

  public compareTo(o: IValue): number {
    if (o instanceof ArrayValue) return this.size() >= o.size() ? this.size() - o.size() : o.size() - this.size()
    return this.asString().localeCompare(o.asString())
  }

  public [Symbol.iterator](): Iterator<IValue> {
    return this.value[Symbol.iterator]()
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof ArrayValue)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    throw new TypeException('Cannot cast array to number')
  }

  public asString(): string {
    return String(`[${this.value}]`)
  }
}
