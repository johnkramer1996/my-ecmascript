import IValue from '../IValue'
import Types from './Types'
import Value from '../Value'

export default class StringValue extends Value<string> {
  static EMPTY = new StringValue('')

  constructor(value: string) {
    super(value, Types.STRING)
  }

  public length(): number {
    return this.value.length
  }

  public compareTo(o: IValue): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof StringValue)) return false
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
