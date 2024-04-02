import IValue from '../IValue'
import Types from './Types'
import Value from '../Value'

export default class UndefinedValue extends Value {
  public static UNDEFINED = new UndefinedValue()

  constructor() {
    super(undefined, Types.undefined)
  }

  public compareTo(o: IValue): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof UndefinedValue)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }
}
