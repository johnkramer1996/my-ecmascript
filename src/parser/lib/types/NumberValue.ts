import IECMAScriptLanguageType from '../IValue'
import ECMAScriptLanguageTypes from './Types'
import Value from '../Value'

export default class NumberType extends Value<number> {
  static NaN = new NumberType(NaN)
  static Infinity = new NumberType(Infinity)
  static '-Infinity' = new NumberType(-Infinity)

  constructor(value: number) {
    super(value, ECMAScriptLanguageTypes.number)
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    if (o instanceof NumberType) return this.value >= o.value ? this.value - o.value : o.value - this.value
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof NumberType)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return this.value
  }

  public asString(): string {
    return String(this.value)
  }
}
