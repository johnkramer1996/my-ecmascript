import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IValue from 'parser/lib/IValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import ObjectValue from 'parser/lib/types/ObjectValue'
import StringValue from 'parser/lib/types/StringValue'
import { Identifier } from './Identifier'

// export default class ContainerAccessExpression implements IExpression, IAccessible {
//   constructor(public variable: Identifier, public indices: IExpression[]) {}

//   public eval(): IValue {
//     return this.getItem(this.get())
//   }

//   public get(): ArrayValue | ObjectValue {
//     const variable = this.variable.get()
//     const container = this.getContainer(this.getObject(variable))
//     return this.getObject(container)
//   }

//   public getName(): string {
//     return this.variable.getName()
//   }

//   public set(value: IValue): IValue {
//     const arrOrObj = this.get()
//     if (arrOrObj instanceof ArrayValue) return arrOrObj.set(this.lastIndex().asNumber(), value), value
//     return arrOrObj.set(this.lastIndex().asString(), value), value
//   }

//   public define(value: IValue): IValue {
//     throw new Error('the container member cannot be defined')
//   }

//   public hoisting(kind: string): void {
//     throw new Error('the container member cannot be hoistinged')
//   }

//   private getContainer(container: ArrayValue | ObjectValue, i = 0): ArrayValue | ObjectValue {
//     if (i === this.indices.length - 1) return container
//     const value = this.getItem(container, i)
//     return this.getContainer(this.getObject(value), ++i)
//   }

//   private getItem(container: ArrayValue | ObjectValue, i = this.indices.length - 1): IValue {
//     return container instanceof ArrayValue
//       ? container.get(this.index(i).asString())
//       : container.get(this.index(i).asString())
//   }

//   private lastIndex(): IValue {
//     return this.index(this.indices.length - 1)
//   }

//   private index(index: number): IValue {
//     return this.indices[index].eval()
//   }

//   private getObject(value: IValue): ArrayValue | ObjectValue {
//     if (value instanceof ArrayValue || value instanceof ObjectValue) return value
//     return new ObjectValue(new Map([['toString', new StringValue('string123')]]))
//   }

//   public accept(visitor: IVisitor): void {
//     visitor.visit(this)
//   }

//   public toString(): string {
//     return String(`${this.variable} ${this.indices}`)
//   }
// }
