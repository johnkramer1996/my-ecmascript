import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IValue from 'parser/lib/IValue'
import { Variables } from 'parser/lib/Variables'
import ArrayValue from 'parser/lib/types/ArrayValue'
import BooleanValue from 'parser/lib/types/BooleanValue'
import IExpression from './IExpression'

export class ArrayPattern implements IExpression, IAccessible, Iterable<IAccessible> {
  constructor(public elements: IAccessible[]) {}

  public eval(): IValue {
    return Variables.get(this.getName())
  }

  public set(value: IValue): IValue {
    if (!(value instanceof ArrayValue)) throw new Error('expect array')
    this.elements.forEach((variable, i) => variable.set(value.get(String(i))))
    return BooleanValue.FALSE
  }

  public define(value: IValue): IValue {
    if (!(value instanceof ArrayValue)) throw new Error('expect array')
    this.elements.forEach((variable, i) => variable.define(value.get(String(i))))
    return BooleanValue.FALSE
  }

  public hoisting(kind: string): void {
    this.elements.forEach((variable) => variable.hoisting(kind))
  }

  public getName(): string {
    return ''
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public [Symbol.iterator](): Iterator<IAccessible> {
    return this.elements[Symbol.iterator]()
  }
}
