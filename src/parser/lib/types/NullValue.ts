import IValue from '../IValue'
import Types from './Types'
import Value from '../Value'

export default class NullValue extends Value {
  public static NULL = new NullValue()

  constructor() {
    super(null, Types.null)
  }

  public compareTo(o: IValue): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof NullValue)) return false
    return this.value === value.value
  }

  public type(): string {
    return Types[Types.object]
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }
}
