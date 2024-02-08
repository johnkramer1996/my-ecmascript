import IValue from 'parser/lib/IValue'
import IVisitor from './IVisitor'
import { Location } from 'parser/Parser'
import IExpression from './IExpression'
import NumberValue from 'parser/lib/types/NumberValue'
import StringValue from 'parser/lib/types/StringValue'

export default class Literal implements IExpression {
  public start: number
  public end: number
  public value: IValue
  public raw?: string

  constructor(value: number, raw?: string)
  constructor(value: string, raw: string)
  constructor(value: IValue, raw?: string)
  constructor(value: number | string | IValue, raw: string) {
    if (typeof value === 'number') value = new NumberValue(value)
    else if (typeof value === 'string') value = new StringValue(value)
    this.value = value
    this.start = Location.getPrevToken().getStart()
    this.end = Location.getPrevToken().getEnd()
    this.raw = `"${raw}"`
  }

  public eval(): IValue {
    return this.value
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.value.asString()
  }
}
