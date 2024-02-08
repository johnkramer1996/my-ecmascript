import Types from './types/Types'

export default interface IValue {
  asNumber(): number
  asString(): string
  type(): Types
  equals(value: IValue): boolean
  compareTo(o: IValue): number
}
