import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'

export interface IAccessible extends IExpression {
  get(): IValue
  set(value: IValue): IValue
  define(value: IValue): IValue
  getName(): string
}

export const instanceOfIAccessible = (object: any): object is IAccessible => {
  return 'set' in object
}
