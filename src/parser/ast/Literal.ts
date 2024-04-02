import IValue from 'parser/lib/IValue'
import IVisitor from './IVisitor'
import IExpression from './IExpression'
import NumberValue from 'parser/lib/types/NumberValue'
import StringValue from 'parser/lib/types/StringValue'
import { IAccessible } from './IAccessible'
import BooleanValue from 'parser/lib/types/BooleanValue'
import NullValue from 'parser/lib/types/NullValue'

export default class Literal implements IExpression, IAccessible {
  public value: IValue
  public raw?: string

  constructor(value: number, raw: string)
  constructor(value: string, raw: string)
  constructor(value: boolean, raw: string)
  constructor(value: null, raw: string)
  constructor(value: IValue, raw?: string)
  constructor(value: number | string | boolean | null | IValue, raw: string) {
    if (typeof value === 'number') value = new NumberValue(value)
    else if (typeof value === 'string') value = new StringValue(value)
    else if (typeof value === 'boolean') value = new BooleanValue(value)
    else if (value === null) value = new NullValue()
    this.value = value
    this.raw = `"${raw}"`
  }

  public eval(): IValue {
    return this.value
  }

  public set(value: IValue): IValue {
    throw new Error('Method `Literal.set` not implemented.')
  }

  public define(value: IValue): void {
    throw new Error('Method `Literal.define` not implemented.')
  }

  public hoisting(kind: string): void {
    throw new Error('Method `Literal.hoisting` not implemented.')
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.value.asString()
  }
}
