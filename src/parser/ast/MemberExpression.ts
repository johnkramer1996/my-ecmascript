import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IECMAScriptLanguageType from 'parser/lib/IValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import { ObjectType } from 'parser/lib/types/ObjectValue'
import { FunctionObjectType } from 'parser/lib/types/FunctionValue'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import NumberType from 'parser/lib/types/NumberValue'
import StringType from 'parser/lib/types/StringValue'
import { BooleanType } from 'parser/lib/types/BooleanValue'

export default class MemberExpression implements IExpression, IAccessible {
  private objectValue!: IECMAScriptLanguageType
  private propertyValue!: IECMAScriptLanguageType
  constructor(
    public object: IExpression,
    public property: IExpression,
    public computed = false,
    public optional = false,
  ) {}

  public eval(): IECMAScriptLanguageType {
    this.objectValue = this.object.eval()
    this.propertyValue = this.property.eval()
    const object = this.getObject(this.objectValue)
    if (object instanceof UndefinedType || object instanceof ArrayValue) {
      if (!this.optional) throw new Error(`Cannot get properties of undefined ${this.propertyValue.asString()}`)
      return object
    }
    const result = object['[[Get]]'](this.propertyValue.asString())['[[Value]]']
    return result
  }

  public getThis(): ObjectType | ArrayValue | UndefinedType {
    return this.getObject(this.objectValue)
  }

  public set(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    const object = this.getObject(this.object.eval())
    if (object instanceof UndefinedType || object instanceof ArrayValue)
      throw new Error(`Cannot set properties of undefined ${this.propertyValue.asString()}`)
    return object['[[Set]]'](this.propertyValue.asString(), value), value
  }

  public delete(): boolean {
    const object = this.getObject(this.object.eval())
    if (object instanceof UndefinedType || object instanceof ArrayValue)
      throw new Error(`Cannot delete properties of undefined ${this.propertyValue.asString()}`)
    return object['[[Delete]]'](this.propertyValue.asString())
  }

  public define(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    throw new Error('the container member cannot be defined')
  }

  public hoisting(kind: string): void {
    throw new Error('the container member cannot be hoistinged')
  }

  private getObject(value: IECMAScriptLanguageType): ArrayValue | ObjectType | UndefinedType {
    if (value instanceof ObjectType) return value
    if (value instanceof ArrayValue) return value
    if (value instanceof NumberType) return new ObjectType(ObjectType.NumberPrototype)
    if (value instanceof StringType) return new ObjectType(ObjectType.StringPrototype)
    if (value instanceof BooleanType) return new ObjectType()
    return UndefinedType.UNDEFINED
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
