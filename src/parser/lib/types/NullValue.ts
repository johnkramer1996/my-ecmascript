import IECMAScriptLanguageType from '../IValue'
import ECMAScriptLanguageTypes from './Types'
import Value from '../Value'

export default class NullType extends Value {
  public static NULL = new NullType()

  constructor() {
    super(null, ECMAScriptLanguageTypes.null)
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof NullType)) return false
    return this.value === value.value
  }

  public type(): string {
    return ECMAScriptLanguageTypes[ECMAScriptLanguageTypes.object]
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }
}
