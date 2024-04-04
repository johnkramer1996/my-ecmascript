import ECMAScriptLanguageTypes from './types/Types'

export default interface IECMAScriptLanguageType {
  asNumber(): number
  asString(): string
  type(): string
  raw(): any
  equals(value: IECMAScriptLanguageType): boolean
  compareTo(o: IECMAScriptLanguageType): number
}
