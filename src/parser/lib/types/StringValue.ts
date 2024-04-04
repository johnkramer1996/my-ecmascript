import IECMAScriptLanguageType from '../IValue'
import ECMAScriptLanguageTypes from './Types'
import Value from '../Value'

export default class StringType extends Value<string> {
  static EMPTY = new StringType('')

  constructor(value: string) {
    super(value, ECMAScriptLanguageTypes.string)
  }

  public length(): number {
    return this.value.length
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof StringType)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return Number.parseFloat(this.value)
  }

  public asString(): string {
    return this.value
  }

  public toHtml() {
    return `<span class='string'>'${this.value}'</span>`
  }
}
