import IStatement from 'parser/ast/IStatement'
import IValue from './IValue'
import Types from './types/Types'

export default abstract class Value<
  T extends string | number | boolean | undefined | IValue[] | Object | Function | IStatement,
> implements IValue
{
  constructor(protected value: T, protected typeValue: Types) {}

  public abstract equals(value: IValue): boolean
  public abstract compareTo(o: IValue): number

  public type(): Types {
    return this.typeValue
  }

  public getValue(): T {
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
