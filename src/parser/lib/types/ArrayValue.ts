import TypeException from 'exceptions/TypeException'
import IECMAScriptLanguageType from '../IValue'
import ECMAScriptLanguageTypes from './Types'
import Value from '../Value'
import UndefinedType from './UndefinedValue'

export class MyArray<T extends IECMAScriptLanguageType> extends Array<T> implements Iterable<IECMAScriptLanguageType> {
  toString() {
    return this.join(', ')
  }
}

export default class ArrayValue extends Value<MyArray<IECMAScriptLanguageType>> {
  public static add(array: ArrayValue, value: IECMAScriptLanguageType): ArrayValue {
    return new ArrayValue([...array, value])
  }

  public static merge(array1: ArrayValue, array2: ArrayValue): ArrayValue {
    return new ArrayValue([...array1, ...array2])
  }

  constructor(value: number)
  constructor(size: IECMAScriptLanguageType[])
  constructor(value: number | IECMAScriptLanguageType[]) {
    super(typeof value === 'number' ? new MyArray(value) : MyArray.from([...value]), ECMAScriptLanguageTypes.object)
  }

  public size(): number {
    return this.value.length
  }

  public get(property: string): IECMAScriptLanguageType {
    return this.value[Number(property)] ?? UndefinedType.UNDEFINED
  }

  public set(index: number | string, value: IECMAScriptLanguageType) {
    this.value[Number(index)] = value
  }

  public delete(index: number | string): boolean {
    return delete this.value[Number(index)]
  }

  public getCopyElements(): IECMAScriptLanguageType[] {
    return [...new ArrayValue([...this.value]).value]
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    if (o instanceof ArrayValue) return this.size() >= o.size() ? this.size() - o.size() : o.size() - this.size()
    return this.asString().localeCompare(o.asString())
  }

  public [Symbol.iterator](): Iterator<IECMAScriptLanguageType> {
    return this.value[Symbol.iterator]()
  }

  public equals(value: IECMAScriptLanguageType): boolean {
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
