import IStatement from 'parser/ast/IStatement'
import IECMAScriptLanguageType from './IValue'
import ECMAScriptLanguageTypes from './types/Types'
import { ObjectType } from './types/ObjectValue'

export default abstract class Value<
  T extends
    | string
    | number
    | boolean
    | undefined
    | null
    | IECMAScriptLanguageType[]
    | Object
    | Function
    | IStatement
    | ObjectType = any,
> implements IECMAScriptLanguageType
{
  constructor(protected value: T, protected typeValue: ECMAScriptLanguageTypes) {}

  public abstract equals(value: IECMAScriptLanguageType): boolean
  public abstract compareTo(o: IECMAScriptLanguageType): number

  public type(): string {
    return ECMAScriptLanguageTypes[this.typeValue]
  }

  public raw(): T {
    return this.value
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }

  public toString() {
    return this.asString()
  }
}
