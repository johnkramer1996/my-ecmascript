import IValue from '../IValue'
import Types from './Types'
import Value from '../Value'

export default class NumberValue extends Value<number> {
  constructor(value: number) {
    super(value, Types.NUMBER)
  }

  public compareTo(o: IValue): number {
    if (o instanceof NumberValue) return this.value >= o.value ? this.value - o.value : o.value - this.value
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof NumberValue)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return this.value
  }

  public asString(): string {
    return String(this.value)
  }
}
