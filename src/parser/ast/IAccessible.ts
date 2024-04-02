import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'

export interface IAccessible extends IExpression {
  set(value: IValue): IValue
  define(value: IValue): void
  hoisting(kind: string): void
  // getName(): string
}

export const instanceOfIAccessible = (object: any): object is IAccessible => {
  return 'set' in object
}
