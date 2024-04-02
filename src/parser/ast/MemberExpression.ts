import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IValue from 'parser/lib/IValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import { ObjectValue } from 'parser/lib/types/ObjectValue'
import { FunctionValue } from 'parser/lib/types/FunctionValue'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import NumberValue from 'parser/lib/types/NumberValue'
import StringValue from 'parser/lib/types/StringValue'
import BooleanValue from 'parser/lib/types/BooleanValue'

export default class MemberExpression implements IExpression, IAccessible {
  private objectValue!: IValue
  private propertyValue!: IValue
  constructor(
    public object: IExpression,
    public property: IExpression,
    public computed = false,
    public optional = false,
  ) {}

  public eval(): IValue {
    this.objectValue = this.object.eval()
    this.propertyValue = this.property.eval()
    const object = this.getObject(this.objectValue)
    if (object instanceof UndefinedValue) {
      if (!this.optional) throw new Error(`Cannot get properties of undefined ${this.propertyValue.asString()}`)
      return object
    }
    return object.get(this.propertyValue.asString())
  }

  public getThis(): ObjectValue | ArrayValue | UndefinedValue {
    return this.getObject(this.objectValue)
  }

  public set(value: IValue): IValue {
    const object = this.getObject(this.object.eval())
    if (object instanceof UndefinedValue)
      throw new Error(`Cannot set properties of undefined ${this.propertyValue.asString()}`)
    return object.set(this.propertyValue.asString(), value), value
  }

  public delete(): boolean {
    const object = this.getObject(this.object.eval())
    if (object instanceof UndefinedValue)
      throw new Error(`Cannot delete properties of undefined ${this.propertyValue.asString()}`)
    return object.delete(this.propertyValue.asString())
  }

  public define(value: IValue): IValue {
    throw new Error('the container member cannot be defined')
  }

  public hoisting(kind: string): void {
    throw new Error('the container member cannot be hoistinged')
  }

  private getObject(value: IValue): ArrayValue | ObjectValue | UndefinedValue {
    if (value instanceof ObjectValue) return value
    if (value instanceof ArrayValue) return value
    if (value instanceof FunctionValue) return value.raw().getValue()
    if (value instanceof NumberValue) return new ObjectValue(ObjectValue.NumberPrototype)
    if (value instanceof StringValue) return new ObjectValue(ObjectValue.StringPrototype)
    if (value instanceof BooleanValue) return new ObjectValue(ObjectValue.BooleanPrototype)
    return UndefinedValue.UNDEFINED
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    const property = this.computed ? `[${this.property}]` : `.${this.property}`
    const optional = this.optional ? '?' : ''
    return String(`${this.object}${optional}${property}`)
  }
}
