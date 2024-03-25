import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IValue from 'parser/lib/IValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import ObjectValue from 'parser/lib/types/ObjectValue'
import { FunctionValue } from 'parser/lib/types/FunctionValue'

export default class MemberExpression implements IExpression, IAccessible {
  private result!: IValue
  constructor(
    public object: IExpression,
    public property: IExpression,
    public computed = false,
    public optional = false,
  ) {}

  public eval(): IValue {
    this.result = this.object.eval()
    return this.get()
  }

  public getThis(): ObjectValue | ArrayValue {
    return this.getObject(this.result)
  }

  public get(): IValue {
    return this.getObject(this.result).get(this.property.eval().asString())
  }

  public set(value: IValue): IValue {
    const object = this.getObject(this.object.eval())
    object.set(this.property.eval().asString(), value)
    return value
  }

  public define(value: IValue): IValue {
    throw new Error('the container member cannot be defined')
  }

  public hoisting(kind: string): void {
    throw new Error('the container member cannot be hoistinged')
  }

  private getObject(value: IValue): ArrayValue | ObjectValue {
    if (value instanceof ArrayValue || value instanceof ObjectValue) return value
    if (value instanceof FunctionValue) return value.raw().getValue()
    return new ObjectValue(
      null,
      // new Map([
      //   [
      //     'toString',
      //     new FunctionValue({
      //       call(...args) {
      //         const _this = Variables.get('this')
      //         return new StringValue(_this.asString())
      //       },
      //       toString() {
      //         return '[Native code]'
      //       },
      //     }),
      //   ],
      // ]),
    )
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
