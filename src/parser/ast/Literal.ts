import IECMAScriptLanguageType from 'parser/lib/IValue'
import IVisitor from './IVisitor'
import IExpression from './IExpression'
import NumberType from 'parser/lib/types/NumberValue'
import StringType from 'parser/lib/types/StringValue'
import { IAccessible } from './IAccessible'
import { BooleanType } from 'parser/lib/types/BooleanValue'
import NullType from 'parser/lib/types/NullValue'

export default class Literal implements IExpression, IAccessible {
  public value: IECMAScriptLanguageType
  public raw?: string

  constructor(value: number, raw: string)
  constructor(value: string, raw: string)
  constructor(value: boolean, raw: string)
  constructor(value: null, raw: string)
  constructor(value: IECMAScriptLanguageType, raw?: string)
  constructor(value: number | string | boolean | null | IECMAScriptLanguageType, raw: string) {
    if (typeof value === 'number') value = new NumberType(value)
    else if (typeof value === 'string') value = new StringType(value)
    else if (typeof value === 'boolean') value = new BooleanType(value)
    else if (value === null) value = new NullType()
    this.value = value
    this.raw = `"${raw}"`
  }

  public eval(): IECMAScriptLanguageType {
    return this.value
  }

  public set(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    throw new Error('Method `Literal.set` not implemented.')
  }

  public define(value: IECMAScriptLanguageType): void {
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
