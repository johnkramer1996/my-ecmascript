import IECMAScriptLanguageType from '../IValue'
import ECMAScriptLanguageTypes from './Types'
import Value from '../Value'

export default class UndefinedType extends Value {
  public static UNDEFINED = new UndefinedType()

  constructor() {
    super(undefined, ECMAScriptLanguageTypes.undefined)
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof UndefinedType)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }
}
