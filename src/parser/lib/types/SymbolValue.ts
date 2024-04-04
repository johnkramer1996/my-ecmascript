import IECMAScriptLanguageType from '../IValue'
import ECMAScriptLanguageTypes from './Types'
import Value from '../Value'

export default class SymbolType extends Value {
  public static '@@hasInstance' = new SymbolType('hasInstance')
  public static '@@iterator' = new SymbolType('iterator')
  public static '@@toPrimitive' = new SymbolType('toPrimitive')

  constructor(value: string) {
    super(value, ECMAScriptLanguageTypes.symbol)
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof SymbolType)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }
}
