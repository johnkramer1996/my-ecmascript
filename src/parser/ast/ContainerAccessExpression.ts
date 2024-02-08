import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IValue from 'parser/lib/IValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import MapValue from 'parser/lib/types/MapValue'
import Variables from 'parser/lib/Variables'
import TypeException from 'exceptions/TypeException'

export default class ContainerAccessExpression implements IAccessible, IExpression {
  constructor(public variable: string, public indices: IExpression[]) {}

  public eval(): IValue {
    return this.getItem(this.get())
  }

  public get(): ArrayValue | MapValue {
    const variable = Variables.get(this.variable)
    this.isArrayOrMapValue(variable)
    const container = this.getContainer(variable)
    this.isArrayOrMapValue(container)
    return container
  }

  public getName(): string {
    return this.variable
  }

  public set(value: IValue): IValue {
    const arrOrObj = this.get()
    if (arrOrObj instanceof ArrayValue) return arrOrObj.set(this.lastIndex().asNumber(), value), value
    return arrOrObj.set(this.lastIndex().asString(), value), value
  }

  public define(value: IValue): IValue {
    throw new Error('the container member cannot be defined')
  }

  private getContainer(container: ArrayValue | MapValue, i: number = 0): ArrayValue | MapValue {
    if (i === this.indices.length - 1) return container
    const value = this.getItem(container, i)
    this.isArrayOrMapValue(value)
    return this.getContainer(value, ++i)
  }

  private getItem(container: ArrayValue | MapValue, i: number = this.indices.length - 1) {
    return container instanceof ArrayValue
      ? container.get(this.index(i).asNumber())
      : container.get(this.index(i).asString())
  }

  private lastIndex(): IValue {
    return this.index(this.indices.length - 1)
  }

  private index(index: number): IValue {
    return this.indices[index].eval()
  }

  private isArrayOrMapValue(value: IValue): asserts value is ArrayValue | MapValue {
    if (!(value instanceof ArrayValue || value instanceof MapValue)) {
      throw new TypeException('Expect map or array')
    }
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return String(`${this.variable} ${this.indices}`)
  }
}
